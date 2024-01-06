import { Controller, Get, Post, Body, Delete, NotFoundException, Query, UseGuards, Req, UseInterceptors, UploadedFile, Patch, ParseBoolPipe } from '@nestjs/common';
import { ChatService } from './chat.service';
import { CreateMessageDto } from './dto/chat-message.dto';
import { UsersService } from 'src/users/users.service';
import { Colors as C } from '../colors';
import { AuthGuard } from 'src/auth/auth.guard';
import { FileInterceptor } from '@nestjs/platform-express';
import { CreateChannelDto } from './dto/chat-channel.dto';
import { promisify } from 'util';
import * as fs from 'fs';
import { ChatGateway } from './chat.gateway';
import * as bcrypt from 'bcrypt';
import { User } from 'src/users/entities/user.entity';
import { multerConfig } from './channel.handler';
import { ChatAdminGuard } from './admin.guard';
import { FindOptionsRelations } from 'typeorm';
import { Channel, ChannelType } from './entities/chat.entity';

/**
 * Bu @UseGuard()'i buraya koyarsan icerisindeki
 *  requestlerde tekrar tekrar yazmana gerek kalmaz.
 */
@UseGuards(AuthGuard)
@Controller('/chat')
export class ChatController {
	constructor(
		private readonly chatService: ChatService,
		private readonly usersService: UsersService,
		private readonly chatGateway: ChatGateway,
	) {}

	// @Get('/channel')
	// async findChannel(
	// 	@Req() {user},
	// 	@Query('channel') channel: string | undefined,
	// 	@Query('relations') relations: string[] | null | 'all',
	// ) {
	// 	try
	// 	{
	// 		console.log(`${C.B_GREEN}GET: /channel: Channel: [${channel}], Relation: [${relations}]${C.END}`);
	// 		const	tmpChannel = await this.chatService.findChannel(channel, relations);
	// 		const	channelArray = Array.isArray(tmpChannel) ? tmpChannel[0]: tmpChannel;
	// 		if (channelArray && channelArray.members)
	// 			return (await this.chatService.checkInvolvedUser(tmpChannel, user));
	// 		return (tmpChannel);
	// 	}
	// 	catch (err)
	// 	{
	// 		console.log("@Get('/channel'): ", err.message);
	// 		return ({err: err.message});
	// 	}
	// }

	/* Belirlenen kanala ait default + relation bilgilerini çekiyor */
	/*@Get()
	async getChannel(
		@Req() {user},
		@Query('channel') name: string,
		@Query('relation') relation: string[] | string,
		@Query('primary', ParseBoolPipe) primary: boolean,
	){
		try {
			console.log(`${C.B_GREEN}GET: Channel: [${name}], Relation: [${relation}] Primary: [${primary}]${C.END}`);
			// const data = await this.chatService.getChannel({name, relation, primary});
			const data = await this.chatService.getChannelRelation({
				channelName: name,
				relation: this.chatService.parsedRelation(relation),
				primary: primary,
			});
			if (!data)
				throw new Error('Channel not found!');
			delete data.password;
			return (data);
		} catch (err) {
			console.log("@Get(): ", err.message);
			return ({err: err.message});
		}
	}*/

	/*
		Kullanıcının kayıt olduğu ve public olan kanalları çekiyor.
		Burada sadece default bilgiler çekilmektedir.
	*/
	@Get('/channels')
	async getChannels(
		@Req() {user},
	){
		try {
			console.log(`${C.B_GREEN}GET: /channels: requester[${user.login}]${C.END}`);
			const {socketId: sockId} = await this.usersService.getUserPrimay({login: user.login});
			const userSocket = this.chatGateway.getUserSocketConnection(sockId);
			if (!userSocket)
				throw new NotFoundException('User socket not found!');
			const channels = await this.chatService.getChannels(user.login);
			channels
				.filter((channel) =>  channel.status === 'involved') //backend'de daha güvenli olduğu için ekledim.
				.forEach((channel) => {
					userSocket.join(channel.name);
					console.log(`Channel: [${channel.name}] Joined: [${user.socketId}]`);
				});
			return (channels);
		} catch (err){
			console.error("@Get('/channels'): ", err.message);
			return ({err: err.message});
		}
	}

