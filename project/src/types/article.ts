export interface Article {
  id: string;
  title: string;
  content: string;
  authorId: string;
  authorName: string;
  createdAt: Date;
  updatedAt: Date;
  views: number;
  likes: number;
  image?: string;
  location?: string;
}
