import { Controller, Get, Post, Body, Patch, Delete, NotFoundException, Req, UseGuards, Query, Put, UploadedFile, UseInterceptors, ParseBoolPipe } from '@nestjs/common';
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
import { Notif } from './entities/user.entity';

@UseGuards(AuthGuard)
@Controller('/users')
export class UsersController {
	constructor(
		private readonly usersService: UsersService,
		private readonly chatGateway: ChatGateway,
	) {}

	// @Get('/user')
	// async getUser(
	// 	@Req() {user},
	// 	@Query ('user') findUser: string | 'me' | undefined,
	// 	@Query ('socket') findSocket?: Socket | undefined,
	// 	@Query('relations') relations?: string[] | null | 'all',
	// ){
	// 	try
	// 	{
	// 		console.log(`${C.B_GREEN}GET: /user: @Query('user'): [${findUser}], @Query('socket'): [${findSocket}], @Query('relations'): [${relations}]${C.END}`);
	// 		const	tmpUser = await this.usersService.findUser(
	// 			(findUser === 'me') ? user.login : findUser,
	// 			findSocket,
	// 			relations
	// 		);
	// 		if (!tmpUser)
	// 			return ({message: "USER NOK", user: `User '${findUser}' not found.`});
	// 		return ({message: "USER OK", user: tmpUser});
	// 	}
	// 	catch (err)
	// 	{
	// 		console.log("@Get('/user'): ", err);
	// 		return ({err: err});
	// 	}
	// }

