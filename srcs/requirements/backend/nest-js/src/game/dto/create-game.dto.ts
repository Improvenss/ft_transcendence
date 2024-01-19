import { PartialType } from "@nestjs/swagger";
import { IsNotEmpty, IsOptional, IsString, IsInt, Min, IsNumber, IsEnum, Max, IsPositive, IsBoolean, isNumber } from "class-validator";
import { User } from "src/users/entities/user.entity";

export enum EGameMode {
	classic = 'classic',
	fastMode = 'fast-mode',
}

export interface ILiveData {
	ballLocationX?: number;
	ballLocationY?: number;
	pLeftLocation?: number;
	pRightLocation?: number;
	pLeftSpeed?: number;
	pRightSpeed?: number;
	pLeftScore?: number;
	pRightScore?: number;
	duration?: number;
	winner?: number;
	isTie?: boolean;
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

	@IsEnum(EGameMode, { message: 'Invalid game mode' })
	mode: string;
	// mode: EGameMode;

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

	@IsBoolean()
	@IsOptional()
	isGameStarted?: boolean;

	@IsString()
	@IsOptional()
	description?: string;

	@IsNumber()
	@IsOptional()
	ballLocationX?: number;

	@IsNumber()
	@IsOptional()
	ballLocationY?: number;

	@IsNumber()
	@IsOptional()
	ballSpeedX?: number;

	@IsNumber()
	@IsOptional()
	ballSpeedY?: number;

	@IsNumber()
	@IsOptional()
	pLeftLocation?: number;

	@IsNumber()
	@IsOptional()
	pRightLocation?: number;

	@IsNumber()
	@IsOptional()
	pLeftSpeed?: number;

	@IsNumber()
	@IsOptional()
	pRightSpeed?: number;

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

	@IsString()
	@IsOptional()
	public pLeftSocketId: string;

	@IsNumber()
	@IsOptional()
	public pRightId: number;

	@IsString()
	@IsOptional()
	public pRightSocketId: string;

	@IsNumber()
	@IsOptional()
	public adminId: number;

	@IsOptional()
	public players: User[];
}

export class UpdateGameDto extends PartialType(CreateGameDto) {}
