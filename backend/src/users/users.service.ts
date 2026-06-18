import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async findById(id: string) {
    return this.prisma.user.findUnique({
      where: { id },
      select: {
        id: true, name: true, email: true, phone: true, avatar: true,
        role: true, org_id: true, profile_data: true, created_at: true,
        organisation: { select: { id: true, name: true, slug: true } },
      },
    });
  }

  async updateProfile(id: string, data: any) {
    const { name, phone, avatar, profile_data } = data;
    return this.prisma.user.update({
      where: { id },
      data: { name, phone, avatar, profile_data },
      select: { id: true, name: true, email: true, phone: true, avatar: true, profile_data: true },
    });
  }

  async getDesigners(orgId?: string) {
    return this.prisma.user.findMany({
      where: { role: 'DESIGNER', is_active: true, ...(orgId ? { org_id: orgId } : {}) },
      select: { id: true, name: true, avatar: true, profile_data: true },
    });
  }
}