	@Post(':message')
	createMessage(@Body() createMessageDto: CreateMessageDto) {
		return this.chatService.createMessage(createMessageDto);
	}

	@Post('/channel/register')
	async registerChannel(
		@Req() {user},
		@Body() payload: {channel: string, password: string}
	){
		try
		{
			console.log(`${C.B_YELLOW}POST: /channel/register: user: [${user.login}] channel: [${payload.channel}]${C.END}`);

			// const tmpChannel = await this.chatService.getChannel({name: payload.channel, primary: true});
			const tmpChannel = await this.chatService.getChannelRelation({
				channelName: payload.channel,
				relation: {},
				primary: true,
			});
			if (!tmpChannel)
				throw new NotFoundException('Channel not found!');

			if (await this.chatService.findChannelUser(tmpChannel, 'bannedUsers', user))
				throw (new Error(`${user.login} banned in this Channel: ${payload.channel}.`));

			if (tmpChannel.password && !bcrypt.compareSync(payload.password, tmpChannel.password))
				throw (new Error(`Channel: [${payload.channel}] password is wrong!`));
			
			const channelResponse = await this.chatService.addChannelUser(tmpChannel, user as User, 'members');
			const userSocket = this.chatGateway.getUserSocketConnection(user.socketId);
			if (!userSocket)
				throw new NotFoundException('User socket not found!');
			userSocket.join(payload.channel);
			console.log(`Channel: [${payload.channel}] Joined: [${user.socketId}]`);

			delete channelResponse.password;
			channelResponse['status'] = 'involved';
			return (channelResponse);
		}
		catch (err)
		{
			console.error("@Post('/channel/register'): registerChannel:", err.message);
			const notif = await this.usersService.createNotif(user.login, user.login, 'text', err.message);
			this.chatGateway.server.emit(`notif:${user.login}`, notif);
			return ({err: err.message});
		}
	}

	//kanaldan ayrılmak isteyen olursa, user ile userName birbirini tutuyorsa ayrılır,
	// eğerki birisi channeldan kickliyorsa user kanalın admini olmalı ve userName ise channel'da bulunmalıdır.
	@Delete('/channel/leave')
	async leaveChannel(
		@Req() {user},
		@Query ('channel') channel: string,
	){
		try
		{
			console.log(`${C.B_YELLOW}POST: /channel/leave: user: [${user.login}] channel: [${channel}]${C.END}`);
			await this.chatGateway.userLeaveChannel(channel, user.socketId);
			await this.chatService.removeUser(channel, 'members', user.login);
			console.log(`${C.B_RED}Channel Leave: ${channel} - ${user.login}${C.END}`);
			this.chatGateway.server.emit(`userChannelListener:${user.login}`, {
				action: 'leave',
				data: channel,
			});
			return ({message: 'User left the channel successfully!'});
		}
		catch(err)
		{
			if (err instanceof NotFoundException) {
				// Özel işleme
				return { message: err.message, statusCode: 404 };
			} else {
				console.error("@Delete('/channel/leave'):", err.message);
				return { message: 'Internal Server Error', statusCode: 500 };
			}
		}
	}

