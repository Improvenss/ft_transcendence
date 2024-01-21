// import { IsNumber, Min, Max, IsEnum, IsInstance } from 'class-validator';
// import { User } from 'src/users/entities/user.entity';

// export enum GameResult {
// 	Win = 'win',
// 	Lose = 'lose',
// }

// export class CreateGameHistoryDto {
// 	@IsNumber()
// 	public id: number;

// 	@IsInstance(User) // -> Bu User tipinde bir nesne olacagini belirtiyor.
// 	user: User;

// 	@IsEnum(GameResult, { message: 'Invalid game result' })
// 	result: 'win' | 'lose';

// 	@IsNumber()
// 	@Min(0, { message: 'Game history score must be at least 0' })
// 	@Max(999, { message: 'Game history score cannot be greater than 999' })
// 	public score: number;

// 	public date: Date;
// }

// export class UpdateGameHistoryDto extends CreateGameHistoryDto {}
