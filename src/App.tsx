import React, { useState, useEffect, useRef } from "react";
import { 
  Search, 
  Award, 
  BookOpen, 
  Mail, 
  MapPin, 
  School, 
  Menu, 
  X, 
  ChevronRight, 
  Download, 
  Sparkles, 
  Calendar, 
  User, 
  CheckCircle2, 
  MessageSquare, 
  Send, 
  History, 
  Quote, 
  FileText, 
  Settings,
  ArrowRight,
  Database,
  ThumbsUp,
  ExternalLink
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { PERSONAL_INFO, ACHIEVEMENTS, RESEARCH_AREAS, MILESTONES, PUBLICATIONS, LEADERSHIP_ROLES, GALLERY_ITEMS, ASSETS } from "./data";
import { Publication, Milestone, Inquiry } from "./types";

export default function App() {
  // Navigation & Sizing states
  const [activeSection, setActiveSection] = useState("home");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [adminDrawerOpen, setAdminDrawerOpen] = useState(false);

  // Search Centre States
  const [searchTab, setSearchTab] = useState<"local" | "ai">("local");
  const [searchQuery, setSearchQuery] = useState("");
  const [aiPrompt, setAiPrompt] = useState("");
  const [aiLoading, setAiLoading] = useState(false);
  const [aiResult, setAiResult] = useState<{ answer: string; poweredBy: string; success?: boolean } | null>(null);
  const [loadingStep, setLoadingStep] = useState(0);

  // Publications Filter States
  const [selectedPubCategory, setSelectedPubCategory] = useState<string>("all");
  const [filteredPublications, setFilteredPublications] = useState<Publication[]>(PUBLICATIONS);

  // Contact form submission states
  const [contactName, setContactName] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [contactMessage, setContactMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<{ type: "success" | "error"; message: string } | null>(null);

  // Submitted Inquiries (Auditing) State
  const [submittedInquiries, setSubmittedInquiries] = useState<Inquiry[]>([]);

  // Loading steps text for AI grounded search
  const loadingMessages = [
    "Grounding with Dr. Mohideen's publications...",
    "Injecting census urbanization metrics...",
    "Consulting agricultural credit frameworks...",
    "Synthesizing citation-aligned expert response..."
  ];

  // Rotate loading steps while AI assistant processes
  useEffect(() => {
    let interval: any;
    if (aiLoading) {
      interval = setInterval(() => {
        setLoadingStep((prev) => (prev + 1) % loadingMessages.length);
      }, 2200);
    } else {
      setLoadingStep(0);
    }
    return () => clearInterval(interval);
  }, [aiLoading]);

  // Fetch publications from Express server on search/filter update
  useEffect(() => {
    const fetchFilteredPublications = async () => {
      try {
        const response = await fetch(`/api/publications?q=${encodeURIComponent(searchQuery)}&category=${encodeURIComponent(selectedPubCategory)}`);
        if (response.ok) {
          const data = await response.json();
          setFilteredPublications(data.publications);
        }
      } catch (err) {
        console.error("Local filter request failed, performing client-side fallback:", err);
        // Fallback filter
        let res = PUBLICATIONS.filter(p => {
          const matchesCategory = selectedPubCategory === "all" || p.category.toLowerCase() === selectedPubCategory.toLowerCase();
          const matchesQuery = p.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                               p.journal.toLowerCase().includes(searchQuery.toLowerCase()) ||
                               (p.abstract && p.abstract.toLowerCase().includes(searchQuery.toLowerCase()));
          return matchesCategory && matchesQuery;
        });
        setFilteredPublications(res);
      }
    };

    fetchFilteredPublications();
  }, [searchQuery, selectedPubCategory]);

  // Load inquiries to keep our custom Inbox panel synced
  const fetchInquiries = async () => {
    const localInqs = JSON.parse(localStorage.getItem("netlify_inquiries") || "[]");
    try {
      const resp = await fetch("/api/inquiries");
      if (resp.ok) {
        const data = await resp.json();
        const serverInquiries = data.inquiries || [];
        setSubmittedInquiries([...serverInquiries, ...localInqs]);
      } else {
        setSubmittedInquiries(localInqs);
      }
    } catch (e) {
      console.error("Inquiries fetch failed, falling back to offline records:", e);
      setSubmittedInquiries(localInqs);
    }
  };

  useEffect(() => {
    fetchInquiries();
  }, []);

  // Synchronize navigation active indicators smoothly based on viewport scroll position
  useEffect(() => {
    const sections = ["home", "search-centre", "about", "qualifications", "publications", "contact"];
    const observerOptions = {
      root: null,
      rootMargin: "-25% 0px -55% 0px", // Trigger when the section occupies the critical reading sweet spot
      threshold: 0.1
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          setActiveSection(entry.target.id);
        }
      });
    }, observerOptions);

    sections.forEach((id) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });

    return () => {
      sections.forEach((id) => {
        const el = document.getElementById(id);
        if (el) observer.unobserve(el);
      });
    };
  }, []);

  // Handle AI Search Inquiry submission
  const handleAiSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!aiPrompt.trim()) return;

    setAiLoading(true);
    setAiResult(null);

    try {
      const response = await fetch("/api/search-ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: aiPrompt })
      });

      const data = await response.json();
      setAiResult({
        answer: data.answer || "No response received.",
        poweredBy: data.poweredBy || "Gemini 3.5 Flash",
        success: data.success
      });
    } catch (err) {
      console.error("AI Assistant request failed:", err);
      setAiResult({
        answer: "Connection to the academic coordinator offline. Please verify that your dev server is active and configured appropriately.",
        poweredBy: "Error Handled Fallback",
        success: false
      });
    } finally {
      setAiLoading(false);
    }
  };

  // Pre-seed an AI prompt from sample chips
  const handleSamplePromptClick = (promptText: string) => {
    setSearchTab("ai");
    setAiPrompt(promptText);
    // Smooth scroll to the Search Centre if user clicked it elsewhere
    const elem = document.getElementById("search-centre");
    if (elem) elem.scrollIntoView({ behavior: "smooth" });
  };

  // Submit contact inquiry form
  const handleContactSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!contactName.trim() || !contactEmail.trim() || !contactMessage.trim()) {
      setSubmitStatus({ type: "error", message: "All fields are required before sending." });
      return;
    }

    setIsSubmitting(true);
    setSubmitStatus(null);

    try {
      const res = await fetch("/api/inquiries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: contactName,
          email: contactEmail,
          message: contactMessage
        })
      });

      if (res.ok) {
        setSubmitStatus({ type: "success", message: "Your inquiry has been stored successfully. View the Inquiry Inbox drawer to verify dynamic storage!" });
        setContactName("");
        setContactEmail("");
        setContactMessage("");
        fetchInquiries(); // refresh local admin panel tracking
      } else {
        const errData = await res.json();
        setSubmitStatus({ type: "error", message: errData.message || "Failed to submit inquiry to server." });
      }
    } catch (err) {
      // Netlify static/offline hybrid mode fallback: save directly to localStorage so the application works completely
      const offlineInq: Inquiry = {
        name: contactName,
        email: contactEmail,
        message: contactMessage,
        timestamp: new Date().toISOString()
      };
      
      const stored = JSON.parse(localStorage.getItem("netlify_inquiries") || "[]");
      stored.unshift(offlineInq);
      localStorage.setItem("netlify_inquiries", JSON.stringify(stored));
      
      setSubmitStatus({ 
        type: "success", 
        message: "Your inquiry has been stored successfully (Local Mode). Open the Inbox Drawer to view your submission!" 
      });
      setContactName("");
      setContactEmail("");
      setContactMessage("");
      fetchInquiries(); // refresh local admin panel tracking
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-brand-surface text-brand-on-surface font-sans selection:bg-brand-secondary/25 selection:text-brand-on-surface flex flex-col">
      
      {/* Dynamic Overlay Header for Top Nav bar on Screens & Mobile Header banner */}
      <header className="fixed top-0 left-0 lg:left-64 right-0 h-16 bg-white/75 backdrop-blur-md border-b border-gray-100 z-30 flex items-center justify-between px-6 lg:px-8">
        
        {/* Toggle Button for Sidebar Drawer on Mobile */}
        <button 
          id="mobile-drawer-btn"
          aria-label="Toggle Navigation Drawer"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="lg:hidden p-2 rounded-md hover:bg-gray-100 transition-colors"
        >
          {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>

        {/* Brand visual naming on top header for small viewports only */}
        <div className="lg:hidden flex items-center gap-2">
          <BookOpen className="h-5 w-5 text-brand-secondary" />
          <span className="font-display font-semibold text-lg tracking-tight">Kaja Mohideen</span>
        </div>

        {/* Right side helper info: Real-Time Verification indicator */}
        <div className="flex items-center gap-3">
          <button 
            onClick={() => handleSamplePromptClick("What is Dr. Mohideen's background and publications ?")}
            className="hidden sm:flex items-center gap-1.5 px-3 py-1 bg-brand-secondary/10 hover:bg-brand-secondary/20 rounded-full text-brand-secondary text-xs font-semibold tracking-wide transition-colors"
          >
            <Sparkles className="h-3 w-3" />
            AI Query Prompt
          </button>
          
          <button 
            id="academic-cv-download-nav"
            onClick={() => window.open("#", "_blank")}
            className="text-xs px-4 py-2 border border-brand-primary font-subheading uppercase font-semibold text-brand-primary tracking-wide hover:bg-brand-primary hover:text-white transition-all rounded-xs"
          >
            Academic CV
          </button>
        </div>
      </header>

      {/* Persistence and Verification Alert (Desktop rail indicator) */}
      <div className="fixed bottom-4 right-4 z-40">
        <button 
          id="inbx-drawer-btn"
          onClick={() => setAdminDrawerOpen(true)}
          className="bg-brand-primary text-white shadow-xl hover:bg-brand-secondary hover:text-white transition-all duration-300 font-subheading flex items-center gap-2 px-4 py-3 rounded-full text-xs font-bold tracking-wide border border-brand-secondary/20"
        >
          <Database className="h-4 w-4" />
          Inquiry Inbox Drawer ({submittedInquiries.length})
        </button>
      </div>

      {/* Large Screen Fixed Sidebar Navigation Layout */}
      <aside className="hidden lg:flex flex-col fixed left-0 top-0 bottom-0 w-64 bg-white border-r border-gray-100 z-35 p-6 shadow-sm overflow-y-auto justify-between">
        <div className="space-y-8">
          <div>
            <h1 className="font-display text-2xl font-bold tracking-tight text-brand-primary">Dr. Mohideen</h1>
            <p className="text-xs text-brand-secondary font-subheading tracking-widest font-semibold uppercase mt-1">Distinguished Professor</p>
          </div>

          {/* Nav Item selectors conforming to standard visual structure */}
          <nav className="flex flex-col gap-1.5">
            {[
              { id: "home", label: "Home", icon: User },
              { id: "search-centre", label: "Smart Search Center", icon: Search },
              { id: "about", label: "Academic Focus", icon: School },
              { id: "qualifications", label: "Academic Journey", icon: History },
              { id: "publications", label: "Scholarly Works", icon: FileText },
              { id: "contact", label: "Connect & Inquire", icon: Mail }
            ].map((item) => {
              const Icon = item.icon;
              const isActive = activeSection === item.id;
              return (
                <a
                  key={item.id}
                  href={`#${item.id}`}
                  onClick={() => setActiveSection(item.id)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-subheading transition-all duration-200 ${
                    isActive 
                      ? "text-brand-secondary bg-brand-surface-container font-semibold" 
                      : "text-brand-on-surface-variant hover:text-brand-primary hover:bg-brand-surface/50"
                  }`}
                >
                  <Icon className={`h-4 w-4 ${isActive ? "text-brand-secondary" : "text-brand-on-surface-variant/70"}`} />
                  <span>{item.label}</span>
                </a>
              );
            })}
          </nav>
        </div>

        {/* Sidebar Footer with download button matching UI guidelines */}
        <div className="space-y-4 pt-6 border-t border-gray-100">
          <p className="text-[11px] text-brand-on-surface-variant/60 leading-relaxed font-sans">
            Head of Economics Dept. at C. Abdul Hakeem College. Former Chairman BoS.
          </p>
          <a
            id="download-portfolio-btn"
            href={PERSONAL_INFO.portfolioDownloadUrl}
            className="flex items-center justify-center gap-2 w-full py-3 bg-brand-secondary hover:bg-brand-primary text-white hover:text-white transition-colors duration-200 rounded-lg text-xs font-subheading font-bold tracking-wider uppercase text-center cursor-pointer shadow-sm"
          >
            <Download className="h-3.5 w-3.5" />
            Download Portfolio
          </a>
        </div>
      </aside>

      {/* Mobile Drawer Overlay Navigation menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <div className="fixed inset-0 z-40 lg:hidden flex">
            {/* dark backing drop */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileMenuOpen(false)}
              className="fixed inset-0 bg-black"
            />

            {/* sliding list container */}
            <motion.div 
              initial={{ translateX: "-100%" }}
              animate={{ translateX: 0 }}
              exit={{ translateX: "-100%" }}
              transition={{ type: "tween", duration: 0.3 }}
              className="relative w-72 bg-white h-full p-6 flex flex-col justify-between shadow-2xl z-50 text-left"
            >
              <div className="space-y-8">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="font-display text-xl font-bold tracking-tight text-brand-primary">{PERSONAL_INFO.name}</h2>
                    <p className="text-[10px] text-brand-secondary font-semibold uppercase tracking-widest mt-0.5">Economic Authority</p>
                  </div>
                  <button 
                    onClick={() => setMobileMenuOpen(false)}
                    className="p-2 text-gray-500 hover:text-brand-primary hover:bg-gray-100 rounded-lg"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>

                <nav className="flex flex-col gap-1">
                  {[
                    { id: "home", label: "Home", icon: User },
                    { id: "search-centre", label: "Smart Search Center", icon: Search },
                    { id: "about", label: "Academic Focus", icon: School },
                    { id: "qualifications", label: "Academic Journey", icon: History },
                    { id: "publications", label: "Scholarly Works", icon: FileText },
                    { id: "contact", label: "Connect & Inquire", icon: Mail }
                  ].map((item) => {
                    const Icon = item.icon;
                    return (
                      <a
                        key={item.id}
                        href={`#${item.id}`}
                        onClick={() => {
                          setActiveSection(item.id);
                          setMobileMenuOpen(false);
                        }}
                        className="flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-subheading text-brand-on-surface-variant hover:bg-gray-100 hover:text-brand-primary transition-all text-left"
                      >
                        <Icon className="h-4 w-4 text-brand-secondary" />
                        <span>{item.label}</span>
                      </a>
                    );
                  })}
                </nav>
              </div>

              <div className="space-y-4 pt-6 border-t border-gray-100 text-left">
                <p className="text-[11px] text-brand-on-surface-variant/70 leading-relaxed font-sans">
                  Available for research guidance, policy advisory, and scholarly guest lectures.
                </p>
                <a
                  href={PERSONAL_INFO.portfolioDownloadUrl}
                  className="flex items-center justify-center gap-2 w-full py-3 bg-brand-secondary text-white rounded-lg text-xs font-subheading font-bold tracking-wider uppercase"
                >
                  <Download className="h-3.5 w-3.5" />
                  Download Portfolio
                </a>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Main Container with offset spacing for permanent desktop sidebar */}
      <main className="lg:ml-64 flex-grow flex flex-col pt-16">
        
        {/* Section 1: Hero Banner Area with Blurred University Library Art */}
        <section id="home" className="relative min-h-[560px] lg:min-h-[640px] flex items-center px-6 lg:px-12 py-12 overflow-hidden border-b border-gray-100">
          <div className="absolute inset-0 z-0 select-none pointer-events-none">
            <img 
              alt="Dr. Pa. Kaja Mohideen University Library Heritage Background View" 
              className="w-full h-full object-cover opacity-5 grayscale scale-105 pointer-events-none"
              src={ASSETS.heroBackground}
            />
            {/* Ambient vignette background colors */}
            <div className="absolute inset-0 bg-gradient-to-r from-brand-surface via-brand-surface/95 to-transparent" />
          </div>

          <div className="relative z-10 max-w-3xl text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-white border border-gray-200 rounded-full mb-6">
              <span className="w-2 h-2 rounded-full bg-brand-secondary animate-pulse" />
              <span className="text-[10px] text-brand-secondary font-subheading select-none font-bold tracking-widest uppercase">EMERITUS EXCELLENCE</span>
            </div>

            <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-brand-primary leading-[1.1] mb-6">
              {PERSONAL_INFO.name}, Ph.D.
            </h1>
            
            <p className="font-subheading text-lg sm:text-xl lg:text-2xl text-brand-on-surface-variant font-medium mb-8 border-l-4 border-brand-secondary pl-6 leading-relaxed">
              {PERSONAL_INFO.subtitle}
            </p>

            <p className="font-sans text-brand-on-surface/90 text-sm sm:text-base leading-relaxed max-w-2xl mb-10">
              {PERSONAL_INFO.bio}
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-wrap gap-4">
              <a 
                href="#search-centre"
                className="px-8 py-3.5 bg-brand-primary text-white hover:text-white font-subheading text-xs font-bold tracking-widest uppercase hover:bg-brand-secondary transform active:scale-95 transition-all outline-none rounded-xs shadow-sm shadow-black/10 text-center"
              >
                Query Studies
              </a>
              <a 
                href="#publications"
                className="px-8 py-3.5 border border-brand-primary text-brand-primary hover:bg-brand-primary hover:text-white text-xs font-bold tracking-widest uppercase font-subheading transform active:scale-95 transition-all outline-none rounded-xs text-center"
              >
                Scholarly Works
              </a>
            </div>
          </div>
        </section>

        {/* Metrics/Achievements Dashboard with modern visual structures */}
        <section className="bg-brand-surface-container py-12 px-6 lg:px-12 border-b border-gray-100">
          <div className="max-w-6xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-6">
            {ACHIEVEMENTS.map((metric) => (
              <div 
                key={metric.id}
                className="bg-white/80 p-6 md:p-8 text-center rounded-xl border border-white/60 shadow-sm shadow-gray-200/50 hover:shadow-md transition-shadow"
              >
                <div className="text-brand-secondary font-display text-3xl sm:text-4xl lg:text-5xl font-bold mb-2">
                  {metric.value}
                </div>
                <div className="font-subheading text-[11px] md:text-xs font-bold uppercase tracking-wider text-brand-on-surface-variant">
                  {metric.label}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Centerpiece: Center Smart Google-Style Search & Chat Centre */}
        <section id="search-centre" className="py-16 px-6 lg:px-12 bg-white border-b border-gray-100">
          <div className="max-w-4xl mx-auto text-center space-y-8">
            <div className="space-y-3">
              <div className="inline-flex items-center gap-1.5 text-xs text-brand-secondary font-bold font-subheading uppercase tracking-wider">
                <Sparkles className="h-4 w-4" />
                Cognitive Search Hub
              </div>
              <h2 className="font-display text-3xl lg:text-4xl font-bold tracking-tight text-brand-primary">
                Google Academic Search
              </h2>
              <p className="text-sm text-brand-on-surface-variant max-w-xl mx-auto font-sans leading-relaxed">
                Filter through Dr. Mohideen's citations instantly, or activate the smart **Gemini Artificial Scholar** to query complex economic frameworks.
              </p>
            </div>

            {/* Smart Google-like Tab Selector */}
            <div className="flex items-center justify-center border-b border-gray-100 max-w-md mx-auto relative select-none">
              <button 
                id="search-tab-publications"
                onClick={() => setSearchTab("local")}
                className={`flex items-center gap-2 px-6 py-3 font-subheading text-xs uppercase font-bold tracking-wide relative z-10 transition-colors duration-350 cursor-pointer ${
                  searchTab === "local" 
                    ? "text-brand-secondary" 
                    : "text-brand-on-surface-variant hover:text-brand-primary"
                }`}
              >
                <BookOpen className="h-3.5 w-3.5" />
                Publication Index 
                {searchTab === "local" && (
                  <motion.div 
                    layoutId="activeTabUnderline"
                    className="absolute bottom-0 left-0 right-0 h-0.5 bg-brand-secondary z-0"
                    transition={{ type: "spring", stiffness: 350, damping: 28 }}
                  />
                )}
              </button>
              <button 
                id="search-tab-ai"
                onClick={() => setSearchTab("ai")}
                className={`flex items-center gap-2 px-6 py-3 font-subheading text-xs uppercase font-bold tracking-wide relative z-10 transition-colors duration-350 cursor-pointer ${
                  searchTab === "ai" 
                    ? "text-brand-secondary" 
                    : "text-brand-on-surface-variant hover:text-brand-primary"
                }`}
              >
                <Sparkles className="h-3.5 w-3.5 text-brand-secondary" />
                Gemini Academic IA
                {searchTab === "ai" && (
                  <motion.div 
                    layoutId="activeTabUnderline"
                    className="absolute bottom-0 left-0 right-0 h-0.5 bg-brand-secondary z-0"
                    transition={{ type: "spring", stiffness: 350, damping: 28 }}
                  />
                )}
              </button>
            </div>

            {/* Real Search Box Rendered precisely like Google Home with Smooth Transitions */}
            <div className="max-w-2xl mx-auto overflow-hidden">
              <AnimatePresence mode="wait">
                {searchTab === "local" ? (
                  /* Instant local search system */
                  <motion.div 
                    key="search-local-panel"
                    initial={{ opacity: 0, x: -12 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 12 }}
                    transition={{ duration: 0.25, ease: "easeInOut" }}
                    className="relative group text-left"
                  >
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400 group-focus-within:text-brand-secondary transition-colors">
                      <Search className="h-5 w-5" />
                    </div>
                    <input
                      id="publication-keyword-search"
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search titles, metrics, journals, abstracts..."
                      className="w-full text-sm py-4.5 pl-12 pr-16 bg-brand-surface border border-gray-200 rounded-full focus:outline-none focus:border-brand-secondary focus:ring-1 focus:ring-brand-secondary/30 transition-all text-brand-primary font-sans"
                    />
                    {searchQuery && (
                      <button 
                        onClick={() => setSearchQuery("")}
                        className="absolute right-4 top-1/2 -translate-y-1/2 p-1 text-xs text-gray-400 hover:text-brand-primary hover:bg-gray-200 rounded-full"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    )}
                    <p className="mt-2 text-xs text-brand-on-surface-variant/70 pl-4">
                      Type keywords like <span className="font-semibold select-all text-brand-secondary">Urbanization</span> or <span className="font-semibold select-all text-brand-secondary">Banking</span> to quickly filter his papers on the fly.
                    </p>
                  </motion.div>
                ) : (
                  /* Gemini AI generated assistant */
                  <motion.form 
                    key="search-ai-panel"
                    initial={{ opacity: 0, x: 12 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -12 }}
                    transition={{ duration: 0.25, ease: "easeInOut" }}
                    onSubmit={handleAiSearch} 
                    className="space-y-4 text-left"
                  >
                    <div className="relative group">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-brand-secondary transition-colors">
                        <Sparkles className="h-5 w-5" />
                      </div>
                      <input
                        id="ai-assistant-text-prompt"
                        type="text"
                        value={aiPrompt}
                        onChange={(e) => setAiPrompt(e.target.value)}
                        placeholder="Ask the Scholar AI about Indian agricultural credit or rural urbanization..."
                        className="w-full text-sm py-4.5 pl-12 pr-16 bg-brand-surface border border-gray-200 rounded-full focus:outline-none focus:border-brand-secondary focus:ring-1 focus:ring-brand-secondary/30 transition-all text-brand-primary font-sans"
                      />
                      <button
                        id="ai-assistant-submit-btn"
                        type="submit"
                        disabled={aiLoading || !aiPrompt.trim()}
                        className="absolute right-2.5 top-1/2 -translate-y-1/2 p-2.5 bg-brand-primary hover:bg-brand-secondary text-white rounded-full disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                      >
                        <Send className="h-4 w-4" />
                      </button>
                    </div>

                    {/* Suggestion prompt quick-clicks */}
                    <div className="flex flex-wrap gap-2 items-center justify-center sm:justify-start pl-2">
                      <span className="text-[11px] text-brand-on-surface-variant/80 font-semibold font-subheading uppercase">SUGGESTIONS:</span>
                      {[
                        "Explain Dr. Mohideen's studies on urbanization.",
                        "What has he written about Indian agricultural credit?",
                        "How can I contact him for PhD supervision?"
                      ].map((sPrompt, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => setAiPrompt(sPrompt)}
                          className="text-xs px-3 py-1.5 bg-brand-surface-container hover:bg-brand-secondary/10 hover:text-brand-secondary rounded-full transition-colors font-sans text-brand-on-surface-variant"
                        >
                          {sPrompt}
                        </button>
                      ))}
                    </div>
                  </motion.form>
                )}
              </AnimatePresence>
            </div>

            {/* AI Assistant Output Screen */}
            <AnimatePresence>
              {searchTab === "ai" && (aiLoading || aiResult) && (
                <motion.div 
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -15 }}
                  className="max-w-2xl mx-auto text-left"
                >
                  <div className="bg-brand-surface-container rounded-2xl p-6 md:p-8 border border-gray-200 space-y-4 shadow-sm relative overflow-hidden">
                    
                    {/* Top title with engine model indicator */}
                    <div className="flex items-center justify-between border-b border-gray-300/50 pb-3">
                      <div className="flex items-center gap-2">
                        <Sparkles className="h-4 w-4 text-brand-secondary animate-pulse" />
                        <span className="font-subheading text-[11px] font-bold uppercase tracking-widest text-brand-primary">AI SCHOLAR SYNTHESIS</span>
                      </div>
                      <span className="text-[10px] bg-brand-primary/10 text-brand-primary font-mono tracking-wider px-2 py-0.5 rounded-full uppercase font-bold">
                        {aiResult ? aiResult.poweredBy : "synthesizing pipeline"}
                      </span>
                    </div>

                    {aiLoading ? (
                      /* Glowing loading skeleton screen */
                      <div className="space-y-4 py-3 animate-pulse">
                        <p className="text-sm font-subheading font-medium text-brand-secondary tracking-wide flex items-center gap-2">
                          <span className="w-1.5 h-1.5 rounded-full bg-brand-secondary animate-ping" />
                          {loadingMessages[loadingStep]}
                        </p>
                        <div className="h-3.5 bg-gray-300/60 rounded-full w-full" />
                        <div className="h-3.5 bg-gray-300/60 rounded-full w-11/12" />
                        <div className="h-3.5 bg-gray-300/60 rounded-full w-10/12" />
                      </div>
                    ) : (
                      /* Synthesized content format nicely styled */
                      <div className="space-y-4">
                        <div className="space-y-3 text-brand-on-surface leading-relaxed text-[13px] sm:text-sm font-sans">
                          {aiResult?.answer.split("\n\n").map((para, pIdx) => {
                            if (para.startsWith("-") || para.startsWith("*")) {
                              return (
                                <ul key={pIdx} className="list-disc pl-5 space-y-1 my-2">
                                  {para.split("\n").map((li, lIdx) => (
                                    <li key={lIdx}>{li.replace(/^[-\*\s]+/, "")}</li>
                                  ))}
                                </ul>
                              );
                            }
                            return <p key={pIdx}>{para}</p>;
                          })}
                        </div>

                        {aiResult?.success !== false && (
                          <div className="flex items-center gap-4 bg-white/60 p-3 rounded-lg border border-white mt-4 text-xs text-brand-on-surface-variant justify-between">
                            <span className="font-sans flex items-center gap-1.5 font-medium">
                              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                              Grounded in publications
                            </span>
                            <a 
                              href="#contact" 
                              className="text-brand-secondary hover:underline font-subheading font-bold uppercase tracking-wider text-[10px] flex items-center gap-1"
                            >
                              Connect with Dr. Mohideen
                              <ArrowRight className="h-3 w-3" />
                            </a>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Local matching indicator for search filters */}
            {searchTab === "local" && searchQuery.trim() && (
              <div className="max-w-2xl mx-auto text-left py-2 font-sans text-xs text-brand-on-surface-variant">
                Matching publications in real-time. Found <span className="font-bold text-brand-secondary font-subheading">{filteredPublications.length} papers</span> of {PUBLICATIONS.length}.
              </div>
            )}
          </div>
        </section>

        {/* Section 2: Academic Focus (Bento grid overview) */}
        <section id="about" className="py-20 px-6 lg:px-12 max-w-6xl mx-auto text-left">
          <div className="space-y-4 mb-12">
            <h2 className="font-display text-3xl lg:text-4xl font-bold tracking-tight text-brand-primary">
              Academic Focus
            </h2>
            <div className="h-1 w-24 bg-brand-secondary" />
            <p className="text-sm text-brand-on-surface-variant max-w-xl font-sans leading-relaxed">
              Dr. Pa. Kaja Mohideen's career focuses primarily on the dual structural shifts changing rural and urban development in Indian states over the past 25 years.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* Bento block 1 (Agricultural Economics): Taking col-span-2 with nice animations */}
            <div className="md:col-span-2 bg-brand-surface-container rounded-2xl p-8 md:p-10 relative overflow-hidden flex flex-col justify-between min-h-[380px] group border border-gray-100">
              <div className="absolute inset-0 z-0">
                <img 
                  alt="Rural India agriculture crop landscape representation" 
                  className="w-full h-full object-cover opacity-10 group-hover:scale-105 transition-transform duration-700 pointer-events-none select-none"
                  src={RESEARCH_AREAS[0].imageUrl}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-brand-surface-container via-brand-surface-container/70 to-transparent" />
              </div>
              
              <div className="relative z-10">
                <span className="text-brand-secondary font-subheading text-[11px] font-bold tracking-widest uppercase mb-2 block">
                  {RESEARCH_AREAS[0].category}
                </span>
                <h3 className="font-display text-2xl lg:text-3xl font-bold text-brand-primary mb-4">
                  {RESEARCH_AREAS[0].title}
                </h3>
              </div>

              <div className="relative z-10 space-y-4">
                <p className="font-sans text-brand-on-surface-variant text-sm max-w-xl leading-relaxed">
                  {RESEARCH_AREAS[0].description}
                </p>
                <div className="bg-white/80 p-4 rounded-xl border border-white text-xs text-brand-on-surface leading-relaxed max-w-md font-sans font-medium">
                  <strong>Practical application:</strong>{RESEARCH_AREAS[0].details}
                </div>
              </div>
            </div>

            {/* Bento block 2 (Urbanization Specialization): Focused single card */}
            <div className="bg-white rounded-2xl p-8 border border-gray-200 flex flex-col justify-between shadow-sm hover:shadow-md transition-shadow min-h-[380px]">
              <div>
                <div className="inline-flex items-center justify-center p-3 bg-brand-secondary/10 rounded-xl mb-6">
                  <School className="h-6 w-6 text-brand-secondary" />
                </div>
                <span className="text-brand-secondary font-subheading text-[10px] font-bold tracking-widest uppercase mb-2 block">
                  {RESEARCH_AREAS[1].category}
                </span>
                <h3 className="font-display text-xl lg:text-2xl font-bold text-brand-primary mb-4">
                  {RESEARCH_AREAS[1].title}
                </h3>
                <p className="font-sans text-brand-on-surface-variant text-sm leading-relaxed">
                  {RESEARCH_AREAS[1].description}
                </p>
              </div>

              <div className="pt-4 border-t border-gray-100 text-xs text-brand-on-surface">
                <strong>Analytical metrics:</strong> {RESEARCH_AREAS[1].details}
              </div>
            </div>
          </div>
        </section>

        {/* Section 3: Academic Qualifications (Milestones Journey) */}
        <section id="qualifications" className="py-20 px-6 lg:px-12 bg-brand-surface-container border-y border-gray-100">
          <div className="max-w-4xl mx-auto">
            <div className="text-center space-y-4 mb-16">
              <span className="text-xs text-brand-secondary font-subheading uppercase tracking-widest font-bold">Academic Journey</span>
              <h2 className="font-display text-3xl sm:text-4xl font-bold tracking-tight text-brand-primary">
                Milestones of Excellence
              </h2>
              <div className="h-1 w-20 bg-brand-secondary mx-auto" />
            </div>

            {/* Centered Timeline layout */}
            <div className="relative border-l-2 border-brand-secondary/30 ml-4 sm:ml-6 md:ml-32 space-y-12 py-4">
              {MILESTONES.map((milestone) => (
                <div key={milestone.id} className="relative pl-6 sm:pl-8 group">
                  
                  {/* Circle milestone indicator node */}
                  <div className="absolute -left-[9px] top-1.5 w-4 h-4 rounded-full border-2 border-brand-secondary bg-white group-hover:bg-brand-secondary transition-colors duration-300" />
                  
                  {/* Left-aligned floating Year tag (Desktop only alignment block) */}
                  <div className="hidden md:block absolute -left-28 top-0.5 text-right w-20 font-display text-2xl font-bold text-brand-secondary select-none">
                    {milestone.year}
                  </div>

                  {/* Glass-styled timeline card contents */}
                  <div className="bg-white/90 rounded-2xl p-6 border border-white/60 shadow-sm hover:shadow-md transition-shadow">
                    {/* Mobile year show */}
                    <div className="md:hidden inline-block px-2.5 py-0.5 bg-brand-secondary/10 rounded-full text-xs font-bold text-brand-secondary mb-3">
                      {milestone.year}
                    </div>
                    <h4 className="font-display text-lg sm:text-xl font-bold text-brand-primary mb-1 text-left">
                      {milestone.degree}
                    </h4>
                    <p className="font-sans text-brand-on-surface-variant text-xs sm:text-sm leading-relaxed text-left">
                      {milestone.specialization}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Section 4: Publications Section (Filtering list and detailed search) */}
        <section id="publications" className="py-20 px-6 lg:px-12 max-w-6xl mx-auto text-left">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-12 gap-6 border-b border-gray-100 pb-8">
            <div className="space-y-4">
              <h2 className="font-display text-3xl lg:text-4xl font-bold tracking-tight text-brand-primary">
                Scholarly Works
              </h2>
              <p className="text-sm text-brand-on-surface-variant font-sans">
                A selection of high-citation journal articles, book chapters, and economic case studies.
              </p>
            </div>

            {/* Category selection tab filters with smart feedback indicators */}
            <div className="flex flex-wrap gap-2 relative select-none">
              {[
                { key: "all", label: "All Works" },
                { key: "Economics", label: "Economics" },
                { key: "Banking", label: "Banking" },
                { key: "Agriculture", label: "Agriculture" },
                { key: "Urbanization", label: "Urbanization" }
              ].map((cat) => (
                <button
                  key={cat.key}
                  onClick={() => setSelectedPubCategory(cat.key)}
                  className={`px-4 py-2 font-subheading text-xs uppercase font-bold tracking-widest relative z-10 transition-all duration-300 border rounded-lg cursor-pointer ${
                    selectedPubCategory === cat.key 
                      ? "text-white border-transparent" 
                      : "bg-white border-gray-200 text-brand-on-surface-variant hover:bg-gray-50 hover:border-gray-300"
                  }`}
                >
                  <span className="relative z-10">{cat.label}</span>
                  {selectedPubCategory === cat.key && (
                    <motion.div 
                      layoutId="activeCategoryBg"
                      className="absolute inset-0 bg-brand-secondary rounded-lg z-0"
                      transition={{ type: "spring", stiffness: 350, damping: 28 }}
                    />
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Render List items dynamically */}
          {filteredPublications.length === 0 ? (
            <div className="text-center py-16 bg-brand-surface-container rounded-2xl border border-dashed border-gray-300">
              <p className="text-brand-on-surface-variant text-sm mb-4">
                No publications matched your keyword filter: <span className="font-semibold text-brand-primary">"{searchQuery}"</span> under category <span className="font-semibold text-brand-primary">"{selectedPubCategory}"</span>.
              </p>
              <button 
                onClick={() => { setSearchQuery(""); setSelectedPubCategory("all"); }}
                className="px-4 py-2 bg-brand-primary text-white font-subheading text-xs font-bold uppercase tracking-wider hover:bg-brand-secondary cursor-pointer"
              >
                Clear Search Constraints
              </button>
            </div>
          ) : (
            <motion.div 
              layout
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            >
              <AnimatePresence mode="popLayout">
                {filteredPublications.map((pub) => (
                  <motion.div 
                    layout
                    key={pub.id}
                    initial={{ opacity: 0, scale: 0.95, y: 10 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: -10 }}
                    transition={{ duration: 0.25 }}
                    className="bg-white p-6 sm:p-8 rounded-2xl border border-gray-100 flex flex-col justify-between h-full hover:translate-y-[-4px] hover:shadow-md transition-all duration-300 shadow-sm"
                  >
                    <div className="space-y-4">
                      {/* Meta section with publication types */}
                      <div className="flex items-center justify-between text-[10px] font-subheading uppercase tracking-wider font-bold text-brand-secondary">
                        <span>{pub.year} • {pub.type.replace("_", " ")}</span>
                        <span className="px-2 py-0.5 bg-brand-surface-container text-brand-on-surface-variant rounded-xs lowercase">
                          {pub.category}
                        </span>
                      </div>

                      <h4 className="font-display text-lg font-bold text-brand-primary leading-snug tracking-tight hover:text-brand-secondary transition-colors text-left">
                        {pub.title}
                      </h4>

                      {pub.abstract && (
                        <p className="text-xs text-brand-on-surface-variant leading-relaxed font-sans text-left">
                          {pub.abstract}
                        </p>
                      )}
                    </div>

                    {/* Citation Journal link source */}
                    <div className="flex items-center justify-between pt-6 mt-6 border-t border-gray-100 text-xs text-brand-on-surface-variant">
                      <span className="font-medium italic font-sans">{pub.journal}</span>
                      <button 
                        onClick={() => handleSamplePromptClick(`Tell me more about the publication: "${pub.title}"`)}
                        className="text-brand-secondary hover:text-brand-primary font-subheading font-bold uppercase tracking-wider text-[10px] flex items-center gap-1 hover:underline cursor-pointer"
                      >
                        Analyze With AI
                        <ExternalLink className="h-3 w-3" />
                      </button>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </motion.div>
          )}
        </section>

        {/* Section 5: Academic Leadership Roles & Quote Banner */}
        <section className="py-20 px-6 lg:px-12 bg-brand-primary text-white overflow-hidden relative">
          
          <div className="absolute inset-0 select-none pointer-events-none opacity-10">
            <img 
              alt="Workspace scholarly items representational background" 
              className="w-full h-full object-cover grayscale brightness-50"
              src={ASSETS.leadershipBackground}
            />
          </div>

          <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-12 relative z-10 text-left">
            <div className="space-y-8">
              <div className="space-y-2">
                <span className="text-xs text-brand-secondary font-subheading uppercase tracking-widest font-bold">Policy & Standards</span>
                <h2 className="font-display text-3xl sm:text-4xl font-bold tracking-tight">Academic Leadership</h2>
              </div>

              <div className="space-y-6">
                {LEADERSHIP_ROLES.map((role) => (
                  <div key={role.id} className="flex gap-4 items-start group">
                    <div className="p-2 bg-white/10 rounded-lg group-hover:bg-brand-secondary/30 transition-colors">
                      <Award className="h-5 w-5 text-brand-secondary" />
                    </div>
                    <div className="space-y-1">
                      <h4 className="font-subheading text-[11px] font-bold text-brand-secondary uppercase tracking-widest">
                        {role.title}
                      </h4>
                      <p className="font-display font-medium text-base sm:text-lg">
                        {role.organization}
                      </p>
                      <p className="font-sans text-xs sm:text-sm text-gray-300 leading-relaxed max-w-md">
                        {role.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Elegant Callout Quote card with gold accents */}
            <div className="flex items-center justify-center">
              <div className="bg-white/5 border border-white/10 backdrop-blur-md p-8 md:p-10 rounded-2xl flex flex-col justify-between h-full relative">
                <blockquote className="space-y-4">
                  <span className="text-brand-secondary text-5xl font-serif">“</span>
                  <p className="font-display text-lg sm:text-xl text-gray-100 italic leading-relaxed">
                    {PERSONAL_INFO.quote}
                  </p>
                </blockquote>
                <div className="pt-6 mt-8 border-t border-white/10 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-brand-secondary/20 flex items-center justify-center font-display text-white font-bold text-sm border border-brand-secondary/45">
                      KM
                    </div>
                    <div>
                      <h5 className="font-subheading text-xs font-semibold tracking-wider uppercase text-brand-secondary">Dr. Pa. Kaja Mohideen</h5>
                      <span className="text-[10px] text-gray-400">Emeritus Professor</span>
                    </div>
                  </div>
                  <CheckCircle2 className="h-5 w-5 text-brand-secondary opacity-70" />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Section 6: Academic Gallery */}
        <section className="py-20 px-6 lg:px-12 max-w-6xl mx-auto text-left">
          <div className="space-y-4 mb-12">
            <h2 className="font-display text-3xl lg:text-4xl font-bold tracking-tight text-brand-primary">
              Academic Gallery
            </h2>
            <div className="h-1 w-24 bg-brand-secondary" />
            <p className="text-sm text-brand-on-surface-variant max-w-xl font-sans leading-relaxed">
              Snapshots of teaching arenas, collaborative boards, and active reference environments at university grounds.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {GALLERY_ITEMS.map((item) => (
              <div 
                key={item.id}
                className="group relative h-64 rounded-2xl overflow-hidden shadow-sm border border-gray-100 bg-brand-surface-container"
              >
                <img 
                  alt={item.description}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 rounded-2xl"
                  src={item.imageUrl}
                />
                {/* Overlay details that show up on hover for accessibility */}
                <div className="absolute inset-x-0 bottom-0 p-4 bg-gradient-to-t from-black/85 via-black/40 to-transparent flex items-end opacity-0 group-hover:opacity-100 transition-opacity duration-300 h-28">
                  <p className="text-white text-xs select-none leading-relaxed font-sans font-medium">
                    {item.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Section 7: Connect for Collaboration Contact Form */}
        <section id="contact" className="py-20 px-6 lg:px-12 bg-white border-t border-gray-100 text-left">
          <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-12 lg:gap-16">
            
            {/* Contact details */}
            <div className="space-y-8 flex flex-col justify-between">
              <div className="space-y-6">
                <span className="text-xs text-brand-secondary font-subheading uppercase tracking-widest font-bold">Collaborations Available</span>
                <h2 className="font-display text-3xl lg:text-4xl font-bold tracking-tight text-brand-primary">
                  Connect for Consultation
                </h2>
                <p className="text-sm text-brand-on-surface-variant leading-relaxed font-sans max-w-md">
                  Dr. Mohideen is prepared to accept invitations for institutional credit advisory, curriculum standards consultation, doctoral supervision reviews, and key resource lecture chairs.
                </p>
              </div>

              <div className="space-y-4">
                <div className="flex items-center gap-4 p-4 bg-brand-surface rounded-xl border border-gray-100 hover:border-brand-secondary/30 transition-all">
                  <div className="p-2.5 bg-brand-secondary/10 rounded-lg text-brand-secondary">
                    <Mail className="h-5 w-5" />
                  </div>
                  <div>
                    <span className="block text-[10px] text-brand-on-surface-variant font-subheading font-bold uppercase tracking-wider">EMAIL DIRECT</span>
                    <span className="text-sm font-semibold text-brand-primary">{PERSONAL_INFO.email}</span>
                  </div>
                </div>

                <div className="flex items-center gap-4 p-4 bg-brand-surface rounded-xl border border-gray-100 hover:border-brand-secondary/30 transition-all">
                  <div className="p-2.5 bg-brand-secondary/10 rounded-lg text-brand-secondary">
                    <MapPin className="h-5 w-5" />
                  </div>
                  <div>
                    <span className="block text-[10px] text-brand-on-surface-variant font-subheading font-bold uppercase tracking-wider">ACADEMIC LOCATION</span>
                    <span className="text-sm font-semibold text-brand-primary">{PERSONAL_INFO.location}</span>
                  </div>
                </div>
              </div>

              <div className="pt-6 border-t border-gray-150 text-[11px] text-brand-on-surface-variant/80 font-sans leading-relaxed max-w-xs">
                Inquiries posted through this form securely append to the live, in-memory coordinator stream accessible below.
              </div>
            </div>

            {/* Actual dynamic inquiry submitting form (Real dynamic integrations!) */}
            <div className="bg-brand-surface-container rounded-2xl p-8 border border-gray-100 relative shadow-sm">
              <form onSubmit={handleContactSubmit} className="space-y-6">
                <h3 className="font-display text-xl font-bold text-brand-primary mb-6 text-left">Send Academic Inquiry</h3>
                
                <div className="space-y-2">
                  <label className="block text-[10px] text-brand-on-surface-variant font-subheading font-bold uppercase tracking-wider">FULL NAME</label>
                  <input 
                    type="text" 
                    required
                    value={contactName}
                    onChange={(e) => setContactName(e.target.value)}
                    placeholder="e.g. Professor Anita Sharma"
                    className="w-full text-sm bg-white border border-gray-200 focus:border-brand-secondary focus:ring-1 focus:ring-brand-secondary/30 px-4 py-3 rounded-lg transition-colors focus:outline-none font-sans text-brand-primary"
                  />
                </div>

                <div className="space-y-2">
                  <label className="block text-[10px] text-brand-on-surface-variant font-subheading font-bold uppercase tracking-wider">EMAIL ADDRESS</label>
                  <input 
                    type="email" 
                    required
                    value={contactEmail}
                    onChange={(e) => setContactEmail(e.target.value)}
                    placeholder="e.g. anita.sharma@university.edu"
                    className="w-full text-sm bg-white border border-gray-200 focus:border-brand-secondary focus:ring-1 focus:ring-brand-secondary/30 px-4 py-3 rounded-lg transition-colors focus:outline-none font-sans text-brand-primary"
                  />
                </div>

                <div className="space-y-2">
                  <label className="block text-[10px] text-brand-on-surface-variant font-subheading font-bold uppercase tracking-wider">MESSAGE & PURPOSE</label>
                  <textarea 
                    rows={4}
                    required
                    value={contactMessage}
                    onChange={(e) => setContactMessage(e.target.value)}
                    placeholder="Describe collaboration proposal, PhD guidance details, or guest lecture details..."
                    className="w-full text-sm bg-white border border-gray-200 focus:border-brand-secondary focus:ring-1 focus:ring-brand-secondary/30 px-4 py-3 rounded-lg transition-colors focus:outline-none resize-none font-sans text-brand-primary"
                  />
                </div>

                {submitStatus && (
                  <div className={`p-4 rounded-lg text-xs leading-relaxed ${
                    submitStatus.type === "success" 
                      ? "bg-emerald-50 border border-emerald-200 text-emerald-800" 
                      : "bg-red-50 border border-red-200 text-red-800"
                  }`}>
                    {submitStatus.message}
                  </div>
                )}

                <button 
                  id="submit-inquiry-btn"
                  type="submit" 
                  disabled={isSubmitting}
                  className="w-full bg-brand-primary hover:bg-brand-secondary text-white hover:text-white font-subheading font-bold uppercase text-xs py-4 rounded-lg tracking-widest transition-all disabled:opacity-50 inline-flex items-center justify-center gap-2"
                >
                  {isSubmitting ? (
                    <>
                      <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      SUBMITTING...
                    </>
                  ) : (
                    <>
                      <Send className="h-4 w-4" />
                      SEND INQUIRY
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>
        </section>

        {/* Global Footer (Shared Component) */}
        <footer className="w-full py-12 px-6 lg:px-12 flex flex-col md:flex-row justify-between items-center gap-8 bg-brand-surface-container border-t border-gray-200 text-left mt-auto">
          <div>
            <div className="font-display text-xl font-bold tracking-tight text-brand-primary">
              Dr. Pa. Kaja Mohideen
            </div>
            <p className="text-brand-on-surface-variant text-[11px] font-sans mt-2">
              © {new Date().getFullYear()} Dr. Pa. Kaja Mohideen. All scholarly research rights reserved.
            </p>
          </div>
          
          <div className="flex flex-wrap gap-6 text-xs text-brand-on-surface-variant font-subheading font-semibold uppercase tracking-wider">
            <a href="#" className="hover:text-brand-secondary transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-brand-secondary transition-colors">Institutional Portal</a>
            <a href="#" className="hover:text-brand-secondary transition-colors">Sitemap</a>
          </div>
        </footer>
      </main>

      {/* Slide-out Inquiry Inspector drawer (Persistence test center validating workflows) */}
      <AnimatePresence>
        {adminDrawerOpen && (
          <div className="fixed inset-0 z-50 flex justify-end">
            {/* backdrop click out */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.4 }}
              exit={{ opacity: 0 }}
              onClick={() => setAdminDrawerOpen(false)}
              className="fixed inset-0 bg-black"
            />

            {/* active listing panel */}
            <motion.div 
              initial={{ translateX: "100%" }}
              animate={{ translateX: 0 }}
              exit={{ translateX: "100%" }}
              transition={{ type: "tween", duration: 0.3 }}
              className="relative w-full max-w-md bg-white h-full shadow-2xl z-50 flex flex-col"
            >
              <div className="p-6 border-b border-gray-100 flex items-center justify-between">
                <div>
                  <h3 className="font-display text-lg font-bold text-brand-primary">Submitted Inquiries ({submittedInquiries.length})</h3>
                  <p className="text-[10px] text-brand-secondary font-subheading uppercase font-semibold">Live Server State Tracker</p>
                </div>
                <button 
                  onClick={() => setAdminDrawerOpen(false)}
                  className="p-2 text-gray-500 hover:text-brand-primary hover:bg-gray-100 rounded-lg"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="flex-grow overflow-y-auto p-6 space-y-4">
                {submittedInquiries.length === 0 ? (
                  <div className="text-center py-20 text-brand-on-surface-variant space-y-2">
                    <MessageSquare className="h-8 w-8 mx-auto text-gray-350" />
                    <p className="text-sm font-sans">No messages submitted yet.</p>
                    <p className="text-xs text-gray-400">Fill out and send a message in the connect section to observe real-time persistence additions!</p>
                  </div>
                ) : (
                  submittedInquiries.map((inq: any) => (
                    <div key={inq.id} className="bg-brand-surface p-4 rounded-xl border border-gray-100 space-y-3 shadow-2xs text-left">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold font-subheading text-brand-secondary">{inq.name}</span>
                        <span className="text-[10px] text-gray-450 font-mono">
                          {new Date(inq.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      <p className="text-xs font-semibold text-brand-primary font-sans select-all">{inq.email}</p>
                      <div className="bg-white p-3 rounded border border-gray-150 text-xs text-brand-on-surface leading-normal font-sans">
                        {inq.message}
                      </div>
                    </div>
                  ))
                ).reverse()}
              </div>

              <div className="p-6 border-t border-gray-100 bg-brand-surface-container">
                <button 
                  onClick={() => {
                    setSubmittedInquiries([]);
                    // Optional: hit clear on server too
                    fetch("/api/inquiries", { method: "DELETE" }).catch(() => {});
                  }}
                  className="w-full bg-transparent hover:bg-white border border-gray-300 hover:border-brand-primary text-brand-on-surface-variant hover:text-brand-primary transition-all text-xs font-subheading uppercase font-semibold tracking-wider py-3 rounded-lg"
                >
                  Clear Inbox Log
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
