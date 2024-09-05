import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { ConfigService } from '@nestjs/config';
import { RssParser } from './rss-parser';
import { ArticleRssDto } from 'src/articles/article-rss.dto';
import { ArticleScrapperQueue } from 'src/article-scrapper/article-scrapper.service';
import { ArticlesService } from 'src/articles/articles.service';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from '@nestjs/cache-manager';

export const YnetScrapperProvider = {
  provide: 'YnetScrapperProvider',
  useFactory: (
    configService: ConfigService,
    rssParser: RssParser,
    articleProcessingQueue: ArticleScrapperQueue,
    articleService: ArticlesService,
    cacheManager: Cache
  ) => {
    return new YnetScrapperService(configService, rssParser, articleProcessingQueue, articleService, cacheManager);
  },
  inject: [ConfigService, RssParser, ArticleScrapperQueue, ArticlesService, CACHE_MANAGER],
};

@Injectable()
class YnetScrapperService {
  private readonly logger = new Logger(YnetScrapperService.name);
  private YNET_RSS_URI;
  constructor(
    private readonly configService: ConfigService,
    private readonly rssParser: RssParser,
    private readonly articleProcessingQueue: ArticleScrapperQueue,
    private readonly articlesService: ArticlesService,
    private readonly cacheManager: Cache,
  ) {
    this.YNET_RSS_URI = this.configService.get('YNET_RSS_URI');
  }

  @Cron(CronExpression.EVERY_MINUTE)
  async handleCron() {
    try {
      let lastScrapped = await this.cacheManager.get<number>("lastScrapped");
      if (!lastScrapped) lastScrapped = 0;
      this.logger.debug(`Starting... Last scrapped at ${lastScrapped}`);
      const rssArticles: ArticleRssDto[] = await this.rssParser.parse(
        this.YNET_RSS_URI,
      );
      this.logger.debug(`Got ${rssArticles.length} articles...`);

      for (let article of rssArticles) {
        if (article.pubDate > lastScrapped) {
          const articleDocument = await this.articlesService.add(article)
          this.articleProcessingQueue.queue({ articleDocument });
        }
      }
      await this.cacheManager.set("lastScrapped", Date.now(), 0)
      this.logger.debug('Finished cron')
    } catch (err) {
      this.logger.error(`Fetching articles data failed: ${err.message}`);
    }
  }
}
