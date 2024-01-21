import { Controller, Get, Post, Body, Patch, Delete, NotFoundException, Req, UseGuards, Query, Put, UploadedFile, UseInterceptors, ParseBoolPipe, Param, ParseIntPipe } from '@nestjs/common';
import { UsersService } from './users.service';
import { UpdateUserDto } from './dto/create-user.dto';
import { AuthGuard } from 'src/auth/auth.guard';
import { Socket } from 'socket.io';
import { Colors as C } from 'src/colors';
import { FileInterceptor } from '@nestjs/platform-express';
import { multerConfig } from 'src/chat/channel.handler';
import { promisify } from 'util';
import * as fs from 'fs';
import { ChatGateway } from 'src/chat/chat.gateway';
import { Notif, User } from './entities/user.entity';
import { TwoFactorAuthService } from 'src/auth/2fa.service';
import { JwtService } from '@nestjs/jwt';

@UseGuards(AuthGuard)
@Controller('/users')
export class UsersController {
	constructor(
		private readonly usersService: UsersService,
		private readonly chatGateway: ChatGateway,
		private readonly twoFactorAuthService: TwoFactorAuthService,
		private readonly jwtService: JwtService
	) {}

	@Get('/leaderboard')
	async getLeaderboard(
		@Req() {user}:{user: User},
	){
		try {
			console.log(`${C.B_GREEN}GET: /leaderboard: user[${user.login}]${C.END}`);
			// this.usersService.createGameHistory(user.id, user.id, 7, 5, '333');
			const historys = await this.usersService.gameHistorys();
			return ({ success: true, data: historys });
		} catch (err) {
			console.log(`@Get('/leaderboard'): `, err.message);
			return ({ success: false, err: err.message});
		}
	}

	@Put('/notif')
	async putNotif(
		@Req() {user}: {user: User},
	){
		await this.usersService.notifsMarkRead(user.id);
	}

	// OK
	@Get('/cookie')
	async userCookie(
		@Req() {user}: {user: User},
	){
		try
		{
			if (!user)
				throw (new Error("Cookie not provided"));
			return ({message: `user[${user.login}] cookie is ✅`});
		}
		catch(err)
		{
			console.error("Cookie err:", err.message);
			return ({ success: false, err: err.message});
		}
	}

	@Post('/2fa/check')
	async twoFACheck(
		@Req() {user}: {user: User},
		@Body() body: {token: string},
	){
		try {
			console.log(`${C.B_YELLOW}Get: /2fa/check: @Req() user: [${user.login}]${C.END}`);
			const decodedTwoFA = this.jwtService.verify(body.token);
			if (!decodedTwoFA)
				throw new Error('TwoFA is invalid!');
			return ({ success: true });
		} catch (err) {
			return ({ success: false, err: err.message});
		}
	}

	@Post('/2fa/:action')
	async twoFAAction(
		@Req() {user}: {user: User},
		@Param('action') action: string,
		@Body() body: {code: string},
	){
		try {
			console.log(`${C.B_YELLOW}Post: /2fa/${action}: @Req() user: [${user.login}]${C.END}`);
			if (action === 'create'){
				const responseSecret = await this.twoFactorAuthService.generateSecret2FA(user.login);
				const qrCode = await this.twoFactorAuthService.createQrCode(responseSecret);
				if (!qrCode)
					throw new Error('qrCode not generated!');
				await this.usersService.updateUser({
					id: user.id,
					twoFactorAuthSecret: responseSecret.ascii
				});
				return { success: true, qrCode: qrCode };
			} else if (action === 'enable' || action === 'disable') {
				this.twoFactorAuthService.verifyToken(user.twoFactorAuthSecret, body.code);
				await this.usersService.updateUser({
					id: user.id,
					twoFactorAuthIsEnabled: (action === 'enable' ? true : false)
				});
				return ({ success: true });
			} else if (action === 'login') {
				this.twoFactorAuthService.verifyToken(user.twoFactorAuthSecret, body.code);
				const twoFAToken = await this.jwtService.signAsync({ id: user.id }, {expiresIn: '1h'}); // 2FA ile giriş yaptığında, sürdürebilirlik yapısı

				return ({ success: true, token: twoFAToken });
			} else {
				throw new NotFoundException(`action[${action}] not found!`);
			}
		} catch (err) {
			console.log(`@Post('/2fa/${action}'): `, err.message);
			return ({ success: false, err: err.message});
		}
	}

	// OK
	@Patch('/user')
	@UseInterceptors(FileInterceptor('avatar', multerConfig))
	async	patchUser(
		@Req() {user}: {user: User},
		@UploadedFile() avatar: Express.Multer.File,
		@Body('nickname') nickname: string,
	){
		try
		{
			console.log(`${C.B_PURPLE}PATCH: /user: user[${user.login}] nickname[${nickname}] avatar[${avatar ? 'ok' : 'nok'}]${C.END}`);
			await this.usersService.updateUser({
				id: user.id,
				avatar: avatar ? process.env.B_IMAGE_REPO + avatar.filename : null,
				nickname: nickname,
			})
			return { success: true };
		}
		catch (err)
		{
			if (avatar && avatar.path && fs.existsSync(avatar.path)) {
				promisify(fs.promises.unlink)(avatar.path);
				console.log('Avatar removed successfully.');
			}
			const notif = await this.usersService.createNotif(user.id, user.id, 'text', err.message);
			this.chatGateway.server.emit(`user-notif:${user.id}`, notif);
			console.log("@Patch('/user'): ", err.message);
			return { success: false, error: err.message };
		}
	}

