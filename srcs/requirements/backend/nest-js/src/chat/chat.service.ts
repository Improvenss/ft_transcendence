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

	async findChannel(
		channel: string | undefined,
		relations?: string[] | 'all' | null
	){
		// console.log(`Service Chat: findChannel(): relations(${typeof(relations)}): [${relations}]`);
		const relationObject = (relations === 'all')
			? {members: true, admins: true, messages: true} // relations all ise hepsini ata.
			: (Array.isArray(relations) // eger relations[] yani array ise hangi array'ler tanimlanmis onu ata.
				? relations.reduce((obj, relation) => ({ ...obj, [relation]: true }), {}) // burada atama gerceklesiyor.
				: (typeof(relations) === 'string' // relations array degilse sadece 1 tane string ise,
					? { [relations]: true } // sadece bunu ata.
					: null)); // hicbiri degilse null ata.
		// console.log(`Service Chat: findChannel(): relationsObject(${typeof(relationObject)}):`, relationObject);
		const tmpChannel = (channel === undefined)
			? await this.channelRepository.find({relations: relationObject})
			: await this.channelRepository.findOne({
					where: {name: channel},
					relations: relationObject
				});
		if (!tmpChannel)
			throw (new NotFoundException("chat.service.ts: findChannel(): Channel not found!"));
		return (tmpChannel);
	}

	async findMessage(
		message: string | undefined,
		relations?: string[] | 'all' | null
	){
		console.log(`Service Chat: findMessage() 📩 : relations(${typeof(relations)}): [${relations}]`);
		const relationObject = (relations === 'all')
			? {author: true, channel: true} // relations all ise hepsini ata.
			: (Array.isArray(relations) // eger relations[] yani array ise hangi array'ler tanimlanmis onu ata.
				? relations.reduce((obj, relation) => ({ ...obj, [relation]: true }), {}) // burada atama gerceklesiyor.
				: (typeof(relations) === 'string' // relations array degilse sadece 1 tane string ise,
					? { [relations]: true } // sadece bunu ata.
					: null)); // hicbiri degilse null ata.
		console.log(`Service Chat: findChannel() 📩 : relationsObject(${typeof(relationObject)}):`, relationObject);
		const tmpMessage = (message === undefined)
			? await this.messageRepository.find({relations: relationObject})
			: await this.messageRepository.findOne({
					where: {message: message},
					relations: relationObject
				});
		if (!tmpMessage)
			throw (new NotFoundException("chat.service.ts: findMessage(): Message not found!"));
		return (tmpMessage);
	}

	async checkInvolvedUser(channels: Channel | Channel[], user: User) {
		const channelArray = Array.isArray(channels) ? channels : [channels];
	
		const involvedChannelsInfo = channelArray.map((channel) => {
			if (channel.members.some((channelUser) => channelUser.login === user.login)) {
				// User is involved in this channel
				return {
					status: 'involved',
					name: channel.name,
					type: channel.type,
					description: channel.description,
					image: channel.image || 'default_image_url',
					members: channel.members,
					admins: channel.admins,
					// messages: channel.messages
					messages: channel.messages.map((message) => ({
						id: message.id,
						sender: message.author,
						content: message.message,
						timestamp: message.sentAt,
					})),
				};
			} else if (channel.type === 'public') {
				// Public channel with no user involvement
				return {
					status: 'public',
					name: channel.name,
					type: channel.type,
					description: channel.description,
					image: channel.image || 'default_image_url',
					members: channel.members,
					admins: channel.admins,
					messages: channel.messages.map((message) => ({
						id: message.id,
						sender: message.author,
						content: message.message,
						timestamp: message.sentAt,
					})),
				};
			}
			return null;
		}).filter(Boolean); // Filter out null values
	
		return involvedChannelsInfo;
	}
	
	async updateChannel(channel: number | string | null, updateChannelDto: UpdateChannelDto) {
		// const tmpChannel = await this.channelRepository.findOne(channel, { relations: ['users'] });
	}

	async updateMessage(id: number, updateMessageDto: UpdateMessageDto) {
	}

	async removeAllChannel() {
		return (await this.channelRepository.delete({}));
	}

	async removeChannel(
		channel: string | undefined,
	){
		console.log("chat.service.ts: removeChannel(): Channel:", channel);
		const tmpChannel = (channel === undefined)
			? await this.channelRepository.delete({})
			: await this.channelRepository.findOne({
					where: { name: channel },
				});
		if (!tmpChannel)
			return (null);
		await this.channelRepository.remove(tmpChannel as Channel);
		return (tmpChannel);
		// not: await this.channelRepository.delete({ name: channel }); bunu yaptigimizda channel'in sadece name'sini siliyor.
	}

	async removeMessage() {
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


