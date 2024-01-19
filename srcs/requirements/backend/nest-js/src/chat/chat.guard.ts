import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from 'src/users/users.service';
import { ChatService } from './chat.service';

@Injectable()
export class ChatGuard implements CanActivate {
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
			console.log("ChatGuard: inside the guard.");
			const request = context.switchToHttp().getRequest();
			const authHeader = request.headers.authorization;
			if (!authHeader || !authHeader.startsWith('Bearer '))
				throw (new UnauthorizedException("Invalid 'Authorization' header format!"));
			const token = authHeader.split(' ')[1];
			if (!token)
				throw (new UnauthorizedException("Token not found!"));
			if (!request.headers.channel)
				throw (new UnauthorizedException("Channel header not found!"));

			const decodedUser = this.jwtService.verify(token);
			const tmpUser = await this.usersService.getUserPrimary({id: decodedUser.id});
			const tmpChannel = await this.chatService.getChannelRelation({
				id: request.headers.channel,
				relation: { members: true, admins: true },
				primary: true,
			});
			if (!tmpChannel)
				throw (new UnauthorizedException("Channel not found!"));

			if (!tmpChannel.members || !tmpChannel.members.some(user => user.id === tmpUser.id))
				throw new UnauthorizedException("User is not an admin for this channel!");

			request.user = tmpUser;
			request.channel = tmpChannel;
			return (request);
		}
		catch (err)
		{
			console.log("ChatGuard: ", err.message);
			throw (new UnauthorizedException());
		}
	}
}