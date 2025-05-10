export interface Note {
    id: string;
    title: string;
    content: string;
    tags: string[];
    createdAt: string;
    updatedAt: string;
    summary?: string;
    folderPath: string | null;
  }
  
  export interface Tag {
    id: string;
    name: string;
  }
  
  export type SummaryType = 'brief' | 'detailed' | 'bullets';

  export interface Folder {
    id: string;
    name: string;
    path: string;
    parentId: string | null;
    children: Folder[];
    order?: number;
    isExpanded?: boolean;
  } 