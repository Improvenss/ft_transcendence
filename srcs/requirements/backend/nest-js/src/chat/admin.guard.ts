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
				relation: { admins: true },
				primary: true,
			});
			if (!tmpChannel)
				throw (new UnauthorizedException("Channel not found!"));

			if (!tmpChannel.admins || !tmpChannel.admins.some(admin => admin.id === tmpUser.id))
				throw new UnauthorizedException("User is not an admin for this channel!");

			request.user = tmpUser;
			request.channel = tmpChannel;
			return (request);
		}
		catch (err)
		{
			console.log("ChatAdminGuard: ", err.message);
			throw (new UnauthorizedException());
		}
	}
}