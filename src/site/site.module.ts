import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Site, SiteSchema } from './schema/site.schema';
import { SiteService } from './site.service';
import { SiteController } from './site.controller';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: Site.name,
        schema: SiteSchema,
      },
    ]),
  ],
  controllers: [SiteController],
  providers: [SiteService],
})
export class SiteModule {}
