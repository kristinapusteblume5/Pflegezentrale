import { Body, Controller, Delete, Get, HttpCode, Param, Post, Put, UseGuards } from '@nestjs/common';
import { AuthGuard, AuthUser, CurrentUser } from '../auth/auth.guard';
import { FamiliesService } from './families.service';

@Controller('families')
@UseGuards(AuthGuard)
export class FamiliesController {
  constructor(private readonly families: FamiliesService) {}

  @Get()
  mine(@CurrentUser() u: AuthUser) {
    return this.families.listMine(u.id);
  }

  @Get(':familyId/members')
  members(@CurrentUser() u: AuthUser, @Param('familyId') id: string) {
    return this.families.listMembers(u.id, id);
  }

  @Post(':familyId/invitations')
  invite(@CurrentUser() u: AuthUser, @Param('familyId') id: string, @Body() body: unknown) {
    return this.families.invite(u.id, id, body);
  }

  @Put(':familyId/members/:userId/role')
  @HttpCode(200)
  role(@CurrentUser() u: AuthUser, @Param('familyId') id: string, @Param('userId') target: string, @Body() body: unknown) {
    return this.families.changeRole(u.id, id, target, body);
  }

  @Delete(':familyId/members/:userId')
  @HttpCode(204)
  remove(@CurrentUser() u: AuthUser, @Param('familyId') id: string, @Param('userId') target: string) {
    return this.families.removeMember(u.id, id, target);
  }
}
