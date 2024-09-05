import { InjectQueue } from "@nestjs/bullmq";
import { Injectable, Logger } from "@nestjs/common";
import { Queue } from "bullmq";
import { ArticleDocument } from "src/articles/articles.schema";

export type ArticleProcessingTask = {
  articleDocument: ArticleDocument;
};

@Injectable()
export class ArticleScrapperQueue {
  private readonly logger = new Logger(ArticleScrapperQueue.name);

  constructor(@InjectQueue('article-html') private readonly articleHtmlScrappingQueue: Queue) { }

  async queue(task: ArticleProcessingTask) {
    const articleId = task.articleDocument._id.toString();
    this.articleHtmlScrappingQueue.add(articleId, task, { removeOnComplete: true });
    this.logger.debug(`Queued article ${articleId}`);
  }
}