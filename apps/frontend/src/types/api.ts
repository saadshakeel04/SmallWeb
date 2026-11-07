export interface Person {
  _id: string;
  name: string;
  createdAt: string;
}

export interface Site {
  _id: string;
  address: string;
  title: string;
  html: string;
  plainText: string;
  authorId: string;
  createdAt: string;
  updatedAt: string;
}

export interface DirectorySite {
  _id: string;
  address: string;
  title: string;
  plainText: string;
  authorId: string;
}

export type NavigationSource = "typed" | "link" | "history" | "search" | "publish";
export type VisitSource = NavigationSource;

export interface Visit {
  _id: string;
  personId: string;
  siteId: string;
  address: string;
  visitedAt: string;
  source: VisitSource;
}

export interface VisitPage {
  items: Visit[];
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface CreateVisitInput {
  personId: string;
  address: string;
  source: VisitSource;
}

export interface CreateSiteInput {
  address: string;
  title: string;
  html: string;
  publisherId: string;
}

export interface SearchResult {
  address: string;
  title: string;
  excerpt: string;
}

export interface SearchResponse {
  query: string;
  total: number;
  limit: number;
  results: SearchResult[];
}

export interface NavigationEntry {
  id: string;
  address: string;
  siteId: string;
  title: string;
  site: Site;
  source: NavigationSource;
  scrollY: number;
}
