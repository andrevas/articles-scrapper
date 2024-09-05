import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { YnetScrapperProvider } from './rss-scrapper-cron/rss-scrapper-cron.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { HttpModule } from '@nestjs/axios';
import { RssParser } from './rss-scrapper-cron/parsers/rss-parser';
import { ArticlesProcessingQueue } from './queues/articles-processing-queue';

@Module({
  imports: [
    HttpModule,
    ScheduleModule.forRoot(),
    ConfigModule.forRoot(),
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        uri: configService.get<string>('MONGODB_URI'),
      }),
      inject: [ConfigService],
    }),
  ],
  providers: [YnetScrapperProvider, RssParser, ArticlesProcessingQueue],
})
export class AppModule { }
