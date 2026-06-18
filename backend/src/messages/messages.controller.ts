import { Controller, Get, Post, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { MessagesService } from './messages.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@ApiTags('messages')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('projects/:projectId/messages')
export class MessagesController {
  constructor(private service: MessagesService) {}

  @Get()
  getHistory(@Param('projectId') projectId: string, @Query('cursor') cursor?: string) {
    return this.service.getHistory(projectId, cursor);
  }

  @Post()
  send(@Param('projectId') projectId: string, @CurrentUser('id') userId, @Body() body) {
    return this.service.send(projectId, userId, body);
  }
}
