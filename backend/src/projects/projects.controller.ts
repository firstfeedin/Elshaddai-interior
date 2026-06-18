import {
  Controller, Get, Post, Patch, Body, Param, Query, UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { ProjectsService } from './projects.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { ProjectStatus } from '@prisma/client';

@ApiTags('projects')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('projects')
export class ProjectsController {
  constructor(private service: ProjectsService) {}

  @Get()
  @ApiOperation({ summary: 'List projects (role-scoped)' })
  findAll(@CurrentUser() user, @Query() filters) {
    return this.service.findAll(user, filters);
  }

  @Post()
  @ApiOperation({ summary: 'Create new project' })
  create(@Body() body, @CurrentUser('id') userId) {
    return this.service.create(body, userId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get project details with tasks, assets, milestones' })
  findOne(@Param('id') id: string, @CurrentUser() user) {
    return this.service.findOne(id, user);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() body, @CurrentUser() user) {
    return this.service.update(id, body, user);
  }

  @Patch(':id/status')
  @ApiOperation({ summary: 'Advance project status/phase' })
  updateStatus(
    @Param('id') id: string,
    @Body('status') status: ProjectStatus,
    @CurrentUser() user,
  ) {
    return this.service.updateStatus(id, status, user);
  }

  @Patch(':id/scene')
  @ApiOperation({ summary: 'Save 3D room designer scene' })
  saveScene(@Param('id') id: string, @Body('scene_data') scene, @CurrentUser() user) {
    return this.service.saveScene(id, scene, user);
  }

  @Get(':id/stats')
  @ApiOperation({ summary: 'Project stats — tasks, expenses, hours' })
  getStats(@Param('id') id: string) {
    return this.service.getStats(id);
  }
}
