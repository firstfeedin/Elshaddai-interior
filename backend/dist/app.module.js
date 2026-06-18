"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const throttler_1 = require("@nestjs/throttler");
const prisma_module_1 = require("./prisma/prisma.module");
const auth_module_1 = require("./auth/auth.module");
const users_module_1 = require("./users/users.module");
const organisations_module_1 = require("./organisations/organisations.module");
const projects_module_1 = require("./projects/projects.module");
const tasks_module_1 = require("./tasks/tasks.module");
const time_logs_module_1 = require("./time-logs/time-logs.module");
const expenses_module_1 = require("./expenses/expenses.module");
const messages_module_1 = require("./messages/messages.module");
const design_assets_module_1 = require("./design-assets/design-assets.module");
const ai_module_1 = require("./ai/ai.module");
const admin_module_1 = require("./admin/admin.module");
const leads_module_1 = require("./leads/leads.module");
let AppModule = class AppModule {
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            config_1.ConfigModule.forRoot({ isGlobal: true, envFilePath: '.env' }),
            throttler_1.ThrottlerModule.forRoot([{ ttl: 60000, limit: 100 }]),
            prisma_module_1.PrismaModule,
            auth_module_1.AuthModule,
            users_module_1.UsersModule,
            organisations_module_1.OrganisationsModule,
            projects_module_1.ProjectsModule,
            tasks_module_1.TasksModule,
            time_logs_module_1.TimeLogsModule,
            expenses_module_1.ExpensesModule,
            messages_module_1.MessagesModule,
            design_assets_module_1.DesignAssetsModule,
            ai_module_1.AiModule,
            admin_module_1.AdminModule,
            leads_module_1.LeadsModule,
        ],
    })
], AppModule);
//# sourceMappingURL=app.module.js.map