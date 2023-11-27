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
		console.log(`Channel: ${channel}`);
		if (channel === 'all')
		{
			console.log("Butun Channel'ler alindi.")
			return this.chatService.findAllChannel();
		}
		const isId = /^\d+$/.test(channel); // Bakiyor bu girilen deger numara mi degil mi? numaraysa true donduruyor.
		if (isId === true)
		{
			const tmpUser = await this.chatService.findOneChannel(+channel, undefined);
			if (!tmpUser)
				throw (new NotFoundException("@Get('@:channel'): findChannel(): Channel does not exist!"));
			return (tmpUser);
		}
		else
		{
			const tmpUser = await this.chatService.findOneChannel(undefined, channel);
			if (!tmpUser)
				throw (new NotFoundException("@Get('@:channel'): findChannel(): Channel does not exist!"));
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

	@Delete(':channel')
	removeAllChannel() {
		return this.chatService.removeAllChannel();
	}

	@Delete(':messages')
	removeAllMessage() {
		return this.chatService.removeAllMessage();
	}

	@Delete(':channel:id(\\d+)')
	async removeChannelId(@Param('id') id: string) {
		const	tmpChannel = this.chatService.findOneChannel(+id, undefined);

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