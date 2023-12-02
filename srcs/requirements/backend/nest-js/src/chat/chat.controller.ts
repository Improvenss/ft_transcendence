import { Controller, Get, Post, Body, Patch, Param, Delete, NotFoundException, Query, HttpException, HttpStatus, UseGuards, Head } from '@nestjs/common';
import { ChatService } from './chat.service';
import { CreateChannelDto, UpdateChannelDto} from './dto/chat-channel.dto';
import { CreateMessageDto, UpdateMessageDto } from './dto/chat-message.dto';
import { UsersService } from 'src/users/users.service';

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

	@Post('@:channel')
	async findChannelFirst(
		@Param('channel') channel: string,
		@Body() relationData: {userCookie: string, socketID: string}, // -> Bu da fetch istegi atarken body kismina yazdigimiz bilgiler.
		@Query('relations') relations: string[] | null | 'all', // -> {{baseUrl}}:3000/chat/@all?relations=users&relations=admins.
	) {
		if (!relationData)
			return (new Error("@Post('@:channel/:relation'): findChannelFirst(): @Body(): Cookie not found!"));
		const jwt = require('jsonwebtoken');
		const decoded = jwt.verify(relationData.userCookie, 'your_secret_key');
		const tmpUser = await this.usersService.findOne(null, decoded.login as string);
		if (!tmpUser)
			throw (new HttpException("@Post(':channel/:relation'): (Cookie): @findOne(): login: User does not exist!",
				HttpStatus.INTERNAL_SERVER_ERROR));
		// -----------------------

		if (channel === 'all')
		{
			console.log("Butun Channel'ler alindi.", relations)
			const allChannels = await this.chatService.findChannel(null, relations);
			// console.log(allChannels);
			// return (allChannels)
			const invData = await this.chatService.checkInvolvedUser(allChannels, tmpUser);
			console.log(invData);
			return (invData);
		}
		const isId = /^\d+$/.test(channel); // Bakiyor bu girilen deger numara mi degil mi? numaraysa true donduruyor.
		if (isId === true)
		{
			const tmpUser = await this.chatService.findChannel(+channel, relations);
			if (!tmpUser)
				throw (new NotFoundException("@Post('@:channel'): findChannel(): id: Channel does not exist!"));
			return (tmpUser);
		}
		else
		{
			const tmpUser = await this.chatService.findChannel(channel, relations);
			if (!tmpUser)
				throw (new NotFoundException("@Post('@:channel'): findChannel(): name: Channel does not exist!"));
			return (tmpUser);
		}
	}

	@Post(':message')
	createMessage(@Body() createMessageDto: CreateMessageDto) {
		return this.chatService.createMessage(createMessageDto);
	}

	// ---------- Get ------------
	@Get('@:channel') // -> {{baseUrl}}/chat/@all/?relations=all
	async findChannel(
		@Param('channel') channel: string,
		// @Param('relations') relations: string[],
		// @Body() relationData: string[], -> Bu da fetch istegi atarken body kismina yazdigimiz bilgiler.
		@Query('relations') relations: string[] | null | 'all', // -> {{baseUrl}}:3000/chat/@all?relations=users&relations=admins.
	) {
		console.log(`GET: Channel: [${channel}], Relation: [${relations}]`);
		if (channel === 'all')
			return (await this.chatService.findChannel(null, relations));

		const isId = /^\d+$/.test(channel); // Bakiyor bu girilen deger numara mi degil mi? numaraysa true donduruyor.
		if (isId === true)
		{
			const tmpUser = await this.chatService.findChannel(+channel, relations);
			if (!tmpUser)
				throw (new NotFoundException("@Get('@:channel'): findChannel(): id: Channel does not exist!"));
			return (tmpUser);
		}
		else
		{
			const tmpUser = await this.chatService.findChannel(channel, relations);
			if (!tmpUser)
				throw (new NotFoundException("@Get('@:channel'): findChannel(): name: Channel does not exist!"));
			return (tmpUser);
		}
	}
// Burada kaldin
	@Get('messages/all')
	findAllMessage() {
		console.log("Butun Message'ler alindi.")
		return this.chatService.findAllMessage();
	}

	// oneeeeeeeeeeeeeeee
	@Get(':/id(\\d+)')
	async findOneChannelId(@Param('id') id?: string) {
	}

	@Get(':name')
	async findOneChannelName(@Param('name') name: string) {
	}

	@Get(':message:id(\\d+)')
	findOneMessage(@Param('id') id: string) {
		return this.chatService.findOneMessage(+id);
	}

	// ---------- Update ---------
	@Patch(':message:id(\\d+)')
	updateChannel(@Param('id') id: string, @Body() updateChannelDto: UpdateChannelDto) {
		return this.chatService.updateChannel(+id, updateChannelDto);
	}

	@Patch(':message:id(\\d+)')
	updateMessage(@Param('id') id: string, @Body() updateMessageDto: UpdateMessageDto) {
		return this.chatService.updateMessage(+id, updateMessageDto);
	}

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

	@Delete(':messages')
	removeAllMessage() {
		return this.chatService.removeAllMessage();
	}

	@Delete(':channel:id(\\d+)')
	async removeChannelId(@Param('id') id: string) {
		const	tmpChannel = this.chatService.findChannel(+id);

		return (this.chatService.removeChannel(+id));
	}

	@Delete(':channel:name(\\d+)')
	async removeChannelName(@Param('name') name: string) {
		// return this.chatService.removeAllChannel();
	}

	@Delete(':message:id(\\d+)')
	removeMessage(@Param('id') id: string) {
		return this.chatService.removeAllMessage();
	}
}