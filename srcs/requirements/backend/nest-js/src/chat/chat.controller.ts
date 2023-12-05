import { Controller, Get, Post, Body, Patch, Param, Delete, NotFoundException, Query, HttpException, HttpStatus, UseGuards, Head, SetMetadata } from '@nestjs/common';
import { ChatService } from './chat.service';
import { UpdateChannelDto } from './dto/chat-channel.dto';
import { CreateMessageDto, UpdateMessageDto } from './dto/chat-message.dto';
import { UsersService } from 'src/users/users.service';
import { Colors as C } from '../colors';

@Controller('/chat')
export class ChatController {
	constructor(
		private readonly chatService: ChatService,
		private readonly usersService: UsersService) {}

	// ---------- Create ---------
	// @Post(':channel')
	// async createChannel(@Body() createChannelDto: CreateChannelDto) {
	// 	return await this.chatService.createChannel(createChannelDto);
	// }

	// @Post('@:channel')
	@Post('/channel')
	async findChannelFirst(
		// @Param('channel') channel: string,
		@Query('channel') channel: string,
		@Query('relations') relations: string[] | null | 'all', // -> {{baseUrl}}:3000/chat/@all?relations=users&relations=admins.
		@Body() relationData: {userCookie: string, socketID: string}, // -> Bu da fetch istegi atarken body kismina yazdigimiz bilgiler.
	) {
		console.log(`${C.B_YELLOW}POST: Channel: [${channel}], Relation: [${relations}]${C.END}`);
		if (!relationData)
			return (new Error("@Post('@:channel/:relation'): findChannelFirst(): @Body(): Cookie not found!"));
		const jwt = require('jsonwebtoken');
		const decoded = jwt.verify(relationData.userCookie, process.env.JWT_PASSWORD_HASH);
		const tmpUser = await this.usersService.findOne(null, decoded.login as string);
		if (!tmpUser)
			throw (new HttpException("@Post(':channel/:relation'): (Cookie): @findOne(): login: User does not exist!",
				HttpStatus.INTERNAL_SERVER_ERROR));
		// -----------------------

		const isId = /^\d+$/.test(channel); // Bakiyor bu girilen deger numara mi degil mi? numaraysa true donduruyor.
		const tmpChannel = await this.chatService.findChannel(isId ? +channel : channel, relations);
		if (!tmpChannel)
			throw (new NotFoundException("@Get('@:channel'): findChannel(): id&name: Channel does not exist!"));
		const invData = await this.chatService.checkInvolvedUser(tmpChannel, tmpUser);
		console.log(`POST ile alinan ve involved olarak duzenlenmis data: ${invData} alttaki`, invData);
		return (invData);
		// return (tmpChannel);
	}

	@Post(':message')
	createMessage(@Body() createMessageDto: CreateMessageDto) {
		return this.chatService.createMessage(createMessageDto);
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
	// @Get('@:channel')
	@Get('/channel')
	@SetMetadata('roles', ['admin'])
	async findChannel(
		// @Param('channel') channel: string,
		@Query('channel') channel: string,
		@Query('relations') relations: string[] | null | 'all',
	) {
		console.log(`${C.B_GREEN}GET: Channel: [${channel}], Relation: [${relations}]${C.END}`);
		const isId = /^\d+$/.test(channel); // Bakiyor bu girilen deger numara mi degil mi? numaraysa true donduruyor.
		console.log("isId:", isId);
		const tmpChannel = await this.chatService.findChannel(isId ? +channel : channel, relations);
		if (!tmpChannel)
			throw (new NotFoundException("@Get(): findChannel(): id&name: Channel does not exist!"));
		return (tmpChannel);
	}

// // Burada kaldin
// 	@Get('messages/all')
// 	findAllMessage() {
// 		console.log("Butun Message'ler alindi.")
// 		return this.chatService.findAllMessage();
// 	}

// 	// oneeeeeeeeeeeeeeee
// 	@Get(':/id(\\d+)')
// 	async findOneChannelId(@Param('id') id?: string) {
// 	}

// 	@Get(':name')
// 	async findOneChannelName(@Param('name') name: string) {
// 	}

// 	@Get(':message:id(\\d+)')
// 	findOneMessage(@Param('id') id: string) {
// 		return this.chatService.findOneMessage(+id);
// 	}

// 	// ---------- Update ---------
// 	@Patch(':message:id(\\d+)')
// 	updateChannel(@Param('id') id: string, @Body() updateChannelDto: UpdateChannelDto) {
// 		return this.chatService.updateChannel(+id, updateChannelDto);
// 	}

// 	@Patch(':message:id(\\d+)')
// 	updateMessage(@Param('id') id: string, @Body() updateMessageDto: UpdateMessageDto) {
// 		return this.chatService.updateMessage(+id, updateMessageDto);
// 	}

	// ---------- Delete ---------

	@Delete('@:channel')
	async removeChannel(@Param('channel') channel: string) {
		console.log(`DELETE: Channel: ${channel}`);
		if (channel === "all")
		{
			const	response = await this.chatService.removeAllChannel();
			console.log(`Butun Channel'ler 'silindi'!`);
			return (response);
		}
		const isId = /^\d+$/.test(channel); // Bakiyor bu girilen deger numara mi degil mi? numaraysa true donduruyor.
		if (isId === true)
		{
			console.log(`id ->>>>>>>>>>>`);
			const tmpUser = await this.chatService.removeChannel(+channel);
			if (!tmpUser)
				throw (new NotFoundException("@Delete('@:channel'): removeChannel(): id: Channel does not exist!"));
			return (tmpUser);
		}
		else
		{
			console.log(`nameeeeeeeee ----------->`);
			const tmpUser = await this.chatService.removeChannel(channel);
			console.log("donen deger", tmpUser);
			if (!tmpUser)
				throw (new NotFoundException("@Delete('@:channel'): removeChannel(): name: Channel does not exist!"));
			return (tmpUser);
		}
	}

	// @Delete(':messages')
	// removeAllMessage() {
	// 	return this.chatService.removeAllMessage();
	// }

	// @Delete(':channel:id(\\d+)')
	// async removeChannelId(@Param('id') id: string) {
	// 	const	tmpChannel = this.chatService.findChannel(+id);

	// 	return (this.chatService.removeChannel(+id));
	// }

	// @Delete(':channel:name(\\d+)')
	// async removeChannelName(@Param('name') name: string) {
	// 	// return this.chatService.removeAllChannel();
	// }

	// @Delete(':message:id(\\d+)')
	// removeMessage(@Param('id') id: string) {
	// 	return this.chatService.removeAllMessage();
	// }
}