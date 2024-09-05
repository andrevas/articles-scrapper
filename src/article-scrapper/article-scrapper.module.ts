import { BullModule } from "@nestjs/bullmq";
import { Module } from "@nestjs/common";
import { ArticleScrapperQueue } from "./article-scrapper.service";
import { ArticleScrapperProcessor } from "./article-scrapper.processor";

@Module({
  imports: [
    BullModule.registerQueue({
      name: 'article-html',
    }),
  ],
  providers: [ArticleScrapperQueue, ArticleScrapperProcessor],
  exports: [ArticleScrapperQueue]
})
export class ArticleHtmlScrapperModule { }