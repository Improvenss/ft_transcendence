import { PartialType } from '@nestjs/swagger';
import { IsString, IsBoolean, IsOptional, IsEnum, IsNumber, IsArray, IsNotEmpty } from 'class-validator';
import { User } from 'src/users/entities/user.entity';

export class CreateChannelDto {
	@IsString()
	@IsNotEmpty()
	name: string;

	@IsEnum(['public', 'private', 'direct_message'])
	type: string;

	@IsString()
	@IsOptional()
	password: string;

	@IsString()
	@IsOptional()
	image: string;

	@IsArray()
	@IsOptional()
	members: User[];

	@IsArray()
	@IsOptional()
	@IsNotEmpty() // veya @IsDefined()
	admins: User[];
}

export class UpdateChannelDto extends PartialType(CreateChannelDto) {}