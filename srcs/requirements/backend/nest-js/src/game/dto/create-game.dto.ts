import { PartialType } from "@nestjs/swagger";
import { IsNotEmpty, IsOptional, IsString, IsInt, Min, IsNumber, IsEnum, Max, IsPositive, IsBoolean, isNumber, IsInstance } from "class-validator";
import { User } from "src/users/entities/user.entity";

export enum EGameMode {
	CLASSIC = 'classic',
	FAST_MODE = 'fast-mode',
}

export interface ILiveData {
	duration?: number,
	ball?: {
		x?: number,
		y?: number,
		speedX?: number,
		speedY?: number,
	},
	playerL?: {
		user?: User,
		location?: number,
		speed?: number,
		score?: number,
	},
	playerR?: {
		user?: User,
		location?: number,
		speed?: number,
		score?: number,
	},
	running?: boolean,
}

export class BallDto {
	@IsNumber()
	@IsPositive()
	x?: number = 500;
   
	@IsNumber()
	@IsPositive()
	y?: number = 400;
  
	@IsNumber()
	@IsPositive()
	speedX?: number = 3;
  
	@IsNumber()
	@IsPositive()
	speedY?: number = 4;
  }
  
export class PlayerDto {

	@IsInstance(User)
	user?: User;
	
	@IsNumber()
	@IsOptional()
	@Min(0)
	score?: number;

	@IsNumber()
	@IsOptional()
	location?: number;

	@IsNumber()
	@IsOptional()
	speed?: number;
  
	@IsBoolean()
	@IsOptional()
	ready?: boolean;
}

export class CreateGameDto {
	@IsString()
	@IsNotEmpty()
	name: string;
  
	@IsString()
	@IsOptional()
	password?: string;
  
	@IsOptional()
	@IsString()
	description?: string;
  
	@IsEnum(['public', 'private'])
	type: string;

	@IsEnum(EGameMode, { message: 'Invalid game mode' })
	mode: EGameMode;
  
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
	running?: boolean;
 
	@IsInstance(BallDto)
	@IsOptional()
	ball?: BallDto;

	@IsOptional()
	players?: User[];

	@IsInstance(PlayerDto)
	@IsOptional()
	playerL?: PlayerDto;

	@IsInstance(PlayerDto)
	@IsOptional()
	playerR?: PlayerDto;
}

export class UpdateGameDto extends PartialType(CreateGameDto) {}
