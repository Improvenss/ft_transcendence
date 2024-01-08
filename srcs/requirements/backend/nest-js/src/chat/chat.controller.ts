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
		@Req() {user}: {user: User},
	){
		try {
			console.log(`${C.B_GREEN}GET: /channels: requester[${user.login}]${C.END}`);
			const userSocket = this.chatGateway.getUserSocket(user.id);
			const channels = await this.chatService.getChannels(user.id);
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

	@Post('/channel/register')
	async registerChannel(
		@Req() {user}: {user: User},
		@Body() body: {channel: string, password: string} //joiin channel ile giriş yapıldığı için id'sini fend'den getiremem
	){
		try {
			console.log(`${C.B_YELLOW}POST: /channel/register: user: [${user.login}] channel: [${body.channel}]${C.END}`);
			const tmpChannel = await this.chatService.getChannelRelation({
				channelName: body.channel,
				relation: {},
				primary: true,
			});
			if (!tmpChannel)
				throw new NotFoundException('Channel not found!');

			if (tmpChannel.bannedUsers.some((channelUser) => {channelUser.id === user.id}))
				throw (new Error(`${user.login} banned in this Channel: ${body.channel}.`));

			if (tmpChannel.members.some((channelUser) => {channelUser.id === user.id}))
				throw (new Error(`${user.login} already in this Channel: ${body.channel}.`));

			if (tmpChannel.password && !bcrypt.compareSync(body.password, tmpChannel.password))
				throw (new Error(`Channel: [${body.channel}] password is wrong!`));

			tmpChannel.members.push(user);

			const channelResponse = await this.chatService.saveChannel(tmpChannel);
			delete channelResponse.password;
			channelResponse['status'] = 'involved';

			const userSocket = this.chatGateway.getUserSocket(user.id);
			userSocket.join(tmpChannel.name);
// // Kanala bağlı olan tüm kullanıcılara bir mesaj gönderme
// this.chatGateway.server.to(body.channel).emit('newMessage', {
//	channel: 'channel-1'
// 	sender: 'system',
// 	content: `${user.username} kanala katıldı!`,
//   });
			console.log(`Channel: [${tmpChannel.name}] Joined: [${user.socketId}]`);
			return (channelResponse);
		} catch (err) {
			console.error("@Post('/channel/register'): registerChannel:", err.message);
			const notif = await this.usersService.createNotif(user.id, user.id, 'text', err.message);
			this.chatGateway.server.emit(`user-notif:${user.id}`, notif);
			return ({ success: false, err: err.message});
		}
	}

	//kanaldan ayrılmak isteyen olursa, user ile userName birbirini tutuyorsa ayrılır,
	// eğerki birisi channeldan kickliyorsa user kanalın admini olmalı ve userName ise channel'da bulunmalıdır.
	@Delete('/channel/leave')
	async leaveChannel(
		@Req() {user}: {user: User},
		@Query ('channel') name: string,
	){
		try {
			console.log(`${C.B_YELLOW}POST: /channel/leave: user: [${user.login}] channel: [${name}]${C.END}`);

			const userSocket = this.chatGateway.getUserSocket(user.id);
			userSocket.leave(name);
			const channelId = await this.chatService.removeUser(name, 'members', user.id);
			console.log(`${C.B_RED}Channel Leave: ${name} - ${user.login}${C.END}`);

			this.chatGateway.server.to(name).emit('channelListener', {
				action: 'leave',
				channelId: channelId,
				data: {
					userId: user.id,
					login: user.login,
				}
			});
			return { success: true };
		} catch(err){
			return ({ success: false, err: err.message});
		}
	}

	// ---------- Delete ---------
	@Delete('/channel')
	@UseGuards(ChatAdminGuard)
	async deleteChannel(
		@Req() {user}: {user: User},
		@Req() {channel}: {channel: Channel},
	){
		try {
			console.log(`${C.B_RED}DELETE: Channel: ${channel.name}${C.END}`);
			
			if (channel.type === 'public'){
				this.chatGateway.server.emit('channelListener', {
					action: 'delete',
					channelId: channel.id
				});
			} else if (channel.type === 'private'){
				this.chatGateway.server.to(channel.name).emit('channelListener', {
					action: 'delete',
					channelId: channel.id
				});
			}

			this.chatGateway.forceLeaveChannel(channel.name);
			await this.chatService.removeChannel(channel);
			return ({ success: true });
		} catch (err) {
			console.error("@Delete('/channel'): deleteChannel():", err.message);
			return ({ success: false, err: err.message});
		}
	}

	@Post('/channel/create')
	@UseInterceptors(FileInterceptor('image', multerConfig))
	async createChannel(
		@Req() {user}: {user: User},
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
			const channel = await this.chatService.getChannelPrimary({name: name});
			if (channel){
				throw new Error("A channel with the same name already exists.");
			}
			const tmpUser = await this.usersService.getUserPrimay({id: user.id});
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
			if (response.type === 'public'){
				this.chatGateway.server.emit('channelListener', {
					action: 'create',
					channelId: response.id,
					data: {
						id: response.id,
						name: response.name,
						description: response.description,
						image: response.image,
						status: 'public'
					}
				});
			}

			return { success: true };
		} catch (err) {
			if (image.path && fs.existsSync(image.path)) {
				promisify(fs.promises.unlink)(image.path);
				console.log('Image removed successfully.');
			}
			const notif = await this.usersService.createNotif(user.id, user.id, 'text', err.message);
			this.chatGateway.server.emit(`user-notif:${user.id}`, notif);
			console.error("@Post('/channel/create'): ", err.message);
			return ({ success: false, err: err.message});
		}
	}

	// --------------- ADMIN -------------------------
	/*@Post('/channel/kick')
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
			const tmpUser = await this.usersService.getUserPrimay({login: userName});

			const	responseRemove = await this.chatService.removeUser(channel.name, 'members', userName); // bu channel'den user'i cikariyoruz admin cikardigi icin de kickleme oluyor.
			console.log(`${C.B_RED}Channel Kick: ${channel} - ${userName}${C.END}`);
			this.chatGateway.server.emit('channelGlobalListener');

			// const userSocket = this.chatGateway.connectedUsers.get({socketId: tmpUser.socketId});
			const userSocket = this.chatGateway.getIdSocketConnection(tmpUser.id);
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
			const tmpUser = await this.usersService.getUserPrimay({login: userName});

			const	responseBanUser = await this.chatService.addChannelUser(channel, tmpUser, 'bannedUsers');
			console.log("resopnseGBANUser:", responseBanUser);
			const	responseRemove = await this.chatService.removeUser(channel.name, 'members', userName); // bu channel'den user'i cikariyoruz admin cikardigi icin de kickleme oluyor.
			console.log("responsereREmove:", responseRemove);
			console.log(`${C.B_RED}Channel Ban: ${channel} - ${userName}${C.END}`);
			this.chatGateway.server.emit('channelGlobalListener');

			// const userSocket = this.chatGateway.connectedUsers.get({socketId: tmpUser.socketId});
			const userSocket = this.chatGateway.getIdSocketConnection(tmpUser.id);
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
			const tmpUser = await this.usersService.getUserPrimay({login: userName});

			//const	responseBanUser = await this.chatService.addChannelUser(channel, 'members', singleUser);
			const	responseRemove = await this.chatService.removeUser(channel.name, 'bannedUsers', userName); // bu channel'den user'i cikariyoruz admin cikardigi icin de kickleme oluyor.
			console.log(`${C.B_RED}Channel Ban: ${channel} - ${userName}${C.END}`);
			this.chatGateway.server.emit('channelGlobalListener');

			// const userSocket = this.chatGateway.connectedUsers.get({socketId: tmpUser.socketId});
			const userSocket = this.chatGateway.getIdSocketConnection(tmpUser.id);
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
	}*/
	// -----------------------------------------------

	// channel settings kısmında güncelleme yapıyoruz, yaparken tek tek gerçekleştiriyoruz.
	//	Güncellemediğimiz ayar undefined olarak geliyor.
	@Patch('/channel')
	@UseGuards(ChatAdminGuard)
	@UseInterceptors(FileInterceptor('channelImage', multerConfig))
	async patchChannel(
		@Req() {user}: {user: User},
		@Req() {channel}: {channel: Channel},
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
			return ({ success: true });
		} catch (err) {
			if (image && image.path && fs.existsSync(image.path)) {
				promisify(fs.promises.unlink)(image.path);
				console.log('Image removed successfully.');
			}
			const notif = await this.usersService.createNotif(user.id, user.id, 'text', err.message);
			this.chatGateway.server.emit(`user-notif:${user.id}`, notif);
			console.log("@Patch('/channel'): ", err.message);
			return ({ success: false, err: err.message});
		}
	}
}
