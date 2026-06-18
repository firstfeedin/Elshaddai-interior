import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule } from '@nestjs/throttler';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { OrganisationsModule } from './organisations/organisations.module';
import { ProjectsModule } from './projects/projects.module';
import { TasksModule } from './tasks/tasks.module';
import { TimeLogsModule } from './time-logs/time-logs.module';
import { ExpensesModule } from './expenses/expenses.module';
import { MessagesModule } from './messages/messages.module';
import { DesignAssetsModule } from './design-assets/design-assets.module';
import { AiModule } from './ai/ai.module';
import { AdminModule } from './admin/admin.module';
import { LeadsModule } from './leads/leads.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, envFilePath: '.env' }),
    ThrottlerModule.forRoot([{ ttl: 60000, limit: 100 }]),
    PrismaModule,
    AuthModule,
    UsersModule,
    OrganisationsModule,
    ProjectsModule,
    TasksModule,
    TimeLogsModule,
    ExpensesModule,
    MessagesModule,
    DesignAssetsModule,
    AiModule,
    AdminModule,
    LeadsModule,
  ],
})
export class AppModule {}
