import { InjectQueue } from "@nestjs/bullmq";
import { Injectable, Logger } from "@nestjs/common";
import { Queue } from "bullmq";
import { ArticleRssDto } from "src/articles/article-rss.dto";

export type ArticleProcessingTask = {
  article: ArticleRssDto;
};

@Injectable()
export class ArticleScrapperQueue {
  private readonly logger = new Logger(ArticleScrapperQueue.name);

  constructor(@InjectQueue('article-html') private readonly articleHtmlScrappingQueue: Queue) { }

  async queue(task: ArticleProcessingTask) {
    this.articleHtmlScrappingQueue.add(task.article.link, task);
    this.logger.debug(`Queued article ${task.article.link}`);
  }
}