	// ---------- Delete ---------
	@Delete('/channel')
	@UseGuards(ChatAdminGuard)
	async deleteChannel(
		@Req() {user},
		@Req() {channel},
	){
		try
		{
			console.log(`${C.B_RED}DELETE: Channel: ${channel.name}${C.END}`);
			this.chatGateway.forceLeaveChannel(channel.name);

			if (channel.type === 'public'){
				this.chatGateway.server.emit('globalChannelListener', {
					status: 'global',
					action: 'delete',
					data: channel.name,
				});
			} else if (channel.type === 'private'){
				const channelUsersLogins = await this.usersService.getUsersInRelation({
					relation: 'channels',
					value: channel.name,
					select: 'login',
				});
				channelUsersLogins.forEach((user) => {
					this.chatGateway.server.emit(`userChannelListener:${user}`, {
						status: 'private',
						action: 'delete',
						data: channel.name,
					});
				});
			}

			const tmpChannel = await this.chatService.removeChannel(channel.name);
			if (!tmpChannel)
				throw (new NotFoundException("Channel does not exist!"));
			return ({message: `Channel [${channel.name}] delete successfully.`});
		}
		catch (err)
		{
			console.error("@Delete('/channel'): deleteChannel():", err.message);
			return ({err: err.message});
		}
	}

	@Post('/channel/create')
	@UseInterceptors(FileInterceptor('image', multerConfig))
	async createChannel(
		@Req() {user},
		@UploadedFile() image: Express.Multer.File,
		@Body('name') name: string,
		@Body('type') type: string,
		@Body('password') password: string | undefined,
		@Body('description') description: string,
	  ) {
		try {
			const channelType = await this.chatService.parseType(type);
			if (!image)
				throw new Error('No file uploaded');
			if (!fs.existsSync(image.path))
				throw new Error(`File path is not valid: ${image.path}`);
			const channel = await this.chatService.getChannelPrimary(name);
			if (channel){
				throw new Error("A channel with the same name already exists.");
			}
			const tmpUser = await this.usersService.getUserPrimay({login: user.login});
			const imgUrl = process.env.B_IMAGE_REPO + image.filename;
			const createChannelDto: CreateChannelDto = {
				name: name,
				type: channelType,
				description: description,
				password: (password === undefined)
					? null
					: bcrypt.hashSync(
						password,
						bcrypt.genSaltSync(+process.env.DB_PASSWORD_SALT)),
				image: imgUrl,
				members: [],
				admins: [tmpUser as User],
				bannedUsers: [],
				messages: [],
			};

			const response = await this.chatService.createChannel(createChannelDto);
			// const userSocket = this.chatGateway.getUserSocketConnection(user.socketId);
			// if (!userSocket)
			// 	throw new NotFoundException('User socket not found!');
			// userSocket.join(response.name);
			// console.log(`Channel: [${response.name}] Joined: [${user.socketId}]`);
			if (response.type === 'public'){
				this.chatGateway.server.emit(`globalChannelListener`, {
					status: 'global',
					action: 'create',
					newChannel: {
						id: response.id,
						type: response.type,
						name: response.name,
						description: response.description,
						image: response.image,
						status: 'public',
					}
				});
			}
			// socketArg.newChannel['status'] = 'involved';
			// this.chatGateway.server.emit(`userChannelListener:${user.login}`, socketArg);
			return { success: true };
		} catch (err) {
			if (image.path && fs.existsSync(image.path)) {
				promisify(fs.promises.unlink)(image.path);
				console.log('Image removed successfully.');
			}
			const notif = await this.usersService.createNotif(user.login, user.login, 'text', err.message);
			this.chatGateway.server.emit(`notif:${user.login}`, notif);
			console.error("@Post('/channel/create'): ", err.message);
			return ({ message: "Channel not created.", err: err.message});
		}
	}

