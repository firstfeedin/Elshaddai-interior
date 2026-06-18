import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class TimeLogsService {
  constructor(private prisma: PrismaService) {}

  async start(userId: string, data: { task_id?: string; project_id?: string; description?: string }) {
    // End any active log for this user first
    const active = await this.prisma.timeLog.findFirst({
      where: { user_id: userId, ended_at: null },
    });
    if (active) {
      const mins = Math.round((Date.now() - active.started_at.getTime()) / 60000);
      await this.prisma.timeLog.update({
        where: { id: active.id },
        data: { ended_at: new Date(), duration_min: mins },
      });
    }
    return this.prisma.timeLog.create({
      data: { ...data, user_id: userId, started_at: new Date() },
    });
  }

  async stop(userId: string) {
    const active = await this.prisma.timeLog.findFirst({
      where: { user_id: userId, ended_at: null },
    });
    if (!active) return { message: 'No active timer' };
    const duration_min = Math.round((Date.now() - active.started_at.getTime()) / 60000);
    return this.prisma.timeLog.update({
      where: { id: active.id },
      data: { ended_at: new Date(), duration_min },
    });
  }

  async getActive(userId: string) {
    return this.prisma.timeLog.findFirst({
      where: { user_id: userId, ended_at: null },
      include: { task: { select: { title: true } } },
    });
  }

  async getByProject(projectId: string) {
    return this.prisma.timeLog.findMany({
      where: { project_id: projectId },
      include: {
        user: { select: { id: true, name: true, avatar: true } },
        task: { select: { id: true, title: true } },
      },
      orderBy: { started_at: 'desc' },
    });
  }

  async logManual(userId: string, data: any) {
    const duration_min = data.duration_min ||
      Math.round((new Date(data.ended_at).getTime() - new Date(data.started_at).getTime()) / 60000);
    return this.prisma.timeLog.create({
      data: { ...data, user_id: userId, duration_min },
    });
  }
}