	// OK
	@Get('/cookie')
	async userCookie(
		@Req() {user},
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
			return ({message: `user[${user.login}] cookie is ❌`, err: err.message});
		}
	}

	// OK
	@Patch('/socket')
	async	patchSocket(
		@Req() {user},
		@Body() body: {socketId: string}
	){
		try
		{
			const	tmpUser = await this.usersService.updateSocketLogin(user.login, body.socketId);
			if (!tmpUser)
				throw (new NotFoundException(`User ${user.login} not found.`));
			return ({message: `Socket updated successfully. login[${tmpUser.login}], socket.id[${tmpUser.socketId}]`});
		} catch(err) {
			console.error("@Patch('/socket'): ", err.message);
			return ({message: "Socket not updated.", err: err.message});
		}
	}

	@Put('/user/upload')
	@UseInterceptors(FileInterceptor('image', multerConfig))
	async	putFile(
		@Req() {user},
		@UploadedFile() image: any,
	){
		try
		{
			console.log(`${C.B_BLUE}PUT: /user/upload: @UploadedFile(): ${C.END}`, image);
			if (!image)
				throw (new Error(`File not found!: File Name:${image.filename}`));
			const imgUrl =  process.env.B_IMAGE_REPO + image.filename;
			if (!fs.existsSync(image.path))
				throw (new Error(`File path is not valid. ${image.path}`));
			return ({imgUrl});
		}
		catch (err)
		{
			if (image) {
				try {
					await promisify(fs.promises.unlink)(image.path);
					console.log(`File successfully deleted. ✅: image.path: ${image.path}`);
				} catch (unlinkErr) {
					console.error('Error occurred while deleting file.:', unlinkErr);
				}
			}
			console.error("@Put('/user/upload'): ", err.message);
			return ({err: err.message});
		}
	}

	// OK
	@Patch('/user')
	async	patchUser(
		@Req() {user},
		@Query('user') findUser: string | undefined,
		@Body() body: Partial<UpdateUserDto>,
	){
		try
		{
			// console.log(`${C.B_PURPLE}PATCH: /user: @Query('user'): [${user.login}] @Body(): [${body}]${C.END}`);
			console.log(`${C.B_PURPLE}PATCH: /user: @Query('user'): [${findUser}] @Body():${C.END}`, body); // sonra yapilacak
			// const	responseUser = await this.usersService.patchUser(user.login, body);
			const	responseUser = await this.usersService.patchUser(findUser, body);
			return (responseUser);
		}
		catch (err)
		{
			console.log("@Patch('/user'): ", err.message);
			return ({err: err.message});
		}
	}

	// OK
	@Delete('/user')
	async	deleteUser(
		@Req() {user},
		@Query('user') delUser: string | undefined,
	){
		try
		{
			console.log(`${C.B_RED}DELETE: /user: @Query('user'): [${delUser}]${C.END}`);
			const	responseUser = await this.usersService.deleteUser(delUser);
			return (responseUser);
		}
		catch (err)
		{
			console.error("@Delete('/user'): ", err.message);
			return ({err: err.message});
		}
	}

	@Delete('/file/delete')
	async deleteImage(
		@Req() {user},
		@Query('file') file: string | string[] | undefined,
	){
		try
		{
			console.log(`${C.B_RED}DELETE: /user/delete: @Query('file'): [${file}]${C.END}`);
			const	responseDeleteFile = await this.usersService.deleteFile(file)
			if (!responseDeleteFile)
				throw (new Error('Error deleting file:'));
			return (responseDeleteFile);
		}
		catch (err)
		{
			console.error("@Delete('/file/delete'): ", err.message);
			return ({err: err.message});
		}
	}

	@Post()
	async request(
		@Req() {user},
		@Query('action') action: 'poke' | 'sendFriendRequest' | 'acceptFriendRequest' | 'declineFriendRequest' | 'unFriend',
		@Query('target') target: string | undefined,
		@Query('id') requestId?: number,
	){
		try {
			console.log(`${C.B_YELLOW}POST: /user: @Req() action: [${action}] target: [${target}] notifId: [${requestId}]${C.END}`);
			if (action === undefined || target === undefined)
				throw Error(`Query is empty!`);
			if (requestId)
				await this.usersService.deleteNotif(user.id, requestId);

			let result : Notif;

			if (action === 'poke')
				result = await this.usersService.createNotif(user.login, target, 'text', `${user.displayname} poked you!`);
			else if (action === 'sendFriendRequest' ||
					action === 'acceptFriendRequest' ||
					action === 'declineFriendRequest')
				result = await this.usersService.friendRequest(action, user, target);
			else
				throw new Error('Invalid action values!');

			this.chatGateway.server.emit(`notif:${target}`, result);
			return ({message: `${action} was successfully performed on user[${target}].`});
		} catch (err) {
			console.error("@Post(): ", err.message);
			return ({err: err.message});
		}
	}

	/*
		default yapı için 	->	`/users`
		sadece notif 		-> 	`/users?relation=notifications`
		default + notif 	->	`/users?relation=notifications&primary=true`
	*/
	@Get()
	async getData(
		@Req() {user},
		@Query('relation') relation: string[] | string,
		@Query('primary', ParseBoolPipe) primary: boolean,
	){
		try {
			console.log(`${C.B_YELLOW}GET: relation: [${relation}] userData: [${primary}]${C.END}`);
			if (!relation && primary != true)
				return (await this.usersService.getUserPrimay({login: user.login}));

			// return (await this.usersService.getData({userLogin: user.login}, relation, primary));
			return(await this.usersService.getUserRelation({
				user: { login: user.login },
				relation: this.usersService.parsedRelation(relation),
				primary: primary,
			}));
		} catch (err) {
			console.error("@Get(): ", err.message);
			return ({err: err.message});
		}
	}

	@Get('/user')
	async getUser(
		@Req() {user},
		@Query ('who') who: string,
	){
		try {
			console.log(`${C.B_GREEN}GET: /user: who: [${who}]${C.END}`);
			// const data = await this.usersService.getData({userLogin: who}, (user.login === who ? 'friends': []), 'true');
			if (user.login === who){
				return (await this.usersService.getUserPrimay({login: user.login}));
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
			return ({err: err.message});
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