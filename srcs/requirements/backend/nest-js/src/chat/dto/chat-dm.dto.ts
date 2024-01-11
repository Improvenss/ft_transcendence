import { PartialType } from '@nestjs/swagger';
import { IsString, IsArray, IsNotEmpty } from 'class-validator';
import { User } from 'src/users/entities/user.entity';
import { DmMessage, Message } from '../entities/chat.entity';

export class CreateDmDto {

	@IsArray()
	@IsNotEmpty()
	usersData: {
		id: number,
		login: string,
		displayname: string,
		imageUrl: string
	}[];

	@IsArray()
	@IsNotEmpty()
	members: User[];

	@IsArray()
	messages: DmMessage[];
}

export class UpdateDmDto extends PartialType(CreateDmDto) {}