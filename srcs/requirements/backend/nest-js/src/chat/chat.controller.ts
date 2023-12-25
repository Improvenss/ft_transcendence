import { Controller, Get, Post, Body, Delete, NotFoundException, Query, UseGuards, Req, UseInterceptors, UploadedFile, Patch } from '@nestjs/common';
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
import { Channel } from './entities/chat.entity';
import { User } from 'src/users/entities/user.entity';
import { multerConfig } from './channel.handler';
import { ChatAdminGuard } from './admin.guard';

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

		// ---------- Get ------------
	/**
	 * @Usage {{baseUrl}}:3000/chat/@all?relations=all
	 * 
	 * @Body() relationData: string[],
	 *  Bu da fetch istegi atarken body kismina yazdigimiz bilgiler.
	 * 
	 * @Query('relations') relations: string[] | null | 'all', 
	 *  {{baseUrl}}:3000/chat/channel?relations=users&relations=admins.
	 * @param channel 
	 * @param relations 
	 * @returns 
	 */
	// @SetMetadata('login', ['gsever', 'akaraca'])
	@Get('/channel')
	async findChannel(
		@Req() {user},
		@Query('channel') channel: string | undefined,
		@Query('relations') relations: string[] | null | 'all',
	) {
		try
		{
			console.log(`${C.B_GREEN}GET: Channel: [${channel}], Relation: [${relations}]${C.END}`);
			const	tmpChannel = await this.chatService.findChannel(channel, relations);
			// if (!tmpChannel)
			// 	throw (new NotFoundException(`Channel '${channel}' not found`))
			const channelArray = Array.isArray(tmpChannel) ? tmpChannel[0]: tmpChannel;
			if (channelArray && channelArray.members)
				return (await this.chatService.checkInvolvedUser(tmpChannel, user));
			return (tmpChannel);
		}
		catch (err)
		{
			console.log("@Get('/channel'): ", err);
			return (null)
		}
	}

	@Get('/channel/message')
	async findMessage(
		@Req() {user},
		@Query('message') message: string | undefined,
		@Query('relations') relations: string[] | null | 'all',
	) {
		try
		{
			console.log(`${C.B_GREEN}GET: Message: [${message}], Relation: [${relations}]${C.END}`);
			const	tmpMessage = await this.chatService.findMessage(message, relations);
			console.log("tmpMessage:", tmpMessage);
			return (tmpMessage);
		}
		catch(err)
		{
			console.log("@Get('/channel/message'):", err);
			return (null)
		}
	}

	// ---------- Create ---------
	// @Post(':channel')
	// async createChannel(@Body() createChannelDto: CreateChannelDto) {
	// 	return await this.chatService.createChannel(createChannelDto);
	// }

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
			const	tmpChannel: Channel | Channel[] | any = await this.chatService.findChannel(payload.channel, ['members', 'bannedUsers']);

			if (await this.chatService.findChannelUser(tmpChannel, 'bannedUsers', user))
				throw (new Error(`${user.login} already banned in this Channel: ${payload.channel}.`));

			if (tmpChannel.password && !bcrypt.compareSync(payload.password, tmpChannel.password))
				throw (new Error("Password is WRONG!!!"));
			const tmpUser = await this.usersService.findUser(user.login);
			const	responseChannel = await this.chatService.addChannelUser(tmpChannel, 'members', tmpUser as User);
			this.chatGateway.server.emit('channelListener');
			const	returnChannel = await this.chatService.findChannel(responseChannel.name, 'all');
			return (await this.chatService.checkInvolvedUser(returnChannel, user));
			//return ({response: true, message: `${user.login} registered in this ${channel}.`});
		}
		catch (err)
		{
			console.error("@Post('/channel/register'): registerChannel:", err);
			return ({warning: err});
		}
	}

	//kanaldan ayrılmak isteyen olursa, user ile userName birbirini tutuyorsa ayrılır,
	// eğerki birisi channeldan kickliyorsa user kanalın admini olmalı ve userName ise channel'da bulunmalıdır.
	@Post('/channel/leave')
	// @UseGuards(ChatAdminGuard)
	async leaveChannel(
		@Req() {user},
		@Query ('channel') channel: string,
		// @Query ('user') name: string | undefined,
	){
		try
		{
			console.log(`${C.B_YELLOW}POST: /channel/leave: @Req() user: [${user.login}] channel: [${channel}]${C.END}`);

			const	responseRemove = await this.chatService.removeUser(channel, 'members', user.login);
			console.log("responseRemove", responseRemove);
			console.log(`${C.B_RED}Channel Leave: ${channel} - ${user.login}${C.END}`);
			this.chatGateway.server.emit('channelListener');
			return ({message: 'User left the channel successfully!'});
		}
		catch(err)
		{
			console.error("@Post('/channel/leave'):", err);
			return ({error: err});
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
			this.chatGateway.server.emit('channelListener');

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
			console.error("@Post('/channel/kick'):", err);
			return ({error: err});
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

			const	responseBanUser = await this.chatService.addChannelUser(channel, 'bannedUsers', singleUser);
			console.log("resopnseGBANUser:", responseBanUser);
			const	responseRemove = await this.chatService.removeUser(channel.name, 'members', userName); // bu channel'den user'i cikariyoruz admin cikardigi icin de kickleme oluyor.
			console.log("responsereREmove:", responseRemove);
			console.log(`${C.B_RED}Channel Ban: ${channel} - ${userName}${C.END}`);
			this.chatGateway.server.emit('channelListener');

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
			console.error("@Post('/channel/ban'):", err);
			return ({error: err});
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

			const	responseBanUser = await this.chatService.addChannelUser(channel, 'members', singleUser);
			const	responseRemove = await this.chatService.removeUser(channel.name, 'bannedUsers', userName); // bu channel'den user'i cikariyoruz admin cikardigi icin de kickleme oluyor.
			console.log(`${C.B_RED}Channel Ban: ${channel} - ${userName}${C.END}`);
			this.chatGateway.server.emit('channelListener');

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
			console.error("@Post('/channel/ban'):", err);
			return ({error: err});
		}
	}
	// -----------------------------------------------

	@Post('/channel/create')
	@UseInterceptors(FileInterceptor('image', multerConfig))
	async createChannel(
		@Req() {user},
		@UploadedFile() image: any,
		@Body('name') name: string,
		@Body('type') type: string,
		@Body('password') password: string | undefined,
		@Body('description') description: string,
	  ) {
		try {
			// const findChannel: Channel | Channel[] | any = await this.chatService.findChannel(name);
			// if (findChannel !== null){
			// 	throw new Error("A channel with the same name already exists.");
			// }
			const tmpUser = await this.usersService.findUser(user.login);
			if (!tmpUser) {
				throw new NotFoundException(`User not found for channel create: ${user.login as User}`);
			}
			if (!image)
				throw new Error('No file uploaded');

			if (!fs.existsSync(image.path))
				throw new Error(`File path is not valid: ${image.path}`);

			const imgUrl =  process.env.B_IMAGE_REPO + image.filename;
			const	createChannelDto: CreateChannelDto = {
				name: name as string,
				type: type as string,
				description: description as string,
				password: (password === undefined)
					? null
					: bcrypt.hashSync(
						password,
						bcrypt.genSaltSync(+process.env.DB_PASSWORD_SALT)),
				image: imgUrl as string,
				members: [tmpUser as User],
				admins: [tmpUser as User],
			};
			const response = await this.chatService.createChannel(createChannelDto);
			// Kanal oluşturulduktan sonra, ilgili soket odasına katılın
			// this.chatGateway.server.to(name).emit('channelListener');
			// this.chatGateway.joinChannel(name); // Kullanıcının kanala katılması gerekiyor //1 kere çalışıyor
			this.chatGateway.server.emit('channelListener'); // kullancılara yeni channel oluşturuldu infosu verip güncelleme yaptırtmak için sinyal gönderiyoruz.
			return ({
				message: `${response}`,
				channel: {
					status: 'involved',
					name: name,
					type: type,
					description: description,
					image: imgUrl,
					members: [tmpUser as User],
					admins: [tmpUser as User],
					messages: [],
				},
			});
		} catch (err) {
			if (image) {
				await promisify(fs.promises.unlink)(image.path);
				console.log('Image remove successfully.');
			}
			console.error("@Post('/channel/create'): ", err);
			return ({ message: "Channel not created." });
		}
	}


	// channel settings kısmında güncelleme yapıyoruz, yaparken tek tek gerçekleştiriyoruz.
	//	Güncellemediğimiz ayar undefined olarak geliyor.
	// !!! Servis ayarları eklenmedi eklenecek.
	// !!! yapı eksik tamamla
	@Patch('/channel')
	@UseGuards(ChatAdminGuard)
	@UseInterceptors(FileInterceptor('channelImage', multerConfig))
	async patchChannel(
		@Req() {user},
		@UploadedFile() channelImage: Express.Multer.File,
		@Query ('channel') channel: string,
		@Body('channelName') name: string,
		@Body('channelDescription') description: string,
		@Body('channelPassword') password: string,
	) {
		try {
			console.log(`${C.B_PURPLE}PATCH: /channel: @Query('channel'): [${user.login}][${channel}] @Body():${C.END}`, {
				name,
				description,
				password,
				channelImage
			});
			const	createChannelDto: Partial<CreateChannelDto> = {
				name: name,
				type: (password === "")
					? 'public'
					: 'private',
				description: description,
				password: (password === undefined)
					? undefined
					: (password === "")
						? null
						: bcrypt.hashSync(
							password,
							bcrypt.genSaltSync(+process.env.DB_PASSWORD_SALT)),
				image: (channelImage)
					? process.env.B_IMAGE_REPO + channelImage.filename
					: undefined,
				// members: [],
				// admins: [],
				// bannedUsers: [],
			}
			const	responseChannel = await this.chatService.patchChannel(channel, createChannelDto);
			console.log("PATCH sonrasi update edilmis hali:", responseChannel);
		} catch (err) {
			console.log("@Patch('/channel'): ", err);
			return ({err: err});
		}
	}

	// ---------- Delete ---------
	@Delete('/channel')
	async deleteChannel(
		@Req() {user},
		@Query('channel') channel: string | undefined,
	){
		try
		{
			console.log(`${C.B_RED}DELETE: Channel: ${channel}${C.END}`);
			const tmpChannel = await this.chatService.removeChannel(channel);
			if (!tmpChannel)
				throw (new NotFoundException("Channel does not exist!"));
			this.chatGateway.server.emit('channelListener'); // Kullanicilara channel'in silinme infosu verip güncelleme yaptırtmak için sinyal gönderiyoruz.
			return (tmpChannel);
		}
		catch (err)
		{
			console.error("@Delete('/channel'): removeChannel():", err);
			return ({error: err.response});
		}
	}


}