	// // OK
	// @Delete('/user')
	// async	deleteUser(
	// 	@Req() {user},
	// 	@Query('user') delUser: string | undefined,
	// ){
	// 	try
	// 	{
	// 		console.log(`${C.B_RED}DELETE: /user: @Query('user'): [${delUser}]${C.END}`);
	// 		const	responseUser = await this.usersService.deleteUser(delUser);
	// 		return (responseUser);
	// 	}
	// 	catch (err)
	// 	{
	// 		console.error("@Delete('/user'): ", err.message);
	// 		return ({err: err.message});
	// 	}
	// }

	// @Delete('/file/delete')
	// async deleteImage(
	// 	@Req() {user},
	// 	@Query('file') file: string | string[] | undefined,
	// ){
	// 	try
	// 	{
	// 		console.log(`${C.B_RED}DELETE: /user/delete: @Query('file'): [${file}]${C.END}`);
	// 		const	responseDeleteFile = await this.usersService.deleteFile(file)
	// 		if (!responseDeleteFile)
	// 			throw (new Error('Error deleting file:'));
	// 		return (responseDeleteFile);
	// 	}
	// 	catch (err)
	// 	{
	// 		console.error("@Delete('/file/delete'): ", err.message);
	// 		return ({err: err.message});
	// 	}
	// }

	@Post('/:action/:user')
	async request(
		@Req() {user}: {user: User},
		@Param('action') action: string,
		@Param('user') target: string,
		@Query('notifID', ParseIntPipe) sourceNotif: number, // undefined gelmiyor bu yüzden 0 gönderiyorum
	){
		try {
			console.log(`${C.B_YELLOW}POST: /user: @Req() action: [${action}] target: [${target}] notifId: [${sourceNotif}]${C.END}`);
			if (action === undefined || target === undefined)
				throw Error(`Query is empty!`);
			if (sourceNotif)
				await this.usersService.deleteNotif(user.id, sourceNotif);
			const targetUser = await this.usersService.getUserPrimary({login: target});

			let result : Notif;

			if (action === 'poke')
				result = await this.usersService.createNotif(user.id, targetUser.id, 'text', `${user.displayname} poked you!`);
			else if (action === 'sendFriendRequest' ||
					action === 'acceptFriendRequest' ||
					action === 'declineFriendRequest' ||
					action === 'unFriend')
				result = await this.usersService.friendRequest(action, user, targetUser.id);
			else if (action === 'block' || action === 'unblock')
				result = await this.usersService.blockAction(action, user.id, targetUser.id);
			else
				throw new Error('Invalid action values!');

			this.chatGateway.server.emit(`user-notif:${targetUser.id}`, result);
			return { success: true };
		} catch (err) {
			const notif = await this.usersService.createNotif(user.id, user.id, 'text', err.message);
			this.chatGateway.server.emit(`user-notif:${user.id}`, notif);
			console.error("@Post(): ", err.message);
			return ({ success: false, err: err.message});
		}
	}

	/*
		default yapı için 	->	`/users`
		sadece notif 		-> 	`/users?relation=notifications`
		default + notif 	->	`/users?relation=notifications&primary=true`
	*/
	@Get()
	async getData(
		@Req() {user}: {user: User},
		@Query('relation') relation: string[] | string,
		@Query('primary', ParseBoolPipe) primary: boolean,
	){
		try {
			console.log(`${C.B_YELLOW}GET: relation: [${relation}] userData: [${primary}]${C.END}`);
			if (!relation && primary != true)
				return (await this.usersService.getUserPrimary({id: user.id}));

			return(await this.usersService.getUserRelation({
				user: { id: user.id },
				relation: this.usersService.parsedRelation(relation),
				primary: primary,
			}));
		} catch (err) {
			console.error("@Get(): ", err.message);
			return ({ success: false, err: err.message});
		}
	}

	@Get('/user')
	async getUser(
		@Req() {user}: {user: User},
		@Query ('who') who: string,
	){
		try {
			console.log(`${C.B_GREEN}GET: /user: who: [${who}]${C.END}`);

			const data = await this.usersService.getUserRelation({
				user: {login: who},
				relation: {friends: true, gameHistory: true},
				primary: true
			})
			const progression = data.xp;
			const newData = { ...data, progression };
			delete newData.socketId;
	
			if (user.login !== who){
				delete newData.friends;
			}
			return (newData);
		} catch (err) {
			console.log("@Get('/user'): ", err.message);
			return ({ success: false, err: err.message});
		}
	}

}

/**
 * LINK: https://medium.com/@mohitu531/nestjs-7c0eb5655bde
 * Bu 'Controller'(Denetleyici) nedir ne icin kullanilir?
 * 
 * Nedir?: Backend'e gelen HTTP isteklerini isler.
 * 
 * Genellikle istekleri yonetir, istemciye yanitlar dondurur.
 *  
 */