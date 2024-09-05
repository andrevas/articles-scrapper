import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { YnetScrapperProvider } from './rss-scrapper-cron/rss-scrapper-cron.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { HttpModule } from '@nestjs/axios';
import { RssParser } from './rss-scrapper-cron/rss-parser';
import { BullModule } from '@nestjs/bullmq';
import { ArticleHtmlScrapperModule } from './article-scrapper/article-scrapper.module';
import { ArticlesModule } from './articles/articles.module';

@Module({
  imports: [
    HttpModule,
    ScheduleModule.forRoot(),
    ConfigModule.forRoot(),
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        uri: configService.get('MONGODB_URI'),
      }),
      inject: [ConfigService],
    }),
    BullModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        connection: {
          host: configService.get('REDIS_HOST'),
          port: configService.get('REDIS_PORT'),
        },
      }),
      inject: [ConfigService],
    }),
    ArticleHtmlScrapperModule,
    ArticlesModule
  ],
  providers: [YnetScrapperProvider, RssParser],
})
export class AppModule { }
