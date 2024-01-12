import { IsEmail, IsNotEmpty, IsString, IsOptional, IsNumber, IsEnum, IsBoolean } from 'class-validator';
import { PartialType } from "@nestjs/swagger";
import { Channel } from "src/chat/entities/chat.entity";
import { Game } from "src/game/entities/game.entity";
import { Message } from "src/chat/entities/chat.entity";
import { User, UserStatus } from '../entities/user.entity';

export class CreateUserDto {
	@IsNotEmpty({ message: 'Email cannot be empty' })
	@IsEmail({}, { message: 'Invalid email format' })
	email: string;

	@IsNotEmpty({ message: 'Login cannot be empty' })
	@IsString({ message: 'Login must be a string' })
	login: string;

	@IsBoolean({message: '2FA must be boolean' })
	twoFactorAuthIsEnabled?: boolean;

	@IsString({message: '2FA secret must be string' })
	twoFactorAuthSecret?: string;

	@IsNotEmpty({ message: 'Display name cannot be empty' })
	@IsString({ message: 'Display name must be a string' })
	displayname: string;

	@IsNotEmpty({ message: 'Image URL cannot be empty' })
	@IsString({ message: 'Image URL must be a string' })
	imageUrl: string;

	@IsOptional()
	@IsString({ message: 'Socket ID must be a string' })
	socketId?: string;

	@IsOptional()
	@IsString({ message: 'Nickname must be a string' })
	nickname?: string;

	@IsOptional()
	@IsString({ message: 'Avatar must be a string' })
	avatar?: string;

	// @IsOptional()
	// @IsString({ message: 'Status must be a string' })
	// status?: 'online' | 'offline' | 'in-chat' | 'in-game' | 'afk'

	@IsOptional()
	@IsEnum(UserStatus, { message: 'Invalid status' })
	status?: UserStatus = UserStatus.OFFLINE;

	// Friends
	@IsOptional()
	friends?: User[];

	// Channel
	@IsOptional()
	channels?: Channel[];

	@IsOptional()
	adminChannels?: Channel[];

	@IsOptional()
	bannedChannels?: Channel[];

	// Message
	@IsOptional()
	messages?: Message[];

	// Game
	@IsOptional()
	@IsNumber()
	gamesWon?: number;

	@IsOptional()
	@IsNumber()
	gamesLost?: number;

	@IsOptional()
	@IsNumber()
	currentRoomId?: number;

	@IsOptional()
	currentRoom?: Game;
}


/**
 * Burada extends PartialType(CreateUserDto) olarak eklenen kisimda,
 *  buradaki 'dto' dosyasinin icerisinden cekiyor da olabilir veriyi...
 */
export class UpdateUserDto extends PartialType(CreateUserDto) {
	// extends olarak tanimladigimiz icin bu CreateUserDto'nun
	//  icindeki her seyi buraya da yazdigimizi dusun.
}
