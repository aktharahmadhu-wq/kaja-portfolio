import { Publication, Milestone, Achievement, ResearchArea, LeadershipRole, GalleryItem } from './types';

export const PERSONAL_INFO = {
  name: "Dr. Pa. Kaja Mohideen",
  title: "Emeritus Professor & Academic Leader",
  subtitle: "Head of the Department of Economics | Research Supervisor | Author",
  bio: "With over 20 years of dedicated service at Abdul Hakeem College, Dr. Mohideen has shaped the economic discourse through rigorous research in Indian Agriculture and Urbanization. A visionary educator committed to institutional growth, scholastic rigor, and empowering the next generation of economic researchers.",
  email: "hakeem.economics786@gmail.com",
  college: "C. Abdul Hakeem College (Autonomous)",
  location: "Melvisharam, Tamil Nadu, TN, India",
  cvUrl: "#", // placeholder
  portfolioDownloadUrl: "#",
  quote: "Knowledge is the true capital of progress. When integrated with local insights, it empowers sustainable community transformation."
};

export const ACHIEVEMENTS: Achievement[] = [
  { id: '1', label: "Years Experience", value: "20+" },
  { id: '2', label: "Scholarly Publications", value: "15+" },
  { id: '3', label: "Ph.D. Guided", value: "08" },
  { id: '4', label: "Published Books", value: "04" }
];

export const RESEARCH_AREAS: ResearchArea[] = [
  {
    id: 'res-1',
    title: "Indian Agricultural Economics",
    category: "PRIMARY RESEARCH",
    description: "Deep analysis of credit systems, production cycles, and the socio-economic impact of banking on rural development.",
    imageUrl: "https://lh3.googleusercontent.com/aida-public/AB6AXuBrqZFnsimYwXdCwW7vPzNucckwBA3h6mLI3bd6RpKgwZGk_RS5LtI5p9GpzNRpI0Zamyg8m2T2rQjdAoHdsjzpQ1Wzju1BaT09lNRntgQkOVCngur-F-4IfwdF3Xn_NI-7tivw4AHw9hMNqnJiHZ7KJk3aqwqBIzMC8WVlXI0f-H9H1oVXD0Ws0OkMjWreGq6sqyIOFSKVOwt5Sl9L0vv1s3vhg4GFs_vb9X_ndbQiHk3ztf3ejzFypUey9N8js0J5Ek5rz0cPNCw",
    details: "Focuses on exploring how financial inclusion, primary coop banks, and state subsidies shape agricultural outputs and minimize debts among local farmers."
  },
  {
    id: 'res-2',
    title: "Urbanization & Census Study",
    category: "SPECIALIZATION",
    description: "Mapping the demographic shifts, migration behaviors, and economic implications of India's rapid urban growth in the 21st century.",
    imageUrl: "https://lh3.googleusercontent.com/aida-public/AB6AXuCBIv8jTaDwjazYPoh5rfwOQBpfj8DWI0M0PryMgXxT5_DuzagimDkP_k3b4LJcXo5lRff40y9OXdAGBPWZFAbQgfRdJx31mLbsQjFIvEXKqy6o4cnE9wxmmI1Adxn0GdH-kBkwmAyA_SCA1TBSlHyvbP9T88q90H58lYxzi3zlVJJKONlDxdHqX9DGFNeVLcE9I_UgbIJFz4R5FlZzlt0dHC1BkPbAczKHE3g8BaG8SooKfrxomIUYcslj8ALVDLNhgdFETCusaRI",
    details: "Analyzes urban sprawl patterns, transition from rural farming livelihoods to urban labor, and policy planning with regional economic centers."
  }
];

export const MILESTONES: Milestone[] = [
  {
    id: 'm-1',
    year: 2010,
    degree: "Ph.D. in Economics",
    specialization: "Rural Credit Systems, Institutional Banking & Agricultural Sustainability"
  },
  {
    id: 'm-2',
    year: 2003,
    degree: "M.Phil Economics",
    specialization: "Research focus on Agricultural Finance and Regional Farmer Credit Distribution"
  },
  {
    id: 'm-3',
    year: 2002,
    degree: "M.A. Economics",
    specialization: "Institutional Economic Theory, Indian Development Policies & Macroeconomics"
  }
];

