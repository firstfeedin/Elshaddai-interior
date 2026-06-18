import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Role } from '@prisma/client';

@Injectable()
export class AdminService {
  constructor(private prisma: PrismaService) {}

  async getDashboardStats() {
    const [
      total_users, total_projects, total_leads, active_projects,
      revenue_data, role_breakdown, recent_projects,
    ] = await Promise.all([
      this.prisma.user.count(),
      this.prisma.project.count(),
      this.prisma.consultation.count(),
      this.prisma.project.count({
        where: { status: { notIn: ['COMPLETED', 'CANCELLED', 'INQUIRY'] } },
      }),
      this.prisma.expense.aggregate({ _sum: { amount: true } }),
      this.prisma.user.groupBy({ by: ['role'], _count: true }),
      this.prisma.project.findMany({
        take: 5,
        orderBy: { created_at: 'desc' },
        include: { client: { select: { name: true, email: true } } },
      }),
    ]);

    return {
      total_users,
      total_projects,
      total_leads,
      active_projects,
      total_expenses: revenue_data._sum.amount || 0,
      role_breakdown,
      recent_projects,
    };
  }

  async getAllUsers(filters: any = {}) {
    const where: any = {};
    if (filters.role) where.role = filters.role;
    if (filters.search) {
      where.OR = [
        { name: { contains: filters.search, mode: 'insensitive' } },
        { email: { contains: filters.search, mode: 'insensitive' } },
      ];
    }
    return this.prisma.user.findMany({
      where,
      select: {
        id: true, name: true, email: true, phone: true, role: true,
        org_id: true, is_active: true, created_at: true, last_login: true,
        organisation: { select: { name: true } },
      },
      orderBy: { created_at: 'desc' },
    });
  }

  async updateUserRole(userId: string, role: Role) {
    return this.prisma.user.update({ where: { id: userId }, data: { role } });
  }

  async toggleUserActive(userId: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId }, select: { is_active: true } });
    return this.prisma.user.update({
      where: { id: userId },
      data: { is_active: !user?.is_active },
    });
  }

  async getLeads(status?: string) {
    return this.prisma.consultation.findMany({
      where: status ? { status: status as any } : {},
      orderBy: { created_at: 'desc' },
    });
  }
}
