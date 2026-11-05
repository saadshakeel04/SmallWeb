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
