import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { Article, ArticleSchema } from "./articles.schema";
import { ArticlesService } from "./articles.service";

@Module({
  imports: [MongooseModule.forFeature([{ name: Article.name, schema: ArticleSchema }])],
  providers: [ArticlesService],
  exports: [ArticlesService]
})
export class ArticlesModule { }