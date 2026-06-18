import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Role, ProjectStatus } from '@prisma/client';

@Injectable()
export class ProjectsService {
  constructor(private prisma: PrismaService) {}

  async findAll(user: any, filters: any = {}) {
    const where: any = {};

    // Role-based scoping
    if (user.role === Role.CLIENT) {
      where.client_id = user.id;
    } else if (user.role === Role.DESIGNER) {
      where.designer_id = user.id;
    } else if ([Role.BUILDER, Role.WORKSHOP_WORKER].includes(user.role)) {
      where.org_id = user.org_id;
    }
    // ADMIN and SUPER_ADMIN see all

    if (filters.status) where.status = filters.status;
    if (filters.city) where.city = { contains: filters.city, mode: 'insensitive' };

    return this.prisma.project.findMany({
      where,
      include: {
        client: { select: { id: true, name: true, email: true, phone: true, avatar: true } },
        designer: { select: { id: true, name: true, email: true, avatar: true } },
        _count: { select: { tasks: true, expenses: true, messages: true } },
      },
      orderBy: { created_at: 'desc' },
    });
  }

  async findOne(id: string, user: any) {
    const project = await this.prisma.project.findUnique({
      where: { id },
      include: {
        client: { select: { id: true, name: true, email: true, phone: true, avatar: true } },
        designer: { select: { id: true, name: true, email: true, avatar: true } },
        tasks: {
          include: {
            assignee: { select: { id: true, name: true, avatar: true } },
          },
          orderBy: [{ status: 'asc' }, { position: 'asc' }],
        },
        milestones: { orderBy: { due_date: 'asc' } },
        quotations: { orderBy: { created_at: 'desc' }, take: 1 },
        expenses: { orderBy: { date: 'desc' }, take: 10 },
        design_assets: { orderBy: { created_at: 'desc' } },
        daily_logs: { orderBy: { date: 'desc' }, take: 5 },
      },
    });

    if (!project) throw new NotFoundException('Project not found');
    this.checkAccess(project, user);
    return project;
  }

  async create(data: any, clientId: string) {
    const count = await this.prisma.project.count();
    const project_number = `ES-${new Date().getFullYear()}-${String(count + 1).padStart(4, '0')}`;

    return this.prisma.project.create({
      data: {
        ...data,
        client_id: clientId,
        project_number,
        status: ProjectStatus.INQUIRY,
      },
    });
  }

  async update(id: string, data: any, user: any) {
    const project = await this.prisma.project.findUnique({ where: { id } });
    if (!project) throw new NotFoundException('Project not found');
    this.checkAccess(project, user);

    return this.prisma.project.update({ where: { id }, data });
  }

  async updateStatus(id: string, status: ProjectStatus, user: any) {
    if (![Role.ADMIN, Role.SUPER_ADMIN, Role.DESIGNER].includes(user.role))
      throw new ForbiddenException('Only admin or designer can change project status');
    return this.prisma.project.update({ where: { id }, data: { status } });
  }

  async saveScene(id: string, scene_data: any, user: any) {
    const project = await this.prisma.project.findUnique({ where: { id } });
    if (!project) throw new NotFoundException('Project not found');
    this.checkAccess(project, user);
    return this.prisma.project.update({ where: { id }, data: { scene_data } });
  }

  async getStats(projectId: string) {
    const [taskStats, totalExpenses, timeLogged] = await Promise.all([
      this.prisma.task.groupBy({
        by: ['status'],
        where: { project_id: projectId },
        _count: true,
      }),
      this.prisma.expense.aggregate({
        where: { project_id: projectId },
        _sum: { amount: true },
      }),
      this.prisma.timeLog.aggregate({
        where: { project_id: projectId },
        _sum: { duration_min: true },
      }),
    ]);

    return {
      tasks: taskStats,
      total_expenses: totalExpenses._sum.amount || 0,
      hours_logged: Math.round((timeLogged._sum.duration_min || 0) / 60),
    };
  }

  private checkAccess(project: any, user: any) {
    if ([Role.SUPER_ADMIN, Role.ADMIN].includes(user.role)) return;
    if (user.role === Role.CLIENT && project.client_id !== user.id)
      throw new ForbiddenException('Access denied');
    if (user.role === Role.DESIGNER && project.designer_id !== user.id)
      throw new ForbiddenException('Access denied');
  }
}
