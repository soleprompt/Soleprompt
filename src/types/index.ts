export interface SellerProfile {
  displayName: string;
  username: string;
  bio: string | null;
}

export interface Prompt {
  id: string;
  title: string;
  description: string;
  content: string;
  preview: string;
  sampleOutput: string;
  category: string;
  price: number;
  rating: number;
  reviews: number;
  salesCount: number;
  author: string;
  seller: SellerProfile;
  tags: string[];
  compatibleModels: string[];
  difficulty: "beginner" | "intermediate" | "advanced";
  estimatedTimeSaved: string | null;
  coverImageUrl: string | null;
}

export interface Category {
  id: string;
  name: string;
  description: string;
  icon: string;
  count: number;
}

export interface Testimonial {
  id: string;
  name: string;
  role: string;
  company: string;
  content: string;
  avatar: string;
}

export interface FAQItem {
  id: string;
  question: string;
  answer: string;
}

export interface Stat {
  id: string;
  label: string;
  value: string;
  suffix?: string;
}
