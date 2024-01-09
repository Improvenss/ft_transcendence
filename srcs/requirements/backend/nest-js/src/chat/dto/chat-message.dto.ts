import { PartialType } from '@nestjs/swagger';
import { IsString, IsDate, IsNumber, IsOptional, IsNotEmpty } from 'class-validator';
import { User } from 'src/users/entities/user.entity';
import { Channel } from '../entities/chat.entity';

export class CreateMessageDto {
	@IsString()
	@IsNotEmpty()
	content: string;

	@IsDate()
	@IsOptional()
	@IsNotEmpty()
	sentAt: Date;

	// @IsNumber()
	@IsNotEmpty()
	author: User;

	// @IsNumber()
	@IsNotEmpty()
	channel: Channel;
}

export class UpdateMessageDto extends PartialType(CreateMessageDto) {}