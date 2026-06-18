import { Controller, Get, Post, Patch, Body, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { ExpensesService } from './expenses.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@ApiTags('expenses')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('projects/:projectId/expenses')
export class ExpensesController {
  constructor(private service: ExpensesService) {}

  @Get()
  getByProject(@Param('projectId') projectId: string) {
    return this.service.getByProject(projectId);
  }

  @Post()
  create(@Param('projectId') projectId: string, @CurrentUser('id') userId, @Body() body) {
    return this.service.create(projectId, userId, body);
  }

  @Patch(':id/approve')
  approve(@Param('id') id: string) {
    return this.service.approve(id);
  }
}
