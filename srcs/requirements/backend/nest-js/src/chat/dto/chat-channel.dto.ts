import { PartialType } from '@nestjs/swagger';
import { IsString, IsBoolean, IsOptional, IsEnum, IsNumber, IsArray, IsNotEmpty } from 'class-validator';
import { User } from 'src/users/entities/user.entity';
import { ChannelType, Message } from '../entities/chat.entity';

export class CreateChannelDto {
	@IsString()
	@IsNotEmpty()
	name: string;

	@IsNotEmpty()
	@IsEnum(ChannelType, { message: 'Invalid status' })
	type: ChannelType;
	// @IsEnum(['public', 'private', 'direct_message'])
	// type: string;

	@IsString()
	description: string;

	@IsString()
	password: string | null;

	@IsString()
	@IsNotEmpty()
	image: string;

	@IsArray()
	@IsNotEmpty()
	members: User[];

	@IsArray()
	@IsNotEmpty() // veya @IsDefined()
	admins: User[];

	@IsArray()
	bannedUsers: User[];

	@IsArray()
	messages: Message[];
}

export class UpdateChannelDto extends PartialType(CreateChannelDto) {}