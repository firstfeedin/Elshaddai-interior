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
exports.AdminService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let AdminService = class AdminService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async getDashboardStats() {
        const [total_users, total_projects, total_leads, active_projects, revenue_data, role_breakdown, recent_projects,] = await Promise.all([
            this.prisma.user.count(),
            this.prisma.project.count(),
            this.prisma.consultation.count(),
            this.prisma.project.count({
                where: { status: { notIn: ['COMPLETED', 'CANCELLED', 'INQUIRY'] } },
            }),
            this.prisma.expense.aggregate({ _sum: { amount: true } }),
            this.prisma.user.groupBy({ by: ['role'], _count: true }),
            this.prisma.project.findMany({
                take: 5,
                orderBy: { created_at: 'desc' },
                include: { client: { select: { name: true, email: true } } },
            }),
        ]);
        return {
            total_users,
            total_projects,
            total_leads,
            active_projects,
            total_expenses: revenue_data._sum.amount || 0,
            role_breakdown,
            recent_projects,
        };
    }
    async getAllUsers(filters = {}) {
        const where = {};
        if (filters.role)
            where.role = filters.role;
        if (filters.search) {
            where.OR = [
                { name: { contains: filters.search, mode: 'insensitive' } },
                { email: { contains: filters.search, mode: 'insensitive' } },
            ];
        }
        return this.prisma.user.findMany({
            where,
            select: {
                id: true, name: true, email: true, phone: true, role: true,
                org_id: true, is_active: true, created_at: true, last_login: true,
                organisation: { select: { name: true } },
            },
            orderBy: { created_at: 'desc' },
        });
    }
    async updateUserRole(userId, role) {
        return this.prisma.user.update({ where: { id: userId }, data: { role } });
    }
    async toggleUserActive(userId) {
        const user = await this.prisma.user.findUnique({ where: { id: userId }, select: { is_active: true } });
        return this.prisma.user.update({
            where: { id: userId },
            data: { is_active: !user?.is_active },
        });
    }
    async getLeads(status) {
        return this.prisma.consultation.findMany({
            where: status ? { status: status } : {},
            orderBy: { created_at: 'desc' },
        });
    }
};
exports.AdminService = AdminService;
exports.AdminService = AdminService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], AdminService);
//# sourceMappingURL=admin.service.js.map