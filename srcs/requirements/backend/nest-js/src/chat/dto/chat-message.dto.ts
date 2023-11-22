import { PartialType } from '@nestjs/swagger';
import { IsString, IsDate, IsNumber, IsOptional } from 'class-validator';

export class CreateMessageDto {
	@IsString()
	message: string;

	@IsDate()
	@IsOptional()
	sentAt?: Date;

	@IsNumber()
	userId: number;

	@IsNumber()
	channelId: number;
}

export class UpdateMessageDto extends PartialType(CreateMessageDto) {
	// @IsString()
	// @IsOptional()
	// message?: string;

	// @IsDate()
	// @IsOptional()
	// sentAt?: Date;

	// @IsNumber()
	// @IsOptional()
	// userId?: number;

	// @IsNumber()
	// @IsOptional()
	// channelId?: number;
}
