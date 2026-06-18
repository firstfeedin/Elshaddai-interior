import { IsEmail, IsString, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class LoginDto {
  @ApiProperty({ example: 'rajesh@example.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'SecurePass@123' })
  @IsString()
  password: string;

  @ApiPropertyOptional({ description: 'TOTP code if MFA is enabled' })
  @IsOptional()
  @IsString()
  mfa_code?: string;
}
