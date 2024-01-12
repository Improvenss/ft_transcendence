import { Controller, Get, Post, Body, Delete, NotFoundException, Query, UseGuards, Req, UseInterceptors, UploadedFile, Patch, ParseBoolPipe, Param, ParseIntPipe } from '@nestjs/common';
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
import { ChatGuard } from './chat.guard';
import { CreateDmDto } from './dto/chat-dm.dto';

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

	@Delete('/dm/leave/:dmId')
	async leaveDm(
		@Req() {user}: {user: User},
		@Param('dmId', ParseIntPipe) dmId: number 
	){
		try {
			console.log(`${C.B_GREEN}DELETE: /dm/leave/:${dmId}: who[${user.login}]${C.END}`);
			const tmpDm = await this.chatService.getDmPrimary(dmId);
			if (!tmpDm)
				throw new NotFoundException('Dm not found!');

			await this.chatService.removeUserDm(dmId, user.id);
			const userSocket = this.chatGateway.getUserSocket(user.id);
			userSocket.emit('dmListener', {
				action: 'leave',
				dmId: tmpDm.id,
			})
			userSocket.leave(`dm-${tmpDm.id}`);

			return { success: true };
		} catch (err) {
			console.error(`@Delete('/dm/leave:${dmId}'): `, err.message);
			return ({ success: false, err: err.message});
		}
	}

	@Post('/dm/:user')
	async createDm(
		@Req() {user}: {user: User},
		@Param('user', ParseIntPipe) targetId: number,
	){
		try {
			console.log(`${C.B_GREEN}POST: /dm/:${targetId}: source[${user.login}]${C.END}`);
			const userSocket = this.chatGateway.getUserSocket(user.id);
			const targetUser = await this.usersService.getUserPrimary({id: targetId});
			
			const responseDm = await this.chatService.getDm(user.id, targetId);
			if (responseDm){
				await this.chatService.addUserDm(responseDm.id, user);
				userSocket.join(`dm-${responseDm.id}`);
				console.log(`DM: user[${user.login}] joined dm[${responseDm.id}]`);
			} else {
				const createDmDto: CreateDmDto = {
					usersData: [user, targetUser], //kalıcı -> unrelation
					members: [user], //geçici -> relation
					messages: [],
				}

				const response = await this.chatService.createDm(createDmDto);
				userSocket.join(`dm-${response.id}`);
				console.log(`DM: user[${user.login}] joined dm[${response.id}]`);
			}
			return { success: true };
		} catch (err) {
			console.error(`@Post('/dm/:${targetId}'): `, err.message);
			return ({ success: false, err: err.message});
		}
	}

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
					userSocket.join(`${channel.id}`);
					console.log(`Channel: [${channel.name}] Joined: [${user.socketId}]`);
				});
			
			const dms = await this.chatService.getDms(user.id);
			//const formattedDms = dms.map(dm => ({
			//	...dm.toJSON(), // Use toJSON method to control the serialization
			//}));
			dms.forEach((dm) => {
				userSocket.join(`dm-${dm.id}`);
				console.log(`Dm: [${user.login}] Joined: [${user.socketId}]`);
			})
			return ({channels, dms});
		} catch (err){
			console.error("@Get('/channels'): ", err.message);
			return ({err: err.message});
		}
	}

	@Post('/channel/register') //OK
	async registerChannel(
		@Req() {user}: {user: User},
		@Body() body: {channel: string, password: string}
	){
		try {
			console.log(`${C.B_YELLOW}POST: /channel/register: user: [${user.login}] channel: [${body.channel}]${C.END}`);
			const tmpChannel = await this.chatService.getChannelRelation({
				name: body.channel,
				relation: {},
				primary: true,
			});
			if (!tmpChannel)
				throw new NotFoundException('Channel not found!');

			if (tmpChannel.bannedUsers.find((member) => member.id === user.id))
				throw (new Error(`${user.login} banned in this Channel: ${body.channel}.`));

			if (tmpChannel.members.find((member) => member.id === user.id))
				throw (new Error(`${user.login} already in this Channel: ${body.channel}.`));

			if (tmpChannel.password && !bcrypt.compareSync(body.password, tmpChannel.password))
				throw (new Error(`Channel: [${body.channel}] password is wrong!`));

			tmpChannel.members.push(user);

			const channelResponse = await this.chatService.saveChannel(tmpChannel);
			delete channelResponse.password;
			channelResponse['status'] = 'involved';

			this.chatGateway.server.to(`${tmpChannel.id}`).emit('channelListener', {
				action: 'join',
				channelId: tmpChannel.id,
				data: user
			});

			const userSocket = this.chatGateway.getUserSocket(user.id);
			userSocket.join(`${tmpChannel.id}`);
			console.log(`Channel: [${tmpChannel.name}] Joined: [${user.login}]`);
			return (channelResponse);
		} catch (err) {
			console.error("@Post('/channel/register'): registerChannel:", err.message);
			const notif = await this.usersService.createNotif(user.id, user.id, 'text', err.message);
			this.chatGateway.server.emit(`user-notif:${user.id}`, notif);
			return ({ success: false, err: err.message});
		}
	}

	@Post('/channel/create') //OK
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
			const tmpUser = await this.usersService.getUserPrimary({id: user.id});
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
	// channel settings kısmında güncelleme yapıyoruz, yaparken tek tek gerçekleştiriyoruz.
	// Güncellemediğimiz ayar undefined olarak geliyor.
	@Patch('/channel') //OK
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
			const data = { name, description, password, image };
			console.log(`${C.B_PURPLE}PATCH: /channel: @Query('channel'): [${user.login}][${channel.name}] @Body():${C.END}`, {data});

			const	updateDto: Partial<CreateChannelDto> = Object.entries(data)
				.filter(([_, value]) => value !== undefined)
				.reduce((obj, [key, value]) => ({ ...obj, [key]: value }), {});

			if (updateDto.password !== undefined) {
				if (updateDto.password !== ''){
					updateDto.type = ChannelType.PRIVATE;
					updateDto.password = bcrypt.hashSync(
						updateDto.password,
						bcrypt.genSaltSync(+process.env.DB_PASSWORD_SALT)
					);
				} else {
					updateDto.type = ChannelType.PUBLIC;
				}
			}

			if (updateDto.image !== undefined) {
				updateDto.image = process.env.B_IMAGE_REPO + image.filename;
			}

			await this.chatService.patchChannel(channel.id, updateDto);
			delete updateDto.password;
			this.chatGateway.server.to(`${channel.id}`).emit('channelListener', {
				action: 'update',
				channelId: channel.id,
				data: updateDto
			});
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

	//kanaldan ayrılmak isteyen olursa, user ile userName birbirini tutuyorsa ayrılır,
	// eğerki birisi channeldan kickliyorsa user kanalın admini olmalı ve userName ise channel'da bulunmalıdır.
	@Delete('/channel/leave') //OK
	@UseGuards(ChatGuard)
	async leaveChannel(
		@Req() {user}: {user: User},
		@Req() {channel}: {channel: Channel}
	){
		try {
			console.log(`${C.B_YELLOW}POST: /channel/leave: user: [${user.login}] channel: [${channel.name}]${C.END}`);

			const channelId = await this.chatService.removeUser(channel.name, 'members', user.id);
			console.log(`${C.B_RED}Channel Leave: ${channel.name} - ${user.login}${C.END}`);

			this.chatGateway.server.to(`${channel.id}`).emit('channelListener', {
				action: 'leave',
				channelId: channelId,
				data: {
					userId: user.id,
					login: user.login,
					type: channel.type
				}
			});
			const userSocket = this.chatGateway.getUserSocket(user.id);
			userSocket.leave(`${channel.id}`);
			return { success: true }; 
		} catch(err){
			return ({ success: false, err: err.message});
		}
	}

	// ---------- Delete ---------
	@Delete('/channel') //OK
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
				this.chatGateway.server.to(`${channel.id}`).emit('channelListener', {
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


	/*
		Delete -> public ve private silinecek Herkeste çıkacak, activeChannel ise null olacak.
		Leave -> kanaldaki herkesten kullanıcı olarak çıkması gerek. Çıkan kişinden kanalın silinmesi gerekiyor, public ise public yapı olmalı, private ise dümdüz sil.
	
	*/
	@Post('/channel/:action/:userId')
	@UseGuards(ChatAdminGuard)
	async channelAction(
		@Req() {user}: {user: User},
		@Req() {channel}: {channel: Channel},
		@Param('action') action: string,
		@Param('userId', ParseIntPipe) userId: number
	){
		try {
			console.log(`${C.B_YELLOW}POST: /channel/:${action}: @Req() user: [${user.login}] channel: [${channel.name}]${C.END}`);
			const targetUser = await this.usersService.getUserPrimary({id: userId});

			if (action === 'kick' || action === 'ban'){
				await this.chatService.removeUser(channel.name, 'members', userId);
			}
			if (action === 'ban'){
				await this.chatService.addUser(channel.name, 'bannedUsers', targetUser);
			}
			if (action === 'unban'){
				await this.chatService.removeUser(channel.name, 'bannedUsers', userId);
			}
			if (action === 'setAdmin' || action === 'removeAdmin'){
				await this.chatService.setPermission(channel, targetUser, action);
			}
			
			if (action === 'kick' || action === 'ban'){
				const userSocket = this.chatGateway.getUserSocket(userId);
				if (userSocket.rooms.has(`${channel.id}`)){
					userSocket.emit('channelListener', {
						action: 'leave',
						channelId: channel.id,
						data: {
							userId: targetUser.id,
							login: targetUser.login,
							type: channel.type
						}
					})
					userSocket.leave(`${channel.id}`)
				}
			}

			console.log(`${C.B_RED}Channel ${action}: ${channel.name} - ${targetUser.login}${C.END}`);
			if (action === 'setAdmin' || action === 'ban' || action === 'unban'){
				this.chatGateway.server.to(`${channel.id}`).emit('channelListener', {
					action: action,
					channelId: channel.id,
					data: targetUser
				});
			} else {
				this.chatGateway.server.to(`${channel.id}`).emit('channelListener', {
					action: action,
					channelId: channel.id,
					data: {
						id: targetUser.id
					}
				});
			}
			//Channel'daki herkese bildirim atama ekle
			return ({ success: true });
		} catch (err){
			console.error(`@Post('/channel/${action}'):`, err.message);
			return ({ success: false, err: err.message});
		}
	}
	// -----------------------------------------------
}
