import {
  Controller, Post, Get, Body, Req, Res, UseGuards, HttpCode, HttpStatus, Patch,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { Public } from '../common/decorators/public.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private auth: AuthService) {}

  @Public()
  @Post('register')
  @ApiOperation({ summary: 'Register new user (any role)' })
  register(@Body() dto: RegisterDto) {
    return this.auth.register(dto);
  }

  @Public()
  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Login — returns access + refresh tokens' })
  login(@Body() dto: LoginDto, @Req() req) {
    return this.auth.login(dto, req.ip);
  }

  @Public()
  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Refresh access token' })
  refresh(@Body('refresh_token') token: string) {
    return this.auth.refresh(token);
  }

  @UseGuards(JwtAuthGuard)
  @Post('logout')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  logout(@Body('refresh_token') token: string) {
    return this.auth.logout(token);
  }

  @UseGuards(JwtAuthGuard)
  @Get('me')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get current user profile' })
  me(@CurrentUser('id') userId: string) {
    return this.auth.getMe(userId);
  }

  @UseGuards(JwtAuthGuard)
  @Post('mfa/setup')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Initialise MFA — returns QR code' })
  setupMfa(@CurrentUser('id') userId: string) {
    return this.auth.setupMfa(userId);
  }

  @UseGuards(JwtAuthGuard)
  @Post('mfa/verify')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Confirm MFA TOTP and enable' })
  verifyMfa(@CurrentUser('id') userId: string, @Body('token') token: string) {
    return this.auth.verifyMfaSetup(userId, token);
  }
}
