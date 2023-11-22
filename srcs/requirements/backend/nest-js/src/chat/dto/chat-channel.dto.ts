import { PartialType } from '@nestjs/swagger';
import { IsString, IsBoolean, IsOptional, IsEnum, IsNumber, IsArray } from 'class-validator';

export class CreateChannelDto {
	@IsString()
	name: string;

	@IsBoolean()
	@IsOptional()
	isActive?: boolean;

	@IsArray()
	@IsOptional()
	adminId?: number[];

	@IsEnum(['public', 'private', 'password'])
	type: string;

	@IsString()
	@IsOptional()
	password?: string;
}

export class UpdateChannelDto extends PartialType(CreateChannelDto) {
	// @IsString()
	// @IsOptional()
	// name?: string;

	// @IsBoolean()
	// @IsOptional()
	// isActive?: boolean;

	// @IsArray()
	// @IsOptional()
	// adminId?: number[];

	// @IsEnum(['public', 'private', 'password'])
	// @IsOptional()
	// type?: string;

	// @IsString()
	// @IsOptional()
	// password?: string;
}