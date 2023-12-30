import { PartialType } from '@nestjs/swagger';
import { IsString, IsDate, IsBoolean, IsOptional, IsEnum } from 'class-validator';
import { User } from '../entities/user.entity';

export class CreateNotifDto {
	@IsEnum(['text', 'sendFriendRequest', 'acceptFriendRequest', 'declineFriendRequest'])
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

	constructor(notifDto: Partial<CreateNotifDto>) {
	Object.assign(this, notifDto);
	}
}

export class UpdateNotifsDto extends PartialType(CreateNotifDto) {}