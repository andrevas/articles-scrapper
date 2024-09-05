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
import { CacheModule } from '@nestjs/cache-manager';
import { redisStore } from "cache-manager-redis-yet"
import { RedisClientOptions } from 'redis';

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
          host: configService.get<string>('REDIS_HOST'),
          port: configService.get<number>('REDIS_PORT'),
        },
      }),
      inject: [ConfigService],
    }),
    CacheModule.registerAsync<RedisClientOptions>({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        store: await redisStore({
          socket: {
            host: configService.get<string>("REDIS_HOST"),
            port: configService.get<number>("REDIS_PORT"),
          },
        }),
      }),
      isGlobal: true,
    }),
    ArticleHtmlScrapperModule,
    ArticlesModule
  ],
  providers: [YnetScrapperProvider, RssParser],
})
export class AppModule { }
