export type Rayon = 'fruits' | 'frais' | 'epicerie' | 'inconnue';

export interface Member {
  id: string;
  name: string;
  birthDate?: string; // YYYY-MM-DD
  avatarLetter: string;
  colorIndex: number; // index into MEMBER_COLORS palette
}

export interface ListItem {
  id: string;
  name: string;
  rayon: Rayon;
  checked: boolean;
  addedBy: string; // memberId
  addedAt: number; // timestamp
}

export interface ActiveList {
  id: string;
  items: ListItem[];
}

export interface ArchivedList {
  id: string;
  date: number; // timestamp
  items: ListItem[];
  participants: string[]; // memberIds
}

export interface Product {
  id: string;
  name: string;
  rayon: Rayon;
  purchaseCount: number;
  estimatedDaysUntilNext: number | null; // null = données insuffisantes
  purchaseHistory: number[]; // timestamps des achats
}

export type ListViewMode = 'flat' | 'by-rayon';
