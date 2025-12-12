export type Picture = {
  id: string;
  url: string;
  alt?: string;
};

export const MOCK_PICTURES: Picture[] = Array.from({ length: 100 }).map((_, i) => ({
  id: `pic-${i}`,
  url: `https://picsum.photos/seed/${i}/800/1200`,
  alt: `Random picture ${i}`,
}));