	// --------------- ADMIN -------------------------
	@Post('/channel/kick')
	@UseGuards(ChatAdminGuard)
	async kickChannel(
		@Req() {user},
		@Req() {channel},
		// @Query ('channel') channel: string,
		@Query ('user') userName: string | undefined, // kicklenecek user'in adi.
	){
		try
		{
			console.log(`${C.B_YELLOW}POST: /channel/kick: @Req() user: [${userName}] channel: [${channel.name}]${C.END}`);
			const	tmpUser = await this.usersService.findUser(userName);
			const	singleUser= Array.isArray(tmpUser) ? tmpUser[0] : tmpUser;

			const	responseRemove = await this.chatService.removeUser(channel.name, 'members', userName); // bu channel'den user'i cikariyoruz admin cikardigi icin de kickleme oluyor.
			console.log(`${C.B_RED}Channel Kick: ${channel} - ${userName}${C.END}`);
			this.chatGateway.server.emit('channelGlobalListener');

			const userSocket = this.chatGateway.connectedUsers.get(singleUser.socketId);
			if (userSocket.rooms.has(channel.name))
			{
				// this.chatGateway.server.emit(`listenChannelMessage:${channel.name}`, `Admin[${user.login}] kicked ${userName}!`);
				userSocket.leave(channel.name)
				console.log(`${channel.name} channel'den socket baglantisi koparildi: ${userSocket.id}`);
			}
			else
				console.log(`${userSocket.id} zaten ${channel.name} channel'de degil! :D?`);
			return ({message: 'User kicked the channel successfully!'});
		}
		catch(err)
		{
			console.error("@Post('/channel/kick'):", err.message);
			return ({err: err.message});
		}
	}

	@Post('/channel/ban')
	@UseGuards(ChatAdminGuard)
	async banChannel(
		@Req() {user},
		@Req() {channel},
		// @Query ('channel') channel: string,
		@Query ('user') userName: string | undefined, // kicklenecek user'in adi.
	){
		try
		{
			console.log(`${C.B_YELLOW}POST: /channel/ban: @Req() user: [${userName}] channel: [${channel.name}]${C.END}`);
			const	tmpUser = await this.usersService.findUser(userName);
			const	singleUser= Array.isArray(tmpUser) ? tmpUser[0] : tmpUser;

			const	responseBanUser = await this.chatService.addChannelUser(channel, singleUser, 'bannedUsers');
			console.log("resopnseGBANUser:", responseBanUser);
			const	responseRemove = await this.chatService.removeUser(channel.name, 'members', userName); // bu channel'den user'i cikariyoruz admin cikardigi icin de kickleme oluyor.
			console.log("responsereREmove:", responseRemove);
			console.log(`${C.B_RED}Channel Ban: ${channel} - ${userName}${C.END}`);
			this.chatGateway.server.emit('channelGlobalListener');

			const userSocket = this.chatGateway.connectedUsers.get(singleUser.socketId);
			if (userSocket.rooms.has(channel.name))
			{
				// this.chatGateway.server.emit(`listenChannelMessage:${channel.name}`, `Admin[${user.login}] kicked ${userName}!`);
				userSocket.leave(channel.name)
				console.log(`${channel.name} channel'den socket baglantisi koparildi: ${userSocket.id}`);
			}
			else
				console.log(`${userSocket.id} zaten ${channel.name} channel'de degil! :D?`);
			return ({message: 'User banned the channel successfully!'});
		}
		catch(err)
		{
			console.error("@Post('/channel/ban'):", err.message);
			return ({err: err.message});
		}
	}

	@Post('/channel/unban')
	@UseGuards(ChatAdminGuard)
	async unbanChannel(
		@Req() {user},
		@Req() {channel},
		// @Query ('channel') channel: string,
		@Query ('user') userName: string | undefined, // kicklenecek user'in adi.
	){
		try
		{
			console.log(`${C.B_YELLOW}POST: /channel/unban: @Req() user: [${userName}] channel: [${channel.name}]${C.END}`);
			const	tmpUser = await this.usersService.findUser(userName);
			const	singleUser= Array.isArray(tmpUser) ? tmpUser[0] : tmpUser;

			//const	responseBanUser = await this.chatService.addChannelUser(channel, 'members', singleUser);
			const	responseRemove = await this.chatService.removeUser(channel.name, 'bannedUsers', userName); // bu channel'den user'i cikariyoruz admin cikardigi icin de kickleme oluyor.
			console.log(`${C.B_RED}Channel Ban: ${channel} - ${userName}${C.END}`);
			this.chatGateway.server.emit('channelGlobalListener');

			const userSocket = this.chatGateway.connectedUsers.get(singleUser.socketId);
			if (userSocket.rooms.has(channel.name))
			{
				// this.chatGateway.server.emit(`listenChannelMessage:${channel.name}`, `Admin[${user.login}] kicked ${userName}!`);
				userSocket.leave(channel.name)
				console.log(`${channel.name} channel'den socket baglantisi koparildi: ${userSocket.id}`);
			}
			else
				console.log(`${userSocket.id} zaten ${channel.name} channel'de degil! :D?`);
			return ({message: 'User banned the channel successfully!'});
		}
		catch(err)
		{
			console.error("@Post('/channel/ban'):", err.message);
			return ({err: err.message});
		}
	}

