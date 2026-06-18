import { Controller, Get, Patch, Body, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { OrganisationsService } from './organisations.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@ApiTags('organisations')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('organisations')
export class OrganisationsController {
  constructor(private service: OrganisationsService) {}

  @Get('me')
  getMyOrg(@CurrentUser('org_id') orgId: string) {
    return this.service.findById(orgId);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() body) {
    return this.service.update(id, body);
  }

  @Get(':id/members')
  getMembers(@Param('id') id: string) {
    return this.service.getMembers(id);
  }
}
