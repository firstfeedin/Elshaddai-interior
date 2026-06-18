import { Controller, Get, Patch, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { AdminService } from './admin.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { Role } from '@prisma/client';

@ApiTags('admin')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.ADMIN, Role.SUPER_ADMIN)
@Controller('admin')
export class AdminController {
  constructor(private service: AdminService) {}

  @Get('stats')
  @ApiOperation({ summary: 'Platform dashboard stats' })
  stats() {
    return this.service.getDashboardStats();
  }

  @Get('users')
  users(@Query() filters) {
    return this.service.getAllUsers(filters);
  }

  @Patch('users/:id/role')
  updateRole(@Param('id') id: string, @Body('role') role: Role) {
    return this.service.updateUserRole(id, role);
  }

  @Patch('users/:id/toggle')
  toggleActive(@Param('id') id: string) {
    return this.service.toggleUserActive(id);
  }

  @Get('leads')
  leads(@Query('status') status?: string) {
    return this.service.getLeads(status);
  }
}
