import { Controller, Get, Post, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { DesignAssetsService } from './design-assets.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@ApiTags('design-assets')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('projects/:projectId/assets')
export class DesignAssetsController {
  constructor(private service: DesignAssetsService) {}

  @Get()
  getByProject(@Param('projectId') projectId: string, @Query('type') type?: string) {
    return this.service.getByProject(projectId, type);
  }

  @Post()
  create(@Param('projectId') projectId: string, @CurrentUser('id') userId, @Body() body) {
    return this.service.create(projectId, userId, body);
  }

  @Delete(':id')
  delete(@Param('id') id: string) {
    return this.service.delete(id);
  }
}
