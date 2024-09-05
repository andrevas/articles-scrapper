import { Injectable, Logger } from '@nestjs/common';
import type { queueAsPromised } from 'fastq';
import * as fastq from 'fastq';
import * as cheerio from 'cheerio';
import { ArticleRssDto } from 'src/articles/article-rss.dto';
import axios from 'axios';

type ArticleProcessingTask = {
  article: ArticleRssDto;
};

@Injectable()
export class ArticlesProcessingQueue {
  private readonly q: queueAsPromised<ArticleProcessingTask>;
  private readonly logger: Logger = new Logger(ArticlesProcessingQueue.name);

  constructor() {
    this.q = fastq.promise(this.asyncWorker.bind(this), 1);
  }

  queue(articleProcessingTask: ArticleProcessingTask) {
    this.q.push(articleProcessingTask);
  }

  private async asyncWorker(
    articleProcessingTask: ArticleProcessingTask,
  ): Promise<void> {
    try {
      const { article } = articleProcessingTask;
      const { data } = await axios.get(article.link, {
        responseType: 'document',
      });
      const $ = cheerio.load(data);
      const texts = [];
      $('span[data-text="true"]').each((_, element) => {
        texts.push($(element).text().trim());
      });

      this.logger.log(texts.join());
    } catch (err) {
      this.logger.error(err);
    }
  }
}
