import { Module } from '@nestjs/common';
import { BookModule } from './book/book.module';
import { CastModule } from './cast/cast.module';
import { CharacterModule } from './character/character.module';
import { DeveloperModule } from './developer/developer.module';
import { FranchiseModule } from './franchise/franchise.module';
import { GameModule } from './game/game.module';
import { GenreModule } from './genre/genre.module';
import { ListModule } from './list/list.module';
import { MovieModule } from './movie/movie.module';
import { PersonModule } from './person/person.module';
import { PlatformModule } from './platform/platform.module';
import { PublisherModule } from './publisher/publisher.module';
import { StudioModule } from './studio/studio.module';
import { ThemeModule } from './theme/theme.module';
import {CollectionModule} from "./collection/collection.module";

@Module({
  imports: [
    GenreModule,
    ThemeModule,
    PersonModule,
    CharacterModule,
    DeveloperModule,
    PublisherModule,
    CastModule,
    StudioModule,
    PlatformModule,
    FranchiseModule,
    BookModule,
    GameModule,
    MovieModule,
    ListModule,
    CollectionModule,
  ],
})
export class ContentModule {}
