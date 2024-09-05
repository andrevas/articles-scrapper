import { Injectable, Logger } from '@nestjs/common';
import * as Parser from 'rss-parser';
import { ArticleRssDto } from 'src/articles/article-rss.dto';

type RssItem = {
  title: string;
  link: string;
  pubDate: string;
  description: string;
  tags: string;
  content: string;
  contentSnippet: string;
  guid: string;
  isoDate: string;
};

@Injectable()
export class RssParser {
  private readonly logger = new Logger(RssParser.name);
  private parser: Parser<RssItem>;
  private IMG_SRC_REGEX = /<img\s+[^>]*src=['"]([^'"]*)['"][^>]*>/i;

  constructor(
  ) {
    this.parser = new Parser({
      customFields: {
        item: ['tags', "image"],
      },
    });
  }

  async parse(url: string): Promise<ArticleRssDto[]> {
    this.logger.debug('Retrieving articles RSS...')
    const rssArticles = await this.parser.parseURL(url);
    this.logger.debug(`Articles RSS retrieved succesfully, total of ${rssArticles.items.length} articles!`)


    return rssArticles.items.map((rssItem: RssItem) => {
      const match = this.IMG_SRC_REGEX.exec(rssItem.content);

      return {
        title: rssItem.title,
        link: rssItem.link,
        pubDate: new Date(rssItem.pubDate).getTime(),
        tags: rssItem.tags.split(',').map((i) => i.trim()),
        description: rssItem.contentSnippet,
        imageLink: match && match[1] ? match[1] : "",
      }
    });
  }
}
