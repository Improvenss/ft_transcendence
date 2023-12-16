import { Controller, Get, Post, Body, Delete, NotFoundException, Query, UseGuards, Req, UseInterceptors, UploadedFile } from '@nestjs/common';
import { ChatService } from './chat.service';
import { CreateMessageDto } from './dto/chat-message.dto';
import { UsersService } from 'src/users/users.service';
import { Colors as C } from '../colors';
import { AuthGuard } from 'src/auth/auth.guard';
import { extname } from 'path';
import { diskStorage } from 'multer';
import { FileInterceptor } from '@nestjs/platform-express';
import { CreateChannelDto } from './dto/chat-channel.dto';
import { promisify } from 'util';
import * as fs from 'fs';
import { ChatGateway } from './chat.gateway';
import * as bcrypt from 'bcrypt';
import { Channel } from './entities/chat.entity';

// Dosya Adı Değiştirme Fonksiyonu
	const editFileName = (req, file, callback) => {
		const randomName = Array(15)
		.fill(null)
		.map(() => Math.round(Math.random() * 16).toString(16))
		.join('');

		// Dosya adını sanitize et
		// const sanitizeFilename = require('sanitize-filename');
		// const sanitizedFilename = sanitizeFilename(file.originalname);
		// Eğerki dosya adı My/File:Name.png ise MyFileName.png yapıyor.

		// callback(null, `${randomName}${sanitizedFilename}`);
		callback(null, `${randomName}${extname(file.originalname)}`);
  	};
  
// Dosya Türü Kontrolü Fonksiyonu
	const imageFileFilter = (req, file, callback) => {
		if (!file.originalname.match(/\.(jpg|jpeg|png|gif)$/) 
			|| !file.mimetype.startsWith('image/')) {
		return callback(new Error('Only image files are allowed!'), false);
		}
		callback(null, true);
  	};

	const MAX_FILE_SIZE = 1024 * 1024 * 3; // 3MB

	const storage = diskStorage({
		destination: './uploads/',
		filename: editFileName,
	});

 	const multerConfig = {
		storage,
		limits: {
			fileSize: MAX_FILE_SIZE,
		},
		fileFilter: imageFileFilter,
	};

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
			const	tmpChannel: Channel | Channel[] | any = await this.chatService.findChannel(payload.channel, ['members']);
			if (tmpChannel.password && !bcrypt.compareSync(payload.password, tmpChannel.password))
				throw (new Error("Password is WRONG!!!"));
			const tmpUser = await this.usersService.findUser(user.login);
			const	responseChannel = await this.chatService.updateChannel(tmpChannel, tmpUser[0]);
			//await this.chatService.updateChannel(tmpChannel, tmpUser);
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
				throw new NotFoundException(`User not found for channel create: ${user[0].login}`);
			}
			if (!image){
				throw new Error('No file uploaded');
			}
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
				members: [tmpUser[0]],
				admins: [tmpUser[0]],
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
					members: [tmpUser[0]],
					admins: [tmpUser[0]],
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
			return (await this.chatService.checkInvolvedUser(tmpChannel, user));
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

	// ---------- Delete ---------
	@Delete('/channel')
	async removeChannel(
		@Req() {user},
		@Query('channel') channel: string | undefined,
	){
		try
		{
			console.log(`${C.B_RED}DELETE: Channel: ${channel}${C.END}`);
			const tmpChannel = await this.chatService.removeChannel(channel);
			if (!tmpChannel)
				throw (new NotFoundException("Channel does not exist!"));
				// throw (new NotFoundException("name: Channel does not exist!"));
			this.chatGateway.server.emit('channelListener'); // Kullanicilara channel'in silinme infosu verip güncelleme yaptırtmak için sinyal gönderiyoruz.
			console.log("return'dan onceki tmpChannel:", tmpChannel);
			return (tmpChannel);
		}
		catch (err)
		{
			console.error("@Delete('/channel'): removeChannel():", err);
			return ({error: err.response});
		}
	}

	//kanaldan ayrılmak isteyen olursa, user ile userName birbirini tutuyorsa ayrılır,
		// eğerki birisi channeldan kickliyorsa user kanalın admini olmalı ve userName ise channel'da bulunmalıdır.
	@Get('/channel/leave')
	async leaveChannel(
		@Req() {user},
		@Query ('channel') channel: string,
		@Query ('user') name: string | undefined,
	){
		try{
			if (name === undefined){ //eğer kullanıcı adı tanımlı değilse kişi leave işlemini gerçekleştiriyor.
				await this.chatService.removeUser(channel, user.login);
				console.log(`${C.B_RED}GET: Channel Leave: ${channel} - ${user.login}${C.END}`);
				//return ({message: 'User left the channel successfully'});
			}
			else{ //user'ın bir admin, name'in ise kicklenen kişi olduğu kontrol edilmelidir.
				console.log(`${C.B_RED}GET: Channel Kick: ${channel} - ${user.login}${C.END}`);
			}
			this.chatGateway.server.emit('channelListener');
			return ({message: 'User left the channel successfully'});
		} catch(err){
			console.error("@Get('/channel/leave'):", err);
			return ({error: err});
		}
	}
}
