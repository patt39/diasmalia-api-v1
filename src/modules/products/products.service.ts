import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../../app/database/database.service';
import { Prisma } from '@prisma/client';

@Injectable()
export class ProductsService {
  constructor(private readonly client: DatabaseService) {}

  async create(createProductDto: Prisma.ProductCreateInput) {
    return this.client.product.create({ data: createProductDto });
  }

  async findAll() {
    return this.client.product.findMany({});
  }

  async findOne(id: string) {
    return this.client.product.findUnique({
      where: {
        id,
      },
      include: {
        description: true,
        tags: true,
        reviews: true,
      },
    });
  }

  async update(id: string, updateProductDto: Prisma.ProductUpdateInput) {
    return this.client.product.update({
      where: {
        id,
      },
      data: updateProductDto,
    });
  }

  async remove(id: string) {
    return this.client.product.delete({
      where: { id },
    });
  }
}