	@Post('/channel/admin')
	@UseGuards(ChatAdminGuard)
	async setChannelPermission(
		@Req() {user},
		@Req() {channel},
		@Query ('action') action: 'remove' | 'set',
		@Query ('user') targetUser: string,
	){
		try
		{
			console.log(`${C.B_YELLOW}POST: /channel/admin: @Req() action: [${action}] user: [${targetUser}] channel: [${channel.name}]${C.END}`);

			const	tmpUser = await this.usersService.findUser(targetUser);
			const	singleUser = Array.isArray(tmpUser) ? tmpUser[0] : tmpUser;
			const	response = await this.chatService.setPermission(channel, singleUser, action);
			console.log(response);
			return ({message: `User administrator successfully ${action}`});
		}
		catch(err)
		{
			console.error("@Post('/channel/admin'):", err.message);
			return ({err: err.message});
		}
	}
	// -----------------------------------------------

	// channel settings kısmında güncelleme yapıyoruz, yaparken tek tek gerçekleştiriyoruz.
	//	Güncellemediğimiz ayar undefined olarak geliyor.
	@Patch('/channel')
	@UseGuards(ChatAdminGuard)
	@UseInterceptors(FileInterceptor('channelImage', multerConfig))
	async patchChannel(
		@Req() {user},
		@Req() {channel},
		@UploadedFile() image: Express.Multer.File,
		@Body('channelName') name: string,
		@Body('channelDescription') description: string,
		@Body('channelPassword') password: string,
	) {
		try {
			const validArgs = { name, description, password, image };
			console.log(`${C.B_PURPLE}PATCH: /channel: @Query('channel'): [${user.login}][${channel.name}] @Body():${C.END}`, {validArgs});

			const	updateDto: Partial<CreateChannelDto> = Object.entries(validArgs)
				.filter(([_, value]) => value !== undefined)
				.reduce((obj, [key, value]) => ({ ...obj, [key]: value }), {});

			if (updateDto.password !== undefined) {
				if (updateDto.password !== ''){
					updateDto.type = ChannelType.PUBLIC;
					updateDto.password = bcrypt.hashSync(
						updateDto.password,
						bcrypt.genSaltSync(+process.env.DB_PASSWORD_SALT)
						);
				} else {
					updateDto.type = ChannelType.PRIVATE;
				}
			}

			if (updateDto.image !== undefined) {
				updateDto.image = process.env.B_IMAGE_REPO + image.filename;
			}

			const	responseChannel = await this.chatService.patchChannel(channel.name, updateDto);
			console.log("PATCH sonrasi update edilmis hali:", responseChannel);
		} catch (err) {
			if (image && image.path && fs.existsSync(image.path)) {
				promisify(fs.promises.unlink)(image.path);
				console.log('Image removed successfully.');
			}
			const notif = await this.usersService.createNotif(user.login, user.login, 'text', err.message);
			this.chatGateway.server.emit(`notif:${user.login}`, notif);
			console.log("@Patch('/channel'): ", err.message);
			return ({err: err.message});
		}
	}
}