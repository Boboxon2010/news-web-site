// src/types/index.ts

export type Role = 'SUPER_ADMIN' | 'CONTENT_MANAGER' | 'GUEST';

export interface User {
  id: number;
  fullName: string;
  username: string;
  role: Role;
}

export interface NewsItem {
  id: number;
  title: string;
  slug: string;
  summary: string;
  content: string;
  coverImage: string;
  category: string;
  publishedAt: string;
  author: {
    fullName: string;
  };
}