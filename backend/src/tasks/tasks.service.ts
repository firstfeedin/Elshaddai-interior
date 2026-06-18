import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { TaskStatus } from '@prisma/client';

@Injectable()
export class TasksService {
  constructor(private prisma: PrismaService) {}

  async getKanban(projectId: string) {
    const tasks = await this.prisma.task.findMany({
      where: { project_id: projectId, parent_id: null },
      include: {
        assignee: { select: { id: true, name: true, avatar: true } },
        creator: { select: { id: true, name: true } },
        sub_tasks: {
          include: { assignee: { select: { id: true, name: true, avatar: true } } },
        },
        _count: { select: { time_logs: true } },
      },
      orderBy: { position: 'asc' },
    });

    // Group into columns
    const columns: Record<string, any[]> = {
      BACKLOG: [], TODO: [], IN_PROGRESS: [], REVIEW: [], DONE: [], BLOCKED: [],
    };
    for (const task of tasks) {
      if (columns[task.status]) columns[task.status].push(task);
    }
    return columns;
  }

  async create(projectId: string, data: any, creatorId: string) {
    const maxPos = await this.prisma.task.aggregate({
      where: { project_id: projectId, status: data.status || TaskStatus.TODO },
      _max: { position: true },
    });
    return this.prisma.task.create({
      data: {
        ...data,
        project_id: projectId,
        creator_id: creatorId,
        position: (maxPos._max.position || 0) + 1,
      },
    });
  }

  async update(id: string, data: any) {
    const task = await this.prisma.task.findUnique({ where: { id } });
    if (!task) throw new NotFoundException('Task not found');
    return this.prisma.task.update({ where: { id }, data });
  }

  async moveCard(id: string, status: TaskStatus, position: number) {
    return this.prisma.task.update({ where: { id }, data: { status, position } });
  }

  async delete(id: string) {
    await this.prisma.task.delete({ where: { id } });
    return { message: 'Task deleted' };
  }

  async getTimeline(projectId: string) {
    return this.prisma.task.findMany({
      where: { project_id: projectId },
      select: {
        id: true, title: true, status: true, priority: true, type: true,
        due_date: true, estimated_hrs: true, actual_hrs: true,
        assignee: { select: { name: true, avatar: true } },
      },
      orderBy: { due_date: 'asc' },
    });
  }
}
