import { Controller, Get, Post, Body, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { TimeLogsService } from './time-logs.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@ApiTags('time-logs')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('time-logs')
export class TimeLogsController {
  constructor(private service: TimeLogsService) {}

  @Post('start')
  @ApiOperation({ summary: 'Start stopwatch timer' })
  start(@CurrentUser('id') userId: string, @Body() body) {
    return this.service.start(userId, body);
  }

  @Post('stop')
  @ApiOperation({ summary: 'Stop active timer' })
  stop(@CurrentUser('id') userId: string) {
    return this.service.stop(userId);
  }

  @Get('active')
  @ApiOperation({ summary: 'Get currently running timer' })
  getActive(@CurrentUser('id') userId: string) {
    return this.service.getActive(userId);
  }

  @Post('manual')
  @ApiOperation({ summary: 'Log time manually' })
  logManual(@CurrentUser('id') userId: string, @Body() body) {
    return this.service.logManual(userId, body);
  }

  @Get('project/:projectId')
  getByProject(@Param('projectId') projectId: string) {
    return this.service.getByProject(projectId);
  }
}
