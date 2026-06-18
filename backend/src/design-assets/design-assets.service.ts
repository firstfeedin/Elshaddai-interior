import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class DesignAssetsService {
  constructor(private prisma: PrismaService) {}

  async getByProject(projectId: string, type?: string) {
    return this.prisma.designAsset.findMany({
      where: { project_id: projectId, ...(type ? { type: type as any } : {}) },
      include: { uploader: { select: { id: true, name: true } } },
      orderBy: { created_at: 'desc' },
    });
  }

  async create(projectId: string, uploaderId: string, data: any) {
    return this.prisma.designAsset.create({
      data: { ...data, project_id: projectId, uploader_id: uploaderId },
    });
  }

  async delete(id: string) {
    await this.prisma.designAsset.delete({ where: { id } });
    return { message: 'Asset deleted' };
  }
}
