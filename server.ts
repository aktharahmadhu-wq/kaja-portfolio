import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";
import { PUBLICATIONS, PERSONAL_INFO, LEADERSHIP_ROLES } from "./src/data";

dotenv.config();

const app = express();
app.use(express.json());

const PORT = 3000;

// Lazy initialization of GoogleGenAI to ensure the server doesn't crash if the key is missing on start
let cleanApiKey = process.env.GEMINI_API_KEY;
if (cleanApiKey && (cleanApiKey.trim() === "" || cleanApiKey.includes("MY_GEMINI_API_KEY"))) {
  cleanApiKey = undefined;
}

let aiClient: GoogleGenAI | null = null;

function getAiClient(): GoogleGenAI {
  if (!cleanApiKey) {
    throw new Error("GEMINI_API_KEY environment variable is not configured in Secrets.");
  }
  if (!aiClient) {
    aiClient = new GoogleGenAI({
      apiKey: cleanApiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build'
        }
      }
    });
  }
  return aiClient;
}

// In-memory array for contact form submissions (transient persistence)
interface InmemoryInquiry {
  id: string;
  name: string;
  email: string;
  message: string;
  timestamp: string;
}
const inquiries: InmemoryInquiry[] = [];

// 1. Publications API route with search and tagging filters
app.get("/api/publications", (req, res) => {
  const query = (req.query.q as string || "").toLowerCase().trim();
  const category = (req.query.category as string || "").toLowerCase().trim();

  let filtered = [...PUBLICATIONS];

  if (category && category !== "all") {
    filtered = filtered.filter(p => p.category.toLowerCase() === category);
  }

  if (query) {
    filtered = filtered.filter(p => 
      p.title.toLowerCase().includes(query) ||
      p.journal.toLowerCase().includes(query) ||
      (p.abstract && p.abstract.toLowerCase().includes(query))
    );
  }

  res.json({ publications: filtered });
});

// 2. Transmitting and holding Contact Inquiries (No mock/simulated interfaces!)
app.post("/api/inquiries", (req, res) => {
  const { name, email, message } = req.body;
  if (!name || !email || !message) {
    res.status(400).json({ error: "ALL_FIELDS_REQUIRED", message: "Name, email, and message are required." });
    return;
  }

  const newInquiry: InmemoryInquiry = {
    id: `inq-${Date.now()}`,
    name,
    email,
    message,
    timestamp: new Date().toISOString()
  };

  inquiries.push(newInquiry);
  // Optional: keep log length clean
  if (inquiries.length > 50) {
    inquiries.shift();
  }

  res.status(201).json({ success: true, inquiry: newInquiry });
});

// Get current inquiries (useful for testing and transparency within the developer dashboard or admin drawer)
app.get("/api/inquiries", (req, res) => {
  res.json({ inquiries });
});

