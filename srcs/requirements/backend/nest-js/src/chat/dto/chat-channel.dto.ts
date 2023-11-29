import { PartialType } from '@nestjs/swagger';
import { IsString, IsBoolean, IsOptional, IsEnum, IsNumber, IsArray, IsNotEmpty } from 'class-validator';
import { User } from 'src/users/entities/user.entity';

export class CreateChannelDto {
	@IsString()
	@IsNotEmpty()
	name: string;

	@IsBoolean()
	@IsOptional()
	isActive: boolean;

	@IsArray()
	@IsOptional()
	users: User[];

	@IsArray()
	@IsOptional()
	@IsNotEmpty() // veya @IsDefined()
	admins: User[];

	@IsEnum(['public', 'private', 'protected'])
	type: string;

	@IsString()
	@IsOptional()
	password: string | "none";
}

export class UpdateChannelDto extends PartialType(CreateChannelDto) {}