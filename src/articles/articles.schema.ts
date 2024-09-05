import { Schema, Prop, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument } from "mongoose";

@Schema()
export class Article {
  @Prop()
  title: string
  @Prop()
  link: string
  @Prop()
  pubDate: number
  @Prop()
  tags: string[]
  @Prop()
  description: string
  @Prop()
  imageLink: string
}

export const ArticleSchema = SchemaFactory.createForClass(Article);
export type ArticleDocument = HydratedDocument<Article>;
