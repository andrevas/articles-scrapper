import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { ConfigService } from '@nestjs/config';
import { RssParser } from './rss-parser';
import { ArticleRssDto } from 'src/articles/article-rss.dto';
import { ArticleScrapperQueue } from 'src/article-scrapper/article-scrapper.service';

export const YnetScrapperProvider = {
  provide: 'YnetScrapperProvider',
  useFactory: (
    configService: ConfigService,
    rssParser: RssParser,
    articleProcessingQueue: ArticleScrapperQueue,
  ) => {
    return new YnetScrapperService(configService, rssParser, articleProcessingQueue);
  },
  inject: [ConfigService, RssParser, ArticleScrapperQueue],
};

@Injectable()
class YnetScrapperService {
  private readonly logger = new Logger(YnetScrapperService.name);
  private YNET_RSS_URI;
  private LAST_SCRAPPED = Date.now() - 60 * 60 * 1000;
  constructor(
    private readonly configService: ConfigService,
    private readonly rssParser: RssParser,
    private readonly articleProcessingQueue: ArticleScrapperQueue,
  ) {
    this.YNET_RSS_URI = this.configService.get('YNET_RSS_URI');
  }

  @Cron(CronExpression.EVERY_MINUTE)
  async handleCron() {
    try {
      this.logger.debug('Started...');
      const rssArticles: ArticleRssDto[] = await this.rssParser.parse(
        this.YNET_RSS_URI,
      );
      this.logger.debug('Got articles...');

      rssArticles.forEach((article: ArticleRssDto) => {
        if (article.pubDate > this.LAST_SCRAPPED) {
          this.articleProcessingQueue.queue({ article });
        }
      });
      this.LAST_SCRAPPED = Date.now();
      this.logger.debug('Finished cron')
    } catch (err) {
      this.logger.error(`Fetching articles data failed: ${err.message}`);
    }
  }
}
