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

@UseGuards(AuthGuard)
@Controller('/users')
export class UsersController {
	constructor(
		private readonly usersService: UsersService,
		private readonly chatGateway: ChatGateway,
		private readonly twoFactorAuthService: TwoFactorAuthService,
	) {}

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

	// OK
	// @Patch('/socket')
	// async	patchSocket(
	// 	@Req() {user},
	// 	@Body() body: {socketId: string}
	// ){
	// 	try
	// 	{
	// 		const	tmpUser = await this.usersService.updateSocketLogin(user.login, body.socketId);
	// 		return ({message: `Socket updated successfully. login[${tmpUser.login}], socket.id[${tmpUser.socketId}]`});
	// 	} catch(err) {
	// 		console.error("@Patch('/socket'): ", err.message);
	// 		return ({err: err.message});
	// 	}
	// }

	// @Put('/user/upload')
	// @UseInterceptors(FileInterceptor('image', multerConfig))
	// async	putFile(
	// 	@Req() {user},
	// 	@UploadedFile() image: any,
	// ){
	// 	try
	// 	{
	// 		console.log(`${C.B_BLUE}PUT: /user/upload: @UploadedFile(): ${C.END}`, image);
	// 		if (!image)
	// 			throw (new Error(`File not found!: File Name:${image.filename}`));
	// 		const imgUrl =  process.env.B_IMAGE_REPO + image.filename;
	// 		if (!fs.existsSync(image.path))
	// 			throw (new Error(`File path is not valid. ${image.path}`));
	// 		return ({imgUrl});
	// 	}
	// 	catch (err)
	// 	{
	// 		if (image) {
	// 			try {
	// 				await promisify(fs.promises.unlink)(image.path);
	// 				console.log(`File successfully deleted. ✅: image.path: ${image.path}`);
	// 			} catch (unlinkErr) {
	// 				console.error('Error occurred while deleting file.:', unlinkErr);
	// 			}
	// 		}
	// 		console.error("@Put('/user/upload'): ", err.message);
	// 		return ({err: err.message});
	// 	}
	// }

	@Patch('/set/2fa')
	async	set2fa(
		@Req() {user}: {user: User},
	){
		const	qrCode = await this.twoFactorAuthService.createQrCode(user.login);
		console.log("qr code'miz", qrCode);
		return ({qrCode: qrCode});
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
		//@Query('action') action: 'poke' | 'sendFriendRequest' | 'acceptFriendRequest' | 'declineFriendRequest' | 'unFriend',
		//@Query('id') sourceNotif?: number, //silmek istediğimiz notifID, onay/red sonrası arkadaşlık isteğini silmek için
	){
		try {
			console.log(`${C.B_YELLOW}POST: /user: @Req() action: [${action}] target: [${target}] notifId: [${sourceNotif}]${C.END}`);
			if (action === undefined || target === undefined)
				throw Error(`Query is empty!`);
			if (sourceNotif)
				await this.usersService.deleteNotif(user.id, sourceNotif);
			const targetUser = await this.usersService.getUserPrimary({login: target});
			if (!targetUser){
				throw new NotFoundException('User not found!');
			}

			let result : Notif;

			if (action === 'poke')
				result = await this.usersService.createNotif(user.id, targetUser.id, 'text', `${user.displayname} poked you!`);
			else if (action === 'sendFriendRequest' ||
					action === 'acceptFriendRequest' ||
					action === 'declineFriendRequest')
				result = await this.usersService.friendRequest(action, user, targetUser.id);
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
			if (user.login !== who){
				return (await this.usersService.getUserPrimary({login: who}));
			}

			const data = await this.usersService.getUserRelation({
				user: { login: who },
				relation: { friends: true },
				primary: true,
			});
			delete data.socketId;
			return (data);
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