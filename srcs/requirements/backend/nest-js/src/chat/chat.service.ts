import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateChannelDto, UpdateChannelDto } from './dto/chat-channel.dto';
import { CreateMessageDto, UpdateMessageDto } from './dto/chat-message.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Channel, Message } from './entities/chat.entity';
import { EntityManager, Repository } from 'typeorm';
import { User } from 'src/users/entities/user.entity';

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
		await this.entityManager.save(newChannel);
		return (`New Channel created: #${newChannel.name}:[${newChannel.id}]`);
	}

	async createMessage(createMessageDto: CreateMessageDto) {
		const	newMessage = new Message(createMessageDto);
		await this.entityManager.save(newMessage);
		return (`New Message created: id:[${newMessage.id}]`);
	}

	async findAllMessage() {
		return (await this.messageRepository.find());
	}

	async findChannel(
		channel: number | string | undefined,
		relations: string[] | 'all' | null = null)
	{
		try
		{
			console.log(`Service Chat: findChannel(): relations(${typeof(relations)}): [${relations}]`);
			const relationObject = relations === 'all'
				? {users: true, admins: true, messages: true} // relations all ise hepsini ata.
				: (Array.isArray(relations) // eger relations[] yani array ise hangi array'ler tanimlanmis onu ata.
					? relations.reduce((obj, relation) => ({ ...obj, [relation]: true }), {}) // burada atama gerceklesiyor.
					: (typeof(relations) === 'string' // relations array degilse sadece 1 tane string ise,
						? { [relations]: true } // sadece bunu ata.
						: null)); // hicbiri degilse null ata.
			console.log(`Service Chat: findChannel(): relationsObject(${typeof(relationObject)}):`, relationObject);
			if (channel === undefined)
				return (await this.channelRepository.find({
					relations: relationObject
				}));
			const whereCondition = typeof(channel) === 'number'
				? {id: +channel} : {name: channel};
			return (await this.channelRepository.findOne({
				where: whereCondition,
				relations: relationObject
			}));
		}
		catch (error)
		{
			throw new Error(
				`chat.service.ts: findOneChannel(): ${error.message || 'Channel not found!'}`
			);
		}
	}

	async checkInvolvedUser(channels: Channel | Channel[], user: User) {
		const channelArray = Array.isArray(channels) ? channels : [channels];
	
		const involvedChannelsInfo = channelArray.map((channel) => {
			if (channel.users.some((channelUser) => channelUser.login === user.login)) {
				// User is involved in this channel
				return {
					status: 'involved',
					name: channel.name,
					type: 'involved',
					image: channel.image || 'default_image_url',
				};
			} else if (channel.type === 'public') {
				// Public channel with no user involvement
				return {
					status: 'public',
					name: channel.name,
					type: 'public',
					image: channel.image || 'default_image_url',
				};
			}
			return null;
		}).filter(Boolean); // Filter out null values
	
		return involvedChannelsInfo;
	}
	
	

	async findOneMessage(id: number) {
		return (`Eklenecek`)
	}

	async updateChannel(channel: number | string | null, updateChannelDto: UpdateChannelDto) {
		// const tmpChannel = await this.channelRepository.findOne(channel, { relations: ['users'] });
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


