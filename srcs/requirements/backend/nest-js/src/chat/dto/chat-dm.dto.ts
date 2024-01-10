import { PartialType } from '@nestjs/swagger';
import { IsString, IsArray, IsNotEmpty } from 'class-validator';
import { User } from 'src/users/entities/user.entity';
import { Message } from '../entities/chat.entity';

export class CreateDmDto {
	@IsString()
	@IsNotEmpty()
	name: string;

	@IsString()
	@IsNotEmpty()
	image: string;

	@IsArray()
	@IsNotEmpty()
	members: User[];

	@IsArray()
	messages: Message[];
}

export class UpdateDmDto extends PartialType(CreateDmDto) {}