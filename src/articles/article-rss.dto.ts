type Timestamp = number;

export type ArticleRssDto = {
  title: string;
  link: string;
  pubDate: Timestamp;
  tags: string[];
  description: string;
};
