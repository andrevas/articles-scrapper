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
      const { articleDocument } = job.data;
      this.logger.debug(`article - ${articleDocument._id.toString()} : started`)

      const { data } = await axios.get(articleDocument.link, {
        responseType: 'document',
      });
      const $ = cheerio.load(data);
      const texts = [];
      $('span[data-text="true"]').each((_, element) => {
        texts.push($(element).text().trim());
      });

      this.logger.debug(`article - ${articleDocument._id.toString()} : finished`)
    } catch (err) {
      this.logger.error(err);
    }
  }
}