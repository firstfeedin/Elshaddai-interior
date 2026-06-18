import { Controller, Post, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { AiService } from './ai.service';
import { Public } from '../common/decorators/public.decorator';

@ApiTags('ai')
@Controller('ai')
export class AiController {
  constructor(private service: AiService) {}

  @Public()
  @Post('generate-design')
  @ApiOperation({ summary: 'AI design brief + BOQ + cost breakdown' })
  generate(@Body() body) {
    return this.service.generateDesign(body);
  }

  @Public()
  @Post('suggest-layout')
  suggest(@Body() body) {
    return this.service.suggestLayout(body.project_id, body.area, body.rooms);
  }

  @Public()
  @Post('recommend-materials')
  materials(@Body() body) {
    return this.service.recommendMaterials(body.style, body.budget, body.area);
  }
}
