import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ExpensesService {
  constructor(private prisma: PrismaService) {}

  async getByProject(projectId: string) {
    const [expenses, summary] = await Promise.all([
      this.prisma.expense.findMany({
        where: { project_id: projectId },
        include: { user: { select: { id: true, name: true } } },
        orderBy: { date: 'desc' },
      }),
      this.prisma.expense.groupBy({
        by: ['category'],
        where: { project_id: projectId },
        _sum: { amount: true },
      }),
    ]);
    return { expenses, summary };
  }

  async create(projectId: string, userId: string, data: any) {
    const gst_amount = data.amount * (data.gst_rate || 0) / 100;
    return this.prisma.expense.create({
      data: { ...data, project_id: projectId, user_id: userId, gst_amount },
    });
  }

  async approve(id: string) {
    return this.prisma.expense.update({ where: { id }, data: { approved: true } });
  }
}
