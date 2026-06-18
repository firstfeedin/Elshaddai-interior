import { Controller, Get, Post, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { LeadsService } from './leads.service';
import { Public } from '../common/decorators/public.decorator';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';

@ApiTags('leads')
@Controller('leads')
export class LeadsController {
  constructor(private service: LeadsService) {}

  @Public()
  @Post()
  @ApiOperation({ summary: 'Submit a consultation / lead form' })
  create(@Body() body) {
    return this.service.create(body);
  }

  @UseGuards(JwtAuthGuard)
  @Get()
  findAll() {
    return this.service.findAll();
  }
}