// 3. Smart Search AI endpoint (like Google Search's AI Overviews)
app.post("/api/search-ai", async (req, res) => {
  const { prompt } = req.body;
  
  if (!prompt || prompt.trim() === "") {
    res.status(400).json({ error: "PROMPT_REQUIRED", message: "A query stream is required." });
    return;
  }

  try {
    const ai = getAiClient();

    // Prepare context rich system instruction defining who the AI represents
    const systemInstruction = `
You are the intelligent digital portfolio assistant representing Dr. Pa. Kaja Mohideen, Ph.D.
He is an esteemed Emeritus Professor & Academic Leader with over 20 years of research experience in Indian Agricultural Economics and Urbanization at Abdul Hakeem College in Melvisharam, TN, India.

Your job is to answer the user's questions in a clear, concise, objective, and scholarly manner.
Represent Dr. Mohideen's work and answer based on this grounding facts:
- Name: ${PERSONAL_INFO.name}
- Title: ${PERSONAL_INFO.title}
- Background: ${PERSONAL_INFO.bio}
- Leadership Positions: Chairman of Board of Studies (BoS) in Economics at Thiruvalluvar University; Research Supervisor at Thiruvalluvar & Bharathiar Universities; Head of Economics at C. Abdul Hakeem College.
- Landmark Research Areas:
  1. Indian Agricultural Economics: credit systems, cropping finance, crop insurance, and microfinance networks (e.g. self-help and joint liability groups).
  2. Urbanization: rural-urban migration behaviors, census trends, resource allocation, and metropolitan disparities.
- Selected Key Publications:
  ${PUBLICATIONS.map(p => `- "${p.title}" (${p.year}, published in ${p.journal}) - Context: ${p.abstract}`).join("\n  ")}

Guidelines for response:
- Ensure the tone matches the prestigious, warm, and highly intellectual aesthetic of Dr. Mohideen.
- Highlight how his research directly addresses the user's inquiry (such as quoting crop finance models, urbanization trends in Tamil Nadu, or emerging markets resilience).
- Keep formatting readable with bold key terms or short bullets.
- Mention Dr. Mohideen's contact (${PERSONAL_INFO.email} or location) if the user inquires about advisory roles, collaborations, research supervisions, or key lectures.
- Keep the response concise, under 300 words. Do not make up facts.
`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        systemInstruction,
        temperature: 0.7,
      }
    });

    res.json({ 
      success: true, 
      answer: response.text,
      poweredBy: "gemini-3.5-flash"
    });

  } catch (error: any) {
    console.error("AI Search Error:", error);
    
    // Graceful fallback for demo or when API is missing
    const promptLower = prompt.toLowerCase();
    let fallbackText = "";

    if (promptLower.includes("agriculture") || promptLower.includes("crop") || promptLower.includes("rural") || promptLower.includes("farming")) {
      fallbackText = `Here is an automated matching of Dr. Pa. Kaja Mohideen's primary research in **Agricultural Economics**:\n\n` +
                     `- **Specialty**: Credit networks, production cycles, and institutional banking.\n` +
                     `- **Core Publication**: *"Bank Finance to Agricultural Production in India"* (Oxford Press Anthology, 2022).\n` +
                     `- **Actionable Idea**: His works highlight a direct correlation between timely-disbursed microloans through Joint Liability Groups and increased cropping efficiency.\n\n` +
                     `*Note: Set up your GEMINI_API_KEY in Settings > Secrets to activate real-time generative responses.*`;
    } else if (promptLower.includes("urban") || promptLower.includes("migration") || promptLower.includes("city") || promptLower.includes("town")) {
      fallbackText = `Here is an automated matching of Dr. Pa. Kaja Mohideen's research on **Urbanization**:\n\n` +
                     `- **Specialty**: Census study mapping the economic shifts of urban development in the 21st century.\n` +
                     `- **Core Publication**: *"An Overview of Urbanization in India: Trends and Economic Impact"* (Economic Gazette, 2024).\n` +
                     `- **Actionable Idea**: Rapid metropolitan expansion requires balanced infrastructure credit policies to prevent steep socio-economic gaps.\n\n` +
                     `*Note: Set up your GEMINI_API_KEY in Settings > Secrets to activate real-time generative responses.*`;
    } else if (promptLower.includes("phd") || promptLower.includes("student") || promptLower.includes("supervis") || promptLower.includes("guide")) {
      fallbackText = `Dr. Pa. Kaja Mohideen is an empaneled research supervisor at both **Thiruvalluvar & Bharathiar Universities**. He has successfully guided **8 Ph.D. scholars** through their dissertations. For inquiries regarding research positions or doctoral opportunities under his supervision, please fill out the contact form below or reach out directly at *${PERSONAL_INFO.email}*.\n\n` +
                     `*Note: Set up your GEMINI_API_KEY in Settings > Secrets to activate real-time generative responses.*`;
    } else {
      fallbackText = `Thank you for searching Dr. Pa. Kaja Mohideen's portfolio. Since you queried *"**${prompt}**"*, here is a summary of his scholarly background:\n\n` +
                     `- **Department Head**: Economics Dept. at C. Abdul Hakeem College.\n` +
                     `- **Expertise Areas**: Indian Agricultural policy, microfinance, emerging market resilience, and urbanization trends.\n` +
                     `- **Achievements**: Guided 8 Ph.D. students, 20+ years of active lecturing, and author of 4 economics textbook anthologies.\n\n` +
                     `Please feel free to submit an formal inquiry through the Contact section to explore collaborations or lectures.\n\n` +
                     `*(To unlock smart generative assistance, configure your GEMINI_API_KEY in the Secrets menu)*`;
    }

    res.json({ 
      success: false, 
      answer: fallbackText,
      poweredBy: "Local Search Fallback",
      message: error.message || "Gemini API failed to load"
    });
  }
});

// 4. Vite middleware Integration for development, fallback assets for production
const startServer = async () => {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running in ${process.env.NODE_ENV || "development"} mode on http://localhost:${PORT}`);
  });
};

startServer().catch((err) => {
  console.error("Failed to start server:", err);
});
