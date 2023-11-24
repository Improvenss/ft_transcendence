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
	@Get(':channel')
	findAllChannel() {
		return this.chatService.findAllChannel();
	}

	@Get(':message')
	findAllMessage() {
		return this.chatService.findAllMessage();
	}

	// oneeeeeeeeeeeeeeee
	@Get(':channel:id(\\d+)')
	async findOneChannelId(@Param('id') id?: string) {
		const tmpUser = await this.chatService.findOneChannel(+id, undefined);
		if (!tmpUser)
			throw (new NotFoundException("@Get(':channel:id'): findOneChannelId(): Channel does not exist!"));
		return (tmpUser);
	}

	@Get(':channel:name')
	async findOneChannelName(@Param('name') name: string) {
		const tmpUser = await this.chatService.findOneChannel(undefined, name);
		if (!tmpUser)
			throw (new NotFoundException("@Get(':channel:name'): findOneChannelName(): Channel does not exist!"));
		return (tmpUser);
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
	removeChannel(@Param('id') id: string) {
		return this.chatService.removeAllChannel();
	}

	@Delete(':message:id(\\d+)')
	removeMessage(@Param('id') id: string) {
		return this.chatService.removeAllMessage();
	}
}