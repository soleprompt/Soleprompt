export interface Prompt {
  id: string;
  title: string;
  description: string;
  category: string;
  price: number;
  rating: number;
  reviews: number;
  author: string;
  tags: string[];
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
