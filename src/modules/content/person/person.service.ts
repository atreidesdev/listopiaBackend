
import { Injectable } from '@nestjs/common';
import { Person, Prisma } from '@prisma/client';
import {PrismaService} from "../../../../prisma/prisma.service";
import {FileUtil} from "../../../common/utils/file.util";
import {GetPersonsType} from "./types/getPersons.type";
import {GetPersonsByCareerType} from "./types/getPersonsByCareer.type";
import {CreatePersonType} from "./types/createPerson.type";
import {UpdatePersonType} from "./types/updatePerson.type";

@Injectable()
export class PersonService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly fileUtil: FileUtil,
  ) {}

  async getPerson(id: number): Promise<Person> {
    const existingPerson = await this.prisma.person.findUnique({
      where: { id: id },
    });

    if (!existingPerson) {
      throw new Error('Person not found');
    }

    return existingPerson;
  }

  async getPersons(getPersonsData: GetPersonsType): Promise<Person[]> {
    const { page, pageSize, sortField, sortOrder } = getPersonsData;
    const skip = (page - 1) * pageSize;
    const take = pageSize;

    let orderBy: Prisma.PersonOrderByWithRelationInput = {
      visitCount: 'desc',
    };

    if (sortField && sortOrder) {
      orderBy = { [sortField]: sortOrder };
    }

    return this.prisma.person.findMany({
      skip,
      take,
      orderBy,
    });
  }

  async getPersonsByCareer(
    getPersonsByCareerData: GetPersonsByCareerType,
  ): Promise<Person[]> {
    const { career, page, pageSize, sortField, sortOrder } =
      getPersonsByCareerData;
    const skip = (page - 1) * pageSize;
    const take = pageSize;

    let orderBy = {};
    if (sortField && sortOrder) {
      orderBy = { [sortField]: sortOrder };
    }

    return this.prisma.person.findMany({
      where: { career: { has: career } },
      skip,
      take,
      orderBy,
    });
  }

  async createPerson(createPersonData: CreatePersonType): Promise<Person> {
    const { name, description, photo, birthday, career } = createPersonData;

    let photoPath = '';
    if (photo) {
      photoPath = await this.fileUtil.saveFile({
        file: photo,
        filename: `${name}_${Date.now()}`,
        folder: 'persons_photos',
      });
    }

    return this.prisma.person.create({
      data: {
        name: name,
        description: description,
        photoPath: photoPath,
        birthday: birthday,
        career: career,
      },
    });
  }

  async updatePerson(updatePersonData: UpdatePersonType): Promise<Person> {
    const { id, name, description, photo, birthday, career } = updatePersonData;

    const existingPerson = await this.prisma.person.findUnique({
      where: { id: id },
    });
    if (!existingPerson) {
      throw new Error('Person not found');
    }

    let photoPath = existingPerson.photoPath;
    if (photo) {
      if (photoPath) {
        photoPath = await this.fileUtil.updateFile(
          photo,
          photoPath,
          `${name}_${Date.now()}`,
          'persons_photos',
        );
      } else {
        photoPath = await this.fileUtil.saveFile({
          file: photo,
          filename: `${name}_${Date.now()}`,
          folder: 'persons_photos',
        });
      }
    }

    return this.prisma.person.update({
      where: { id },
      data: {
        name: name ?? existingPerson.name,
        description: description ?? existingPerson.description,
        photoPath: photoPath ?? existingPerson.photoPath,
        birthday: birthday ?? existingPerson.birthday,
        career: career ?? existingPerson.career,
      },
    });
  }

  async deletePerson(id: number): Promise<Person> {
    const existingPerson = await this.prisma.person.findUnique({
      where: { id },
    });
    if (!existingPerson) {
      throw new Error('Person not found');
    }

    if (existingPerson.photoPath) {
      await this.fileUtil.deleteFile(existingPerson.photoPath);
    }

    return this.prisma.person.delete({ where: { id } });
  }
}
