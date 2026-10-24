import { Body, Controller, HttpCode, Post, Req, UseGuards } from '@nestjs/common';
import { Request } from 'express';
import { AuthGuard, AuthUser, CurrentUser } from './auth.guard';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
  constructor(private readonly auth: AuthService) {}

  @Post('register')
  register(@Body() body: unknown) {
    return this.auth.register(body);
  }

  @Post('login')
  @HttpCode(200)
  login(@Body() body: unknown, @Req() req: Request) {
    return this.auth.login(body, req.ip ?? 'unknown');
  }

  @Post('refresh')
  @HttpCode(200)
  refresh(@Body() body: unknown) {
    return this.auth.refresh(body);
  }

  @Post('logout')
  @HttpCode(204)
  @UseGuards(AuthGuard)
  async logout(@CurrentUser() user: AuthUser) {
    await this.auth.logout(user.sessionId);
  }

  @Post('accept-invite')
  acceptInvite(@Body() body: unknown) {
    return this.auth.acceptInviteNewUser(body);
  }

  @Post('accept-invite/existing')
  @HttpCode(200)
  @UseGuards(AuthGuard)
  acceptInviteExisting(@CurrentUser() user: AuthUser, @Body() body: { token?: string }) {
    return this.auth.acceptInviteExistingUser(user.id, String(body?.token ?? ''));
  }
}
