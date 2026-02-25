import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { HealthController } from './health.controller';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { PostsModule } from './posts/posts.module';
import { VotesModule } from './votes/votes.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      // Load env vars from a production file (for Railway) and override with local .env when present
      envFilePath: ['.env.production', '.env'],
    }),
    UsersModule,
    AuthModule,
    PostsModule,
    VotesModule,
  ],
  controllers: [HealthController],
  providers: [],
})
export class AppModule {}


