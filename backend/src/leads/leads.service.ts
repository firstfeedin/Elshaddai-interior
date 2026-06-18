import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class LeadsService {
  constructor(private prisma: PrismaService) {}

  async create(data: any) {
    return this.prisma.consultation.create({ data });
  }

  async findAll() {
    return this.prisma.consultation.findMany({ orderBy: { created_at: 'desc' } });
  }
}
