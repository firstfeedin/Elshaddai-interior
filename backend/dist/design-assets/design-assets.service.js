"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DesignAssetsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let DesignAssetsService = class DesignAssetsService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async getByProject(projectId, type) {
        return this.prisma.designAsset.findMany({
            where: { project_id: projectId, ...(type ? { type: type } : {}) },
            include: { uploader: { select: { id: true, name: true } } },
            orderBy: { created_at: 'desc' },
        });
    }
    async create(projectId, uploaderId, data) {
        return this.prisma.designAsset.create({
            data: { ...data, project_id: projectId, uploader_id: uploaderId },
        });
    }
    async delete(id) {
        await this.prisma.designAsset.delete({ where: { id } });
        return { message: 'Asset deleted' };
    }
};
exports.DesignAssetsService = DesignAssetsService;
exports.DesignAssetsService = DesignAssetsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], DesignAssetsService);
//# sourceMappingURL=design-assets.service.js.map