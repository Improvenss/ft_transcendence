import { PartialType } from '@nestjs/swagger';
import { IsString, IsDate, IsBoolean, IsOptional, IsEnum } from 'class-validator';
import { User } from '../entities/user.entity';

export class CreateNotifsDto {
	@IsEnum(['text', 'sendFriendRequest'])
	type: string;

	@IsString()
	text: string;

	@IsDate()
	date: Date;

	@IsOptional()
	user: User; 

	@IsBoolean()
	read: boolean;

	@IsString()
	from: string;

	constructor(notifsDto: Partial<CreateNotifsDto>) {
	Object.assign(this, notifsDto);
	}
}

export class UpdateNotifsDto extends PartialType(CreateNotifsDto) {}