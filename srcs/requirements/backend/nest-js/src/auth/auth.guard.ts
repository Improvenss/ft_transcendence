/**
 * LINK: https://www.youtube.com/watch?v=w_ASqSZKhMQ
 */
import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Observable } from 'rxjs';

@Injectable()
export class AuthGuard implements CanActivate {
	constructor(
		private readonly jwtService: JwtService,
	) {}
	canActivate(
		context: ExecutionContext,
	): boolean | Promise<boolean> | Observable<boolean> {
		try
		{
			console.log("AuthGuard: inside the guard.");
			const request = context.switchToHttp().getRequest();
			console.log("once", request.headers);
			const authHeader = request.headers.authorization;
			if (!authHeader || !authHeader.startsWith('Bearer '))
				throw (new UnauthorizedException("AuthGuard: Invalid 'Authorization' header format!"));
			const token = authHeader.split(' ')[1];
			console.log("TOKENIN:", token);
			if (!token)
				throw (new UnauthorizedException("AuthGuard: Token not found!"));
			request.user = this.jwtService.verify(token);
			console.log("request.user: ", request.user);
		}
		catch (error)
		{
			console.log("hehe", error);
			throw (new UnauthorizedException());
		}
		// throw (new UnauthorizedException("AuthGuard: You can't acces.")); // Bu 401(Unauthorized) error'u dondurur.
		return true; // Bu false olursa 403(Forbidden) error'u dondurur.
	}
}
