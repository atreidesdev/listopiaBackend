
import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { Character } from '@prisma/client';
import { CharacterService } from './character.service';
import {GetCharactersType} from "./types/getCharacters.type";
import {RolesGuard} from "../../../common/guards/RolesGuard/roles.guard";
import {Roles} from "../../../common/decorators/roles.decorator";
import {CreateCharacterType} from "./types/createCharacter.type";
import {UpdateCharacterTypeWithoutId} from "./types/updateCharacter.type";

@Controller('character')
export class CharacterController {
  constructor(private readonly characterService: CharacterService) {}

  @Get(':id')
  async getCharacter(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<Character> {
    return this.characterService.getCharacter(id);
  }

  @Get()
  async getCharacters(
    @Query() getCharacterData: GetCharactersType,
  ): Promise<Character[]> {
    return this.characterService.getCharacters(getCharacterData);
  }

  @UseGuards(RolesGuard)
  @Roles('admin', 'developer', 'editor')
  @Post()
  async createCharacter(
    @Body() createCharacterData: CreateCharacterType,
  ): Promise<Character> {
    return this.characterService.createCharacter(createCharacterData);
  }

  @UseGuards(RolesGuard)
  @Roles('admin', 'developer', 'editor')
  @Put(':id')
  async updateCharacter(
    @Body() updateCharacterData: UpdateCharacterTypeWithoutId,
    @Param('id', ParseIntPipe) id: number,
  ): Promise<Character> {
    return this.characterService.updateCharacter({
      ...updateCharacterData,
      id: id,
    });
  }

  @UseGuards(RolesGuard)
  @Roles('admin', 'developer', 'editor')
  @Delete(':id')
  async deleteCharacter(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<Character> {
    return this.characterService.deleteCharacter(id);
  }
}
