export interface Publication {
  id: string;
  title: string;
  year: number;
  type: 'journal' | 'case_study' | 'book_chapter';
  journal: string;
  url?: string;
  abstract?: string;
  category: 'Economics' | 'Banking' | 'Urbanization' | 'Agriculture';
}

export interface Milestone {
  id: string;
  year: number;
  degree: string;
  specialization: string;
}

export interface Achievement {
  id: string;
  label: string;
  value: string;
}

export interface ResearchArea {
  id: string;
  title: string;
  description: string;
  category: string;
  imageUrl: string;
  details: string;
}

export interface LeadershipRole {
  id: string;
  title: string;
  organization: string;
  description: string;
}

export interface GalleryItem {
  id: string;
  imageUrl: string;
  description: string;
}

export interface Inquiry {
  name: string;
  email: string;
  message: string;
  timestamp: string;
}
