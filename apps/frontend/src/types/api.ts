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

export type NavigationSource = "typed" | "link" | "history" | "search" | "publish";

export interface NavigationEntry {
  id: string;
  address: string;
  siteId: string;
  title: string;
  site: Site;
  source: NavigationSource;
  scrollY: number;
}
