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
exports.TimeLogsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let TimeLogsService = class TimeLogsService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async start(userId, data) {
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
    async stop(userId) {
        const active = await this.prisma.timeLog.findFirst({
            where: { user_id: userId, ended_at: null },
        });
        if (!active)
            return { message: 'No active timer' };
        const duration_min = Math.round((Date.now() - active.started_at.getTime()) / 60000);
        return this.prisma.timeLog.update({
            where: { id: active.id },
            data: { ended_at: new Date(), duration_min },
        });
    }
    async getActive(userId) {
        return this.prisma.timeLog.findFirst({
            where: { user_id: userId, ended_at: null },
            include: { task: { select: { title: true } } },
        });
    }
    async getByProject(projectId) {
        return this.prisma.timeLog.findMany({
            where: { project_id: projectId },
            include: {
                user: { select: { id: true, name: true, avatar: true } },
                task: { select: { id: true, title: true } },
            },
            orderBy: { started_at: 'desc' },
        });
    }
    async logManual(userId, data) {
        const duration_min = data.duration_min ||
            Math.round((new Date(data.ended_at).getTime() - new Date(data.started_at).getTime()) / 60000);
        return this.prisma.timeLog.create({
            data: { ...data, user_id: userId, duration_min },
        });
    }
};
exports.TimeLogsService = TimeLogsService;
exports.TimeLogsService = TimeLogsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], TimeLogsService);
//# sourceMappingURL=time-logs.service.js.map