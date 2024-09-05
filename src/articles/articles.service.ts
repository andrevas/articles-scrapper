import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Article, ArticleDocument } from "./articles.schema";
import { Model } from "mongoose";
import { ArticleRssDto } from "./article-rss.dto";

@Injectable()
export class ArticlesService {
  constructor(@InjectModel(Article.name) private articleModel: Model<Article>) { }

  async add(article: ArticleRssDto): Promise<ArticleDocument> {
    return this.articleModel.create(article)
  }
}