export const PUBLICATIONS: Publication[] = [
  {
    id: 'pub-1',
    title: "An Overview of Urbanization in India: Trends and Economic Impact",
    year: 2024,
    type: 'journal',
    journal: "Economic Gazette",
    category: "Urbanization",
    abstract: "This research paper maps the key census trends of urban concentration across southern India, exploring how rural-urban migration alters labor economics and local tax collections."
  },
  {
    id: 'pub-2',
    title: "World Financial Meltdown: Analysis of Emerging Markets Resilience",
    year: 2023,
    type: 'case_study',
    journal: "Global Finance Review",
    category: "Banking",
    abstract: "A comparative case study exploring the stability of Indian commercial banking protocols against major supply chain disruptions and global liquidity contractions."
  },
  {
    id: 'pub-3',
    title: "Bank Finance to Agricultural Production in India: A Five-Decade Review",
    year: 2022,
    type: 'book_chapter',
    journal: "Oxford Press Anthology",
    category: "Agriculture",
    abstract: "A historical synthesis tracing institutional agricultural credit facilities from nationalization to contemporary direct benefits transfer (DBT) schemes."
  },
  {
    id: 'pub-4',
    title: "A Macroeconomic Study of Micro-Finance Institutions in Tamil Nadu",
    year: 2021,
    type: 'journal',
    journal: "Indian Journal of Applied Economics",
    category: "Economics",
    abstract: "Investigates how joint liability group (JLG) loans bolster small female-led enterprises in semi-urban communities and their impact on local poverty metrics."
  },
  {
    id: 'pub-5',
    title: "Public Sector Banking Reform and Rural Lending Limits",
    year: 2019,
    type: 'journal',
    journal: "Banking and Resource Management Journal",
    category: "Banking",
    abstract: "Analyzing the policy effects of merger consolidations in Indian state-owned banks on credit accessibility for margin farmers and craft guilds."
  },
  {
    id: 'pub-6',
    title: "Urban Enclaves, Housing Security and Economic Disparities",
    year: 2018,
    type: 'case_study',
    journal: "Metropolitan Studies",
    category: "Urbanization",
    abstract: "Focuses on structural barriers in access to municipal utilities in rapidly emerging economic suburbs around second-tier state cities."
  },
  {
    id: 'pub-7',
    title: "Sustainable Agricultural Crop Loan Insurance Models",
    year: 2016,
    type: 'book_chapter',
    journal: "Sustainable Agriculture Development",
    category: "Agriculture",
    abstract: "A book chapter details risk diversification strategies for credit lenders under unpredictable weather and crop disease cycles in South India."
  }
];

export const LEADERSHIP_ROLES: LeadershipRole[] = [
  {
    id: 'lead-1',
    title: "CHAIRMAN",
    organization: "Board of Studies (BoS) in Economics, Thiruvalluvar University",
    description: "Spearheaded the formulation and modernization of graduate & undergraduate economics curricula across numerous affiliated academic institutions."
  },
  {
    id: 'lead-2',
    title: "RESEARCH SUPERVISOR",
    organization: "Empaneled Doctoral Supervisor at Thiruvalluvar & Bharathiar Universities",
    description: "Supervised and successfully guided 8 Ph.D. scholars in core agricultural finance, banking policies, and microeconomic community impact studies."
  },
  {
    id: 'lead-3',
    title: "DEPARTMENT HEAD",
    organization: "Head of Economics, C. Abdul Hakeem College (Autonomous)",
    description: "Direct academic and administrative operations of the department, securing research grants and supervising institutional academic standards."
  }
];

