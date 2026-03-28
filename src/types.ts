export type Page = 'home' | 'websites' | 'prompts' | 'cases' | 'tags' | 'prompt-detail' | 'case-detail' | 'search' | 'admin';

export interface Resource {
  id: string;
  title: string;
  description: string;
  category: string;
  tags: string[];
  image: string;
  url?: string;
  rating?: number;
  views?: string;
  saves?: string;
  score?: string;
  author?: {
    name: string;
    role: string;
    avatar: string;
  };
}

export interface Prompt extends Resource {
  picture_prompt: string;
  video_prompt: string;
  params: {
    model: string;
    sampler: string;
    steps: number;
    cfg: number;
    seed: string;
    size: string;
  };
}

export interface CaseStudy extends Resource {
  id: string;
  status: string;
  logs: {
    id: string;
    title: string;
    time: string;
    description: string;
    images: string[];
  }[];
}
