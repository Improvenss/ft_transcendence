import { PartialType } from "@nestjs/swagger";
import { IsNotEmpty, IsOptional, IsString, IsInt, Min, IsNumber, IsEnum, Max, IsPositive, IsBoolean } from "class-validator";
import { User } from "src/users/entities/user.entity";

export enum GameMode {
	classic = 'Classic',
	teamBattle = 'Team Battle',
}

export class CreateGameDto {
	@IsString()
	@IsNotEmpty()
	name: string;

	@IsString()
	@IsOptional()
	password?: string;

	@IsEnum(['public', 'private'])
	type: string;

	// @IsEnum(GameMode, { message: 'Invalid game mode' })
	mode: string;

	@IsNumber()
	@IsPositive()
	@Min(1, { message: 'Win score must be at least 1' })
	@Max(999, { message: 'Win score cannot be greater than 999' })
	@IsOptional()
	winScore?: number;

	@IsNumber()
	@Min(30, { message: 'Duration must be at least 30' })
	@Max(999, { message: 'Duration cannot be greater than 999' })
	@IsOptional()
	duration?: number;

	@IsString()
	@IsOptional()
	description?: string;

	@IsString()
	@IsOptional()
	ballLocation?: string;

	@IsNumber()
	@IsOptional()
	ballSpeed?: number;

	@IsString()
	@IsOptional()
	pLeftLocation?: string;

	@IsString()
	@IsOptional()
	pRightLocation?: string;

	@IsNumber()
	@IsInt()
	@Min(0)
	@IsOptional()
	pLeftScore?: number;

	@IsInt()
	@IsNumber()
	@Min(0)
	@IsOptional()
	pRightScore?: number;

	@IsBoolean()
	@IsOptional()
	public pRightIsReady?: boolean;

	@IsNumber()
	@IsOptional()
	public pLeftId: number;

	@IsNumber()
	@IsOptional()
	public pRightId: number;

	@IsNumber()
	@IsOptional()
	public adminId: number;

	@IsOptional()
	public players: User[];
}

export class UpdateGameDto extends PartialType(CreateGameDto) {}
