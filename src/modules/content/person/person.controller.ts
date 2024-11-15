
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
import { Person, PersonCareer } from '@prisma/client';
import { PersonService } from './person.service';
import {GetPersonsType} from "./types/getPersons.type";
import {GetPersonsByCareerType} from "./types/getPersonsByCareer.type";
import {RolesGuard} from "../../../common/guards/RolesGuard/roles.guard";
import {Roles} from "../../../common/decorators/roles.decorator";
import {CreatePersonType} from "./types/createPerson.type";
import {UpdatePersonTypeWithoutId} from "./types/updatePerson.type";

@Controller('person')
export class PersonController {
  constructor(private readonly personService: PersonService) {}

  @Get(':id')
  async getPerson(@Param('id', ParseIntPipe) id: number): Promise<Person> {
    return this.personService.getPerson(id);
  }

  @Get()
  async getPersons(@Query() getPersonsData: GetPersonsType): Promise<Person[]> {
    return this.personService.getPersons(getPersonsData);
  }

  @Get('career/:career')
  async getPersonsByCareer(
    @Param('career') career: PersonCareer,
    @Query() getPersonsByCareerData: GetPersonsByCareerType,
  ): Promise<Person[]> {
    return this.personService.getPersonsByCareer({
      ...getPersonsByCareerData,
      career,
    });
  }

  @UseGuards(RolesGuard)
  @Roles('admin', 'developer', 'editor')
  @Post()
  async createPerson(
    @Body() createPersonData: CreatePersonType,
  ): Promise<Person> {
    return this.personService.createPerson(createPersonData);
  }

  @UseGuards(RolesGuard)
  @Roles('admin', 'developer', 'editor')
  @Put('id')
  async updatePerson(
    @Body() updatePersonData: UpdatePersonTypeWithoutId,
    @Param('id', ParseIntPipe) id: number,
  ): Promise<Person> {
    return this.personService.updatePerson({ ...updatePersonData, id: id });
  }

  @UseGuards(RolesGuard)
  @Roles('admin', 'developer', 'editor')
  @Delete(':id')
  async deletePerson(@Param('id', ParseIntPipe) id: number): Promise<Person> {
    return this.personService.deletePerson(id);
  }
}
