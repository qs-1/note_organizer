export interface Note {
    id: string;
    title: string;
    content: string;
    tags: string[];
    createdAt: string;
    updatedAt: string;
    summary?: string;
  }
  
  export interface Tag {
    id: string;
    name: string;
  }
  
  export type SummaryType = 'brief' | 'detailed' | 'bullets'; 