import { Controller, Get, Post, Body, Patch, Param, Delete, NotFoundException, Query, HttpException, HttpStatus, UseGuards, Head, SetMetadata, Req, UseInterceptors, UploadedFile } from '@nestjs/common';
import { ChatService } from './chat.service';
import { CreateMessageDto, UpdateMessageDto } from './dto/chat-message.dto';
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

	const MAX_FILE_SIZE = 1024 * 1024 * 2; // 2MB

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

	@Post('/channel/create')
	@UseInterceptors(FileInterceptor('image', multerConfig))
	async createChannel(
		@Req() {user},
		@UploadedFile() image,
		@Body('name') name: string,
		@Body('type') type: string,
		@Body('password') password: string,
		@Body('description') description: string,
	  ) {
		try {
			// const findChannel: Channel | Channel[] | any = await this.chatService.findChannel(name);
			// if (findChannel !== null){
			// 	throw new Error("A channel with the same name already exists.");
			// }
			const tmpUser = await this.usersService.findOne(null, user.login);
			if (!tmpUser) {
				throw new NotFoundException(`User not found for channel create: ${user.login}`);
			}
			if (!image){
				throw new Error('No file uploaded');
			}
			const imgUrl =  process.env.B_IMAGE_REPO + image.filename;
			const	createChannelDto: CreateChannelDto = {
				name: name as string,
				type: type as string,
				description: description as string,
				// password: password as string,
				password: password === ('' || undefined || null)
					? null
					: bcrypt.hashSync(
						password,
						bcrypt.genSaltSync(+process.env.DB_PASSWORD_SALT)),
				image: imgUrl as string,
				members: [tmpUser],
				admins: [tmpUser],
			};
			const response = await this.chatService.createChannel(createChannelDto);
			console.log(response);
			console.log(createChannelDto);
			this.chatGateway.server.emit('channelListener'); // kullancılara yeni channel oluşturuldu infosu verip güncelleme yaptırtmak için sinyal gönderiyoruz.
			return ({
				message: `${response}`,
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
			console.log("@Req() user:", user);
			return (await this.chatService.checkInvolvedUser((await this.chatService.findChannel(channel, relations)), user));
		}
		catch (err)
		{
			console.log("@Get('/channel'): ", err);
			return (null)
		}
	}

	// ---------- Delete ---------
	@Delete('/channel')
	async removeChannel(
		@Req() {user},
		@Query('channel') channel: string | undefined
	){
		try
		{
			console.log(`DELETE: Channel: ${channel}`);
			if (channel === "all")
			{
				const	response = await this.chatService.removeAllChannel();
				console.log(`All channels removed!`);
				return (response);
			}
			const tmpUser = await this.chatService.removeChannel(channel);
			if (!tmpUser)
				throw (new NotFoundException("name: Channel does not exist!"));
			return (tmpUser);
		}
		catch (err)
		{
			console.error("@Delete('/channel'): removeChannel(): ", err);
			return (null);
		}

	}
}