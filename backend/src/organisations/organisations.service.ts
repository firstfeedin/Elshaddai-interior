import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class OrganisationsService {
  constructor(private prisma: PrismaService) {}

  async findById(id: string) {
    return this.prisma.organisation.findUnique({
      where: { id },
      include: { _count: { select: { users: true, projects: true } } },
    });
  }

  async update(id: string, data: any) {
    return this.prisma.organisation.update({ where: { id }, data });
  }

  async getMembers(orgId: string) {
    return this.prisma.user.findMany({
      where: { org_id: orgId },
      select: { id: true, name: true, email: true, role: true, avatar: true, is_active: true },
    });
  }
}
