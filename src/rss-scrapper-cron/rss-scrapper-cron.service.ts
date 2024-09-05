import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { ConfigService } from '@nestjs/config';
import { RssParser } from './parsers/rss-parser';
import { ArticleRssDto } from 'src/articles/article-rss.dto';
import { ArticlesProcessingQueue } from 'src/queues/articles-processing-queue';

export const YnetScrapperProvider = {
  provide: 'YnetScrapperProvider',
  useFactory: (
    configService: ConfigService,
    rssParser: RssParser,
    articleProcessingQueue: ArticlesProcessingQueue,
  ) => {
    return new YnetScrapperService(configService, rssParser, articleProcessingQueue);
  },
  inject: [ConfigService, RssParser, ArticlesProcessingQueue],
};

@Injectable()
class YnetScrapperService {
  private readonly logger = new Logger(YnetScrapperService.name);
  private YNET_RSS_URI;
  private LAST_SCRAPPED = Date.now() - 60 * 60 * 1000;
  constructor(
    private readonly configService: ConfigService,
    private readonly rssParser: RssParser,
    private readonly articleProcessingQueue: ArticlesProcessingQueue,
  ) {
    this.YNET_RSS_URI = this.configService.get('YNET_RSS_URI');
  }

  @Cron(CronExpression.EVERY_MINUTE)
  async handleCron() {
    try {
      const rssArticles: ArticleRssDto[] = await this.rssParser.parse(
        this.YNET_RSS_URI,
      );
      rssArticles.forEach((article: ArticleRssDto) => {
        if (article.pubDate > this.LAST_SCRAPPED) {
          this.articleProcessingQueue.queue({ article });
        }
      });
      this.LAST_SCRAPPED = Date.now();
    } catch (err) {
      this.logger.error(`Fetching shelters data failed: ${err.message}`);
    }
  }
}
