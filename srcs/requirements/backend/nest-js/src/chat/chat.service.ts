import { Injectable, NotFoundException } from '@nestjs/common';
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

	// async findAllChannel() {
	// 	return (await this.channelRepository.find());
	// }

	async findAllMessage() {
		return (await this.messageRepository.find());
	}

	async findChannel(
		channel: number | string | null = null,
		relations: any | null = null)
	{
		// if (!channel)
		// 	throw (new Error(`chat: service: findOneChannel(): Must be enter ID or login!`));
		try {
			if (channel === null)
				return (await this.channelRepository.find());
			else if (typeof(channel) === 'number')
				return (await this.channelRepository.findOne({
					where: {id: channel}, // Burada 'id:' key'inin value'sini parametre olarak aldigimiz channel'in degerini atiyoruz.
					relations: relations,
				}));
			else if (typeof(channel) === 'string')
				return await this.channelRepository.findOne({
					where: {name: channel}, // Burada 'name:' key'inin value'sini parametre olarak aldigimiz channel'in degerini atiyoruz.
					relations: relations,
				});
			else
				return null;
		} catch (error) {
			throw new Error(
				`chat.service.ts: findOneChannel(): ${error.message || 'Channel not found!'}`
			);
		}
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

	async removeChannel(channel: number | string) {
		try {
			const tmpChannel: Channel | Channel[] = await this.findChannel(channel, ['messages']);
			if (!tmpChannel) {
				throw new NotFoundException(
					'chat.service.ts: removeChannel(): Channel not found!'
				);
			}

			if (Array.isArray(tmpChannel))
				for (const channelItem of tmpChannel)
					await this.entityManager.remove(channelItem.messages);
			else
				await this.entityManager.remove(tmpChannel.messages);

			if (typeof channel === 'number') {
				return await this.channelRepository.delete({ id: channel });
			} else if (typeof channel === 'string') {
				return await this.channelRepository.delete({ name: channel });
			}
			throw new Error(
				'chat.service.ts: removeChannel(): Invalid type for channel parameter!'
			);
		} catch (error) {
			throw new Error(
				`chat.service.ts: removeChannel(): ${error.message || 'Error during deletion!'}`
		);
		}
	}

	async removeAllMessage() {
		return (await this.messageRepository.delete({}));
	}
}

	// async removeChannel(id: number | null = null, name: string | null = null) {
	// 	if (!id && !name)
	// 		throw (new Error(`chat: service: removeChannel(): Must be enter ID or login!`));
	// 	try {
	// 		if (id !== null)
	// 		{
	// 			const tmpChannel = await this.findOneChannel(id, null);
	// 			if (tmpChannel)
	// 				return (await this.channelRepository.delete({id: id}));
	// 			return (null);
	// 		}
	// 		else if (name !== null)
	// 		{
	// 			const tmpChannel = await this.findOneChannel(null, name);
	// 			if (tmpChannel)
	// 				return (await this.channelRepository.delete({name: name }));
	// 			return (null);
	// 		}
	// 		else
	// 			return (null);
	// 	} catch (error) {
	// 		return (new Error(error + "chat.service.ts: removeChannel(): Channel not found!"));
	// 	}
	// }