export const GALLERY_ITEMS: GalleryItem[] = [
  {
    id: 'gal-1',
    imageUrl: "https://lh3.googleusercontent.com/aida-public/AB6AXuDToSCsqrnw8XBQWna2dTNWMxh4b-QkYuNpuAmb5X-T9ciKxoI9csJQdjLlFNjswI7Ay-FA3rVQjnzuHIpQpNqWBE30Jyfn2xcuNYChBYxWbihNhSPPXvA5QXKETcV7efd2zo00-jG12VpQx9C_4i9h2uUDd0N8fLn42OTy9DBUzckXCMHeQbvofI5iS7VNcsUJrGlOKnWpuVzYxK7ArJMLQxGEAHnSNGgq3T_okmGPLnhvFhDD_IAp9xNT4CO3z399yFbKvqaobxg",
    description: "Lecture podium at C. Abdul Hakeem College department seminar room"
  },
  {
    id: 'gal-2',
    imageUrl: "https://lh3.googleusercontent.com/aida-public/AB6AXuBaHIXxldFZwMZpvrhxbR2s97IU-RdK9bPcX1mtU5gOFckFxgx7JXDJu4r0k_zO87PfsmP_EzAK9odPoHtH5fEWMpKeG095Nj_f-iY1GlaEzjcGxDAdRw9hohxeBOC_hqrecr5escj3Mm1bg--P07iIo2hyV29cHvOKl2On7dBadH0wpYk7Y_Ckml-caunqmkIXz_O2cMPGaKgDLX184XO6wclyscftvKWZuFk96W_f2f-1Y3Bq3fWoKFfUPEjmsfRVEeagKA9v7f4",
    description: "Dr. Mohideen's workspace with piles of research journals and economic textbooks"
  },
  {
    id: 'gal-3',
    imageUrl: "https://lh3.googleusercontent.com/aida-public/AB6AXuCyKaXeIsjhcmxKkliM39Uxi9drCQUla-i5r8Q5ah2lN3JZQfbZfyyv705_4ldEZG9ds-ryFKm6pLudpp1p2ir12NmyGmrte3PuP37t_eHTYIuFXVuT5Xv3G7XAXpQYRZM6nRnySvDNpGnoLztnClhhRwAyjTdenmc9MoYnOMDbMvYZsKWKW2URe3DVx4FpEKlhw3S8tReelWwLSsYkaLCdWjdgEbjh-7I8gdZmqSQngyF3SpPGZdi7tlaW6_U4Xs_CCyw2fgobpHw",
    description: "Scholars convocation, celebrating doctoral doctoral research successes"
  },
  {
    id: 'gal-4',
    imageUrl: "https://lh3.googleusercontent.com/aida-public/AB6AXuCBIv8jTaDwjazYPoh5rfwOQBpfj8DWI0M0PryMgXxT5_DuzagimDkP_k3b4LJcXo5lRff40y9OXdAGBPWZFAbQgfRdJx31mLbsQjFIvEXKqy6o4cnE9wxmmI1Adxn0GdH-kBkwmAyA_SCA1TBSlHyvbP9T88q90H58lYxzi3zlVJJKONlDxdHqX9DGFNeVLcE9I_UgbIJFz4R5FlZzlt0dHC1BkPbAczKHE3g8BaG8SooKfrxomIUYcslj8ALVDLNhgdFETCusaRI",
    description: "Board meeting during curriculum standards review at Thiruvalluvar University"
  }
];

export const ASSETS = {
  heroBackground: "https://lh3.googleusercontent.com/aida-public/AB6AXuCGVTbKW6CimUiWW-6IS6yjmzVbRR-GxyZg73jkXohKLjB6Pxuapi71Kbr5GMJW9sw7Bx8vr0WUAnFpV52BRZSvZ2E9r78gB4dumqn8IPRJeCDAa6lrp14whWcgxUVQGcwW5KDPg7Aw8PJB_lr2h65q0lTnDTXEt1UEVQvaqpGkne1WD9kiSa1o3cE2SUeelrGiKuqVKHdV_mqdPWsDkWIYXl4KSBN61fvMLutlKX5l_Ua-NQF6DdN3GmkVUa7dyszR03mY8jBp3F8",
  leadershipBackground: "https://lh3.googleusercontent.com/aida-public/AB6AXuD0zXyJZJzswi1aHPNmiq-E8pfLk0i2Pjr3TuDdYPwGJl6AL_hpY0t52btNMpXi2YYZeOnJK0t0rrJly7BjrxCaw0NQy4Pmx6Xh3J3gyARGxCccn6lrmMUHxTG6Osjizh6pLi_e-nQR5gCCJbdmwght2MEf3P2SsDhHbuD4i2D0UOwPMAqKtG95lUILqyLFQzLyz1uOum6O5Fav2hUEPRLwCYJ9wM528Y_oxjJTtuceNGPXHr7Ye8BVjS0Oo2_1CRMITDp4MwtcpO4"
};
