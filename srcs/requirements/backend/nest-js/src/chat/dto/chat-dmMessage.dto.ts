import { PartialType } from '@nestjs/swagger';
import { IsString, IsDate, IsNumber, IsOptional, IsNotEmpty } from 'class-validator';
import { User } from 'src/users/entities/user.entity';
import { Channel, Dm } from '../entities/chat.entity';

export class CreateDmMessageDto {
	@IsString()
	@IsNotEmpty()
	content: string;

	@IsDate()
	@IsOptional()
	@IsNotEmpty()
	sentAt: Date;

	@IsNotEmpty()
	author: User;

	@IsNotEmpty()
	dm: Dm;
}

export class UpdateDmMessageDto extends PartialType(CreateDmMessageDto) {}