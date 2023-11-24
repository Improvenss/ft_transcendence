import { Injectable } from '@nestjs/common';
import { CreateChannelDto, UpdateChannelDto } from './dto/chat-channel.dto';
import { CreateMessageDto, UpdateMessageDto } from './dto/chat-message.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Channel, Message } from './entities/chat.entity';
import { EntityManager, Repository } from 'typeorm';

@Injectable()
export class ChatService {
	constructor(
		@InjectRepository(Channel)
		private readonly	channelRepository: Repository<Channel>,
		@InjectRepository(Message)
		private readonly	messageRepository: Repository<Message>,
		private readonly	entityManager: EntityManager,
	) {}

	async createChannel(createChannelDto: CreateChannelDto) {
		const	newChannel = new Channel(createChannelDto);
		// const newChannel = new Channel({ ...createChannelDto, adminId: createChannelDto.adminId as number[] });
		await this.entityManager.save(newChannel);
		return (`New Channel created: #${newChannel.name}:[${newChannel.id}]`);
	}

	async createMessage(createMessageDto: CreateMessageDto) {
		const	newMessage = new Message(createMessageDto);
		await this.entityManager.save(newMessage);
		return (`New Message created: id:[${newMessage.id}]`);
	}

	async findAllChannel() {
		return (await this.channelRepository.find());
	}

	async findAllMessage() {
		return (await this.messageRepository.find());
	}

	async findOneChannel(id?: number, name?: string) {
		if (!id && !name || name === undefined)
			throw (new Error(`chat: service: Must be enter ID or login!`));
		const response = await this.channelRepository.findOne(
			{where: {id: id, name: name}}
		)
		return (await this.channelRepository.findOne(
			{where: {id: id, name: name}}
		));
	}

	async findOneMessage(id: number) {
		return (`Eklenecek`)
	}

	async updateChannel(id: number, updateChannelDto: UpdateChannelDto) {

	}

	async updateMessage(id: number, updateMessageDto: UpdateMessageDto) {
	}

	async removeAllChannel() {
		return (await this.channelRepository.delete({}));
	}

	async removeAllMessage() {
		return (await this.messageRepository.delete({}));
	}
}
