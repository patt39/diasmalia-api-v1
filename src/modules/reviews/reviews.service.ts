import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../../app/database/database.service';
import { Prisma } from '@prisma/client';

@Injectable()
export class ReviewsService {
  constructor(private readonly client: DatabaseService) {}

  async create(createReviewDto: Prisma.ReviewCreateInput) {
    return this.client.review.create({ data: createReviewDto });
  }

  async findAll() {
    return this.client.review.findMany({});
  }

  async findOne(id: number) {
    return this.client.review.findUnique({
      where: {
        id,
      },
    });
  }

  async update(id: number, updateReviewDto: Prisma.ReviewUpdateInput) {
    return this.client.review.update({
      where: {
        id,
      },
      data: updateReviewDto,
    });
  }

  async remove(id: number) {
    return this.client.review.delete({
      where: { id },
    });
  }
}
