import { IsEmail, IsString, MinLength, IsOptional, IsEnum } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Role } from '@prisma/client';

export class RegisterDto {
  @ApiProperty({ example: 'Rajesh Kumar' })
  @IsString()
  name: string;

  @ApiProperty({ example: 'rajesh@example.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'SecurePass@123', minLength: 8 })
  @IsString()
  @MinLength(8)
  password: string;

  @ApiPropertyOptional({ example: '+91 98765 43210' })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiPropertyOptional({ enum: Role, default: Role.CLIENT })
  @IsOptional()
  @IsEnum(Role)
  role?: Role;

  @ApiPropertyOptional({ example: 'Chennai' })
  @IsOptional()
  @IsString()
  city?: string;

  @ApiPropertyOptional({ description: 'Organisation name (for Admin/Designer/Builder)' })
  @IsOptional()
  @IsString()
  organisation_name?: string;

  @ApiPropertyOptional({ description: 'Years of experience (for designers/builders)' })
  @IsOptional()
  years_experience?: number;

  @ApiPropertyOptional({ description: 'Specialisation / trade (for workshop workers)' })
  @IsOptional()
  @IsString()
  specialisation?: string;
}
