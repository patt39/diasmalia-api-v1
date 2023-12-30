import { Injectable } from '@nestjs/common';
import {
  AnimalStatusSelect,
  GetOneAnimalStatusSelections,
  UpdateAnimalStatusesSelections,
  CreateAnimalStatusesOptions,
  UpdateAnimalStatusesOptions,
} from './animal-statuses.type';
import { DatabaseService } from '../../app/database/database.service';
import { AnimalStatus, Prisma } from '@prisma/client';

@Injectable()
export class AnimalStatusesService {
  constructor(private readonly client: DatabaseService) {}

  async findAll() {
    const prismaWhere = {} as Prisma.AnimalStatusWhereInput;

    const animalStatus = await this.client.animalStatus.findMany({
      where: { ...prismaWhere, deletedAt: null },
      select: AnimalStatusSelect,
    });

    return animalStatus;
  }
  /** Find one Animals to the database. */
  async findOneBy(selections: GetOneAnimalStatusSelections) {
    const { animalStatusId } = selections;
    const animalStatus = await this.client.animalStatus.findUnique({
      select: AnimalStatusSelect,
      where: {
        id: animalStatusId,
      },
    });

    return animalStatus;
  }

  /** Create one animal status in database. */
  async createOne(options: CreateAnimalStatusesOptions): Promise<AnimalStatus> {
    const { title, color } = options;

    const animalStatus = this.client.animalStatus.create({
      data: {
        title,
        color,
      },
    });

    return animalStatus;
  }

  /** Update one animal status in database. */
  async updateOne(
    selections: UpdateAnimalStatusesSelections,
    options: UpdateAnimalStatusesOptions,
  ): Promise<AnimalStatus> {
    const { animalStatusId } = selections;
    const { title, color } = options;

    const animalStatus = this.client.animalStatus.update({
      where: {
        id: animalStatusId,
      },
      data: {
        title,
        color,
      },
    });

    return animalStatus;
  }
}
