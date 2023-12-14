import { IsNotEmpty, IsOptional, IsString, IsInt, Min, isNumber, IsNumber } from "class-validator";
import { User } from "src/users/entities/user.entity";

export class CreateGameDto {
	@IsString()
	@IsNotEmpty()
	name: string;

	@IsString()
	@IsOptional()
	description?: string;

	@IsString()
	@IsOptional()
	ballLocation?: string;

	@IsString()
	@IsOptional()
	playerLeftLocation?: string;

	@IsString()
	@IsOptional()
	playerRightLocation?: string;

	@IsNumber()
	@IsInt()
	@Min(0)
	@IsOptional()
	playerLeftScore?: number;

	@IsInt()
	@IsNumber()
	@Min(0)
	@IsOptional()
	playerRightScore?: number;

	@IsNotEmpty()
	players: User[];

	@IsNotEmpty()
	admins: User[];

	// @IsOptional()
	watchers: User[];
}
