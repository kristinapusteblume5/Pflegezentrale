import { Body, Controller, Delete, Get, HttpCode, Param, Patch, Post, Put, Query, UseGuards } from '@nestjs/common';
import { AuthGuard, AuthUser, CurrentUser } from '../auth/auth.guard';
import { CareService } from './care.service';

@Controller()
@UseGuards(AuthGuard)
export class CareController {
  constructor(private readonly care: CareService) {}

  @Post('families/:familyId/care-recipients')
  create(@CurrentUser() u: AuthUser, @Param('familyId') f: string, @Body() body: unknown) {
    return this.care.create(u.id, f, body);
  }

  @Get('families/:familyId/care-recipients')
  list(@CurrentUser() u: AuthUser, @Param('familyId') f: string) {
    return this.care.listForFamily(u.id, f);
  }

  @Get('care-recipients/:id')
  get(@CurrentUser() u: AuthUser, @Param('id') id: string) {
    return this.care.get(u.id, id);
  }

  @Patch('care-recipients/:id')
  update(@CurrentUser() u: AuthUser, @Param('id') id: string, @Body() body: unknown) {
    return this.care.update(u.id, id, body);
  }

  @Put('care-recipients/:id/permissions/:userId')
  @HttpCode(204)
  grant(@CurrentUser() u: AuthUser, @Param('id') id: string, @Param('userId') t: string) {
    return this.care.grant(u.id, id, t);
  }

  @Delete('care-recipients/:id/permissions/:userId')
  @HttpCode(204)
  revoke(@CurrentUser() u: AuthUser, @Param('id') id: string, @Param('userId') t: string) {
    return this.care.revoke(u.id, id, t);
  }

  @Get('care-recipients/:id/activity')
  activity(@CurrentUser() u: AuthUser, @Param('id') id: string, @Query('limit') limit?: string) {
    return this.care.activityFor(u.id, id, limit ? Number(limit) || 50 : 50);
  }
}
