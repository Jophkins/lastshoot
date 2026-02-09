export type Picture = {
  id: string;
  url: string;
  alt?: string;
};

export const MOCK_PICTURES: Picture[] = Array.from({ length: 100 }).map((_, i) => ({
  id: `pic-${i}`,
  url: `https://picsum.photos/id/${i + 10}/${i % 3 === 0 ? "800" : "1600"}/${i % 2 === 0 ? "1600" : "600"}`,
  alt: `Random picture ${i}`,
}));
