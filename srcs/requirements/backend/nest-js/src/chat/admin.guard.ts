import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from 'src/users/users.service';
import { ChatService } from './chat.service';

@Injectable()
export class ChatAdminGuard implements CanActivate {
	constructor(
		private readonly jwtService: JwtService,
		private readonly usersService: UsersService,
		private readonly chatService: ChatService,
	) {}
	async	canActivate(
		context: ExecutionContext,
	): Promise<boolean> {
		try
		{
			console.log("ChatAdminGuard: inside the guard.");
			const request = context.switchToHttp().getRequest();
			// console.log("once", request.headers);
			const authHeader = request.headers.authorization;
			if (!authHeader || !authHeader.startsWith('Bearer '))
				throw (new UnauthorizedException("Invalid 'Authorization' header format!"));
			const token = authHeader.split(' ')[1];
			if (!token)
				throw (new UnauthorizedException("Token not found!"));
			if (!request.headers.channel)
				throw (new UnauthorizedException("Channel not found!"));

			const	decodedUser = this.jwtService.verify(token);
			const	tmpUser = await this.usersService.findUser(decodedUser.login, null, "all");
			const singleUser = Array.isArray(tmpUser) ? tmpUser[0] : tmpUser;
			if (!singleUser)
				throw (new UnauthorizedException("User not found in DB!"));

			const	tmpChannel = await this.chatService.findChannel(request.headers.channel, "all")
			const singleChannel = Array.isArray(tmpChannel) ? tmpChannel[0] : tmpChannel;
			if (!singleChannel)
				throw (new UnauthorizedException("Chanenl not found in DB!"));
			if (!singleChannel.admins || !singleChannel.admins.some(admin => admin.id === singleUser.id))
				throw new UnauthorizedException("User is not an admin for this channel!");
			request.user = singleUser;
			request.channel = singleChannel;
		}
		catch (error)
		{
			console.log("ChatAdminGuard: ", error);
			throw (new UnauthorizedException());
		}
		// throw (new UnauthorizedException("AuthGuard: You can't acces.")); // Bu 401(Unauthorized) error'u dondurur.
		return true; // Bu false olursa 403(Forbidden) error'u dondurur.
	}
}