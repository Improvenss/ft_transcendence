/**
 * LINK: https://www.youtube.com/watch?v=w_ASqSZKhMQ
 */
import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Observable } from 'rxjs';
import { UsersService } from 'src/users/users.service';

@Injectable()
export class AuthGuard implements CanActivate {
	constructor(
		private readonly jwtService: JwtService,
		private readonly usersService: UsersService,
	) {}
	async canActivate(
		context: ExecutionContext,
	): Promise<boolean> {
		try
		{
			const	request = context.switchToHttp().getRequest();
			const	authHeader = request.headers.authorization;
			if (!authHeader || !authHeader.startsWith('Bearer '))
				throw (new UnauthorizedException("Invalid 'Authorization' header format!"));
			const	token = authHeader.split(' ')[1];
			if (!token)
				throw (new UnauthorizedException("Token not found!"));
			const	decodedUser = this.jwtService.verify(token);
			const	tmpUser = await this.usersService.findUser(decodedUser.login);
			if (!tmpUser)
				throw (new UnauthorizedException("User not found in DB!"));
			request.user = tmpUser;
		}
		catch (err)
		{
			console.log("AuthGuard: ", err.message);
			throw (new UnauthorizedException());
		}
		// throw (new UnauthorizedException("AuthGuard: You can't acces.")); // Bu 401(Unauthorized) error'u dondurur.
		return true; // Bu false olursa 403(Forbidden) error'u dondurur.
	}
}