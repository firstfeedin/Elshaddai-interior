import { Controller, Get, Post, Patch, Delete, Body, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { TasksService } from './tasks.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { TaskStatus } from '@prisma/client';

@ApiTags('tasks')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('projects/:projectId/tasks')
export class TasksController {
  constructor(private service: TasksService) {}

  @Get('kanban')
  @ApiOperation({ summary: 'Get Kanban board columns for a project' })
  getKanban(@Param('projectId') projectId: string) {
    return this.service.getKanban(projectId);
  }

  @Get('timeline')
  @ApiOperation({ summary: 'Get tasks for Gantt/timeline view' })
  getTimeline(@Param('projectId') projectId: string) {
    return this.service.getTimeline(projectId);
  }

  @Post()
  create(
    @Param('projectId') projectId: string,
    @Body() body,
    @CurrentUser('id') userId: string,
  ) {
    return this.service.create(projectId, body, userId);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() body) {
    return this.service.update(id, body);
  }

  @Patch(':id/move')
  @ApiOperation({ summary: 'Move card between Kanban columns' })
  move(
    @Param('id') id: string,
    @Body('status') status: TaskStatus,
    @Body('position') position: number,
  ) {
    return this.service.moveCard(id, status, position);
  }

  @Delete(':id')
  delete(@Param('id') id: string) {
    return this.service.delete(id);
  }
}
