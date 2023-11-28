import { Controller, Get, Post, Body, Patch, Param, Delete, NotFoundException } from '@nestjs/common';
import { ChatService } from './chat.service';
import { CreateChannelDto, UpdateChannelDto} from './dto/chat-channel.dto';
import { CreateMessageDto, UpdateMessageDto } from './dto/chat-message.dto';

@Controller('/chat')
export class ChatController {
	constructor(private readonly chatService: ChatService) {}

	// ---------- Create ---------
	@Post(':channel')
	async createChannel(@Body() createChannelDto: CreateChannelDto) {
		return await this.chatService.createChannel(createChannelDto);
	}

	@Post(':message')
	createMessage(@Body() createMessageDto: CreateMessageDto) {
		return this.chatService.createMessage(createMessageDto);
	}

	// ---------- Get ------------
	@Get('@:channel')
	async findChannel(@Param('channel') channel: string) {
		console.log(`GET: Channel: ${channel}`);
		if (channel === 'all')
		{
			console.log("Butun Channel'ler alindi.")
			return this.chatService.findChannel();
		}
		const isId = /^\d+$/.test(channel); // Bakiyor bu girilen deger numara mi degil mi? numaraysa true donduruyor.
		if (isId === true)
		{
			const tmpUser = await this.chatService.findChannel(+channel);
			if (!tmpUser)
				throw (new NotFoundException("@Get('@:channel'): findChannel(): id: Channel does not exist!"));
			return (tmpUser);
		}
		else
		{
			const tmpUser = await this.chatService.findChannel(channel);
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
			console.log(`Butun Channel'ler 'silindi'!`);
			return (await this.chatService.removeAllChannel());
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