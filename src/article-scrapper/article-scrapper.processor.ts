import { Processor, WorkerHost } from "@nestjs/bullmq";
import { Logger } from "@nestjs/common";
import { Job } from "bullmq";
import axios from "axios";
import * as cheerio from 'cheerio'

@Processor('article-html')
export class ArticleScrapperProcessor extends WorkerHost {
  private readonly logger = new Logger(ArticleScrapperProcessor.name);

  async process(job: Job<any, any, string>) {
    try {
      this.logger.debug(`article - ${job.id} : started`)
      const { article } = job.data;
      const { data } = await axios.get(article.link, {
        responseType: 'document',
      });
      const $ = cheerio.load(data);
      const texts = [];
      $('span[data-text="true"]').each((_, element) => {
        texts.push($(element).text().trim());
      });

      this.logger.debug(`article - ${job.id} : finished`)
    } catch (err) {
      this.logger.error(err);
    }
  }
}