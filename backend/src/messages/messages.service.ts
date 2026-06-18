import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class MessagesService {
  constructor(private prisma: PrismaService) {}

  async getHistory(projectId: string, cursor?: string, take = 50) {
    return this.prisma.message.findMany({
      where: { project_id: projectId },
      include: { sender: { select: { id: true, name: true, avatar: true, role: true } } },
      orderBy: { created_at: 'desc' },
      take,
      ...(cursor ? { skip: 1, cursor: { id: cursor } } : {}),
    });
  }

  async send(projectId: string, senderId: string, data: any) {
    return this.prisma.message.create({
      data: { ...data, project_id: projectId, sender_id: senderId },
      include: { sender: { select: { id: true, name: true, avatar: true } } },
    });
  }
}
