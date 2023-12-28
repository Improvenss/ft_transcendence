import { PartialType } from '@nestjs/swagger';
import { IsString, IsDate, IsBoolean, IsOptional } from 'class-validator';
import { User } from '../entities/user.entity';

export class CreateNotifsDto {
	@IsString()
	@IsOptional()
	text: string;

	@IsDate()
	@IsOptional()
	date: Date;

	@IsString()
	@IsOptional()
	user: User; 

	@IsBoolean()
	@IsOptional()
	read: boolean;

	constructor(notifsDto: Partial<CreateNotifsDto>) {
	Object.assign(this, notifsDto);
	}
}

export class UpdateNotifsDto extends PartialType(CreateNotifsDto) {}