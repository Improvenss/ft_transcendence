import { IsNumber, IsEnum, IsInstance, IsDate, IsString } from 'class-validator';
import { GameStatus, User } from 'src/users/entities/user.entity';

export class CreateGameHistoryDto {
	constructor(gameHistoryDto: Partial<CreateGameHistoryDto>) {
		Object.assign(this, gameHistoryDto);
	}

	@IsInstance(User)
	user: User;

	@IsDate()
	date: Date;

	@IsString()
	name: string;

	@IsString()
	rival: string;

	@IsEnum(GameStatus, { message: 'Invalid game result' })
	public result: GameStatus;

	@IsString()
	score: string;

	@IsNumber()
	earnedXp: number;

	// @IsNumber()
	// @Min(0, { message: 'Game history score must be at least 0' })
	// @Max(999, { message: 'Game history score cannot be greater than 999' })
	// public score: number;
}

export class UpdateGameHistoryDto extends CreateGameHistoryDto {}
