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
exports.ProjectsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const client_1 = require("@prisma/client");
let ProjectsService = class ProjectsService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async findAll(user, filters = {}) {
        const where = {};
        if (user.role === client_1.Role.CLIENT) {
            where.client_id = user.id;
        }
        else if (user.role === client_1.Role.DESIGNER) {
            where.designer_id = user.id;
        }
        else if ([client_1.Role.BUILDER, client_1.Role.WORKSHOP_WORKER].includes(user.role)) {
            where.org_id = user.org_id;
        }
        if (filters.status)
            where.status = filters.status;
        if (filters.city)
            where.city = { contains: filters.city, mode: 'insensitive' };
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
    async findOne(id, user) {
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
        if (!project)
            throw new common_1.NotFoundException('Project not found');
        this.checkAccess(project, user);
        return project;
    }
    async create(data, clientId) {
        const count = await this.prisma.project.count();
        const project_number = `ES-${new Date().getFullYear()}-${String(count + 1).padStart(4, '0')}`;
        return this.prisma.project.create({
            data: {
                ...data,
                client_id: clientId,
                project_number,
                status: client_1.ProjectStatus.INQUIRY,
            },
        });
    }
    async update(id, data, user) {
        const project = await this.prisma.project.findUnique({ where: { id } });
        if (!project)
            throw new common_1.NotFoundException('Project not found');
        this.checkAccess(project, user);
        return this.prisma.project.update({ where: { id }, data });
    }
    async updateStatus(id, status, user) {
        if (![client_1.Role.ADMIN, client_1.Role.SUPER_ADMIN, client_1.Role.DESIGNER].includes(user.role))
            throw new common_1.ForbiddenException('Only admin or designer can change project status');
        return this.prisma.project.update({ where: { id }, data: { status } });
    }
    async saveScene(id, scene_data, user) {
        const project = await this.prisma.project.findUnique({ where: { id } });
        if (!project)
            throw new common_1.NotFoundException('Project not found');
        this.checkAccess(project, user);
        return this.prisma.project.update({ where: { id }, data: { scene_data } });
    }
    async getStats(projectId) {
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
    checkAccess(project, user) {
        if ([client_1.Role.SUPER_ADMIN, client_1.Role.ADMIN].includes(user.role))
            return;
        if (user.role === client_1.Role.CLIENT && project.client_id !== user.id)
            throw new common_1.ForbiddenException('Access denied');
        if (user.role === client_1.Role.DESIGNER && project.designer_id !== user.id)
            throw new common_1.ForbiddenException('Access denied');
    }
};
exports.ProjectsService = ProjectsService;
exports.ProjectsService = ProjectsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], ProjectsService);
//# sourceMappingURL=projects.service.js.map