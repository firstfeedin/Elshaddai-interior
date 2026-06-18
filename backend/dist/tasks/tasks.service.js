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
exports.TasksService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const client_1 = require("@prisma/client");
let TasksService = class TasksService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async getKanban(projectId) {
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
        const columns = {
            BACKLOG: [], TODO: [], IN_PROGRESS: [], REVIEW: [], DONE: [], BLOCKED: [],
        };
        for (const task of tasks) {
            if (columns[task.status])
                columns[task.status].push(task);
        }
        return columns;
    }
    async create(projectId, data, creatorId) {
        const maxPos = await this.prisma.task.aggregate({
            where: { project_id: projectId, status: data.status || client_1.TaskStatus.TODO },
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
    async update(id, data) {
        const task = await this.prisma.task.findUnique({ where: { id } });
        if (!task)
            throw new common_1.NotFoundException('Task not found');
        return this.prisma.task.update({ where: { id }, data });
    }
    async moveCard(id, status, position) {
        return this.prisma.task.update({ where: { id }, data: { status, position } });
    }
    async delete(id) {
        await this.prisma.task.delete({ where: { id } });
        return { message: 'Task deleted' };
    }
    async getTimeline(projectId) {
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
};
exports.TasksService = TasksService;
exports.TasksService = TasksService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], TasksService);
//# sourceMappingURL=tasks.service.js.map