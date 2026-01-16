export interface ICardData {
  id: number;
  imageUrls: string[];
  name: string;
  age: number;
  tags: string[];
  scored?: boolean;
  score?: number;
}
