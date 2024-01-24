import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from 'src/users/users.service';
import { GameService } from './game.service';

@Injectable()
export class GameAdminGuard implements CanActivate {
	constructor(
		private readonly jwtService: JwtService,
		private readonly usersService: UsersService,
		private readonly gameService: GameService,
	) {}
	async	canActivate(
		context: ExecutionContext,
	): Promise<boolean> {
		try
		{
			console.log("GameAdminGuard: inside the guard.");
			const request = context.switchToHttp().getRequest();
			const authHeader = request.headers.authorization;
			if (!authHeader || !authHeader.startsWith('Bearer '))
				throw (new UnauthorizedException("Invalid 'Authorization' header format!"));
			const token = authHeader.split(' ')[1];
			if (!token)
				throw (new UnauthorizedException("Token not found!"));
			if (!request.headers.game)
				throw (new UnauthorizedException("Game header not found!"));
			const decodedUser = this.jwtService.verify(token);
			const tmpUser = await this.usersService.getUserPrimary({id: decodedUser.id});
			const tmpGameRoom = await this.gameService.getGamePrimary({
				name: request.headers.game,
			});
			if (!tmpGameRoom)
				throw (new UnauthorizedException("Game Lobby/Room not found!"));
			if (!tmpGameRoom.playerL || tmpGameRoom.playerL.user.id !== tmpUser.id)
				throw new UnauthorizedException("User is not an admin for this Game Lobby/Room!");

			// if (!tmpChannel.admins || !tmpChannel.admins.some(admin => admin.id === tmpUser.id))
			// 	throw new UnauthorizedException("User is not an admin for this channel!");

			request.user = tmpUser;
			request.game = tmpGameRoom;
			return (request);
		}
		catch (err)
		{
			console.log("GameAdminGuard: ", err.message);
			throw (new UnauthorizedException());
		}
	}
}