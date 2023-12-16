import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateChannelDto, UpdateChannelDto } from './dto/chat-channel.dto';
import { CreateMessageDto, UpdateMessageDto } from './dto/chat-message.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Channel, Message } from './entities/chat.entity';
import { EntityManager, Repository } from 'typeorm';
import { User } from 'src/users/entities/user.entity';
import { UsersService } from 'src/users/users.service';

@Injectable()
export class ChatService {
	constructor(
		@InjectRepository(Channel)
		private readonly	channelRepository: Repository<Channel>,
		@InjectRepository(Message)
		private readonly	messageRepository: Repository<Message>,
		@InjectRepository(User)
		private readonly	userRepository: Repository<User>,
		private readonly	usersService: UsersService,
		private readonly	entityManager: EntityManager,
	) {}

	async createChannel(createChannelDto: CreateChannelDto) {
		console.log("createChannel", createChannelDto);
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
		// console.log(`ChatService: findChannel(): relations(${typeof(relations)}): [${relations}]`);
		const relationObject = (relations === 'all')
			? {members: true, admins: true, messages: true} // relations all ise hepsini ata.
			: (Array.isArray(relations) // eger relations[] yani array ise hangi array'ler tanimlanmis onu ata.
				? relations.reduce((obj, relation) => ({ ...obj, [relation]: true }), {}) // burada atama gerceklesiyor.
				: (typeof(relations) === 'string' // relations array degilse sadece 1 tane string ise,
					? { [relations]: true } // sadece bunu ata.
					: null)); // hicbiri degilse null ata.
		// console.log(`ChatService: findChannel(): relationsObject(${typeof(relationObject)}):`, relationObject);
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

	async findChannelUser(channel: Channel, user: User) {
		if (!channel || !user)
			throw (new NotFoundException(`chat.service.ts: findChannelUser: channel: ${channel.name} || user: ${user.login} not found!`));
		const foundUser = channel.members.find((channelUser) => channelUser.login === user.login);
		if (!foundUser)
			return (false);
		return (true);
	}

	async checkInvolvedUser(channels: Channel | Channel[], user: User) {
		const channelArray = Array.isArray(channels) ? channels : [channels];
	
		const involvedChannelsInfo = channelArray.map((channel) => {
			if (channel.members.some((channelUser) => channelUser.login === user.login)) {
				return {
					status: 'involved',
					name: channel.name,
					type: channel.type,
					description: channel.description,
					image: channel.image || 'default_image_url',
					members: channel.members || null,
					admins: channel.admins || null,
					messages: channel.messages ? channel.messages.map((message) => ({
						id: message.id,
						sender: message.author,
						content: message.message,
						timestamp: message.sentAt,
					})) : null,
				};
			} else if (channel.type === 'public') {
				return {
					status: 'public',
					name: channel.name,
					type: channel.type,
					image: channel.image || 'default_image_url',
				};
			}
			return null;
		}).filter(Boolean); // Filter out null values
	
		return involvedChannelsInfo;
	}
	
	async updateChannel(channel: Channel | Channel[] | any, user: User) {
		if (await this.findChannelUser(channel, user))
			throw (new Error(`${user.login} already in this ${channel.name}.`));
		channel.members.push(user);
		return (this.entityManager.save(channel));
	}

	async updateMessage(id: number, updateMessageDto: UpdateMessageDto) {
	}

	async removeAllChannel() {
		return (await this.channelRepository.delete({}));
	}

	async removeChannel(
		channel: string | undefined,
	){
		const tmpChannel = await this.channelRepository.findOne({ where: { name: channel } });
		if (!tmpChannel) {
			throw new NotFoundException('Channel does not exist!');
		}

		// Kanala ait mesajları sil veya ilişkilendirmeyi kes
		// NOT: Biz Channel'i silmek istedigimizde iliskili olan Message[] tablosunun {onDelete: 'CASCADE'} kodunu ekledigimizde burada elimizle silmemize gerek kalmiyor.
		// await this.messageRepository.delete({ channel: { id: tmpChannel.id } });
		
		// Kanalı sil
		const deletedChannel = await this.channelRepository.remove(tmpChannel);
		return deletedChannel;

		// console.log("chat.service.ts: removeChannel(): Channel:", channel);
		// const tmpChannel = (channel === undefined)
		// 	? await this.channelRepository.delete({})
		// 	: await this.channelRepository.findOne({
		// 			where: { name: channel },
		// 		});
		// if (!tmpChannel)
		// 	return (null);
		// await this.channelRepository.remove(tmpChannel as Channel);
		// return (tmpChannel);
		// not: await this.channelRepository.delete({ name: channel }); bunu yaptigimizda channel'in sadece name'sini siliyor.
	}

	async removeUser(
		channel: string,
		user: string
	){
		const tmpChannel = await this.channelRepository.findOne({ where: { name: channel }, relations: ['members']});
		if (!tmpChannel){
			throw new NotFoundException('Channel does not exist!');
		}
		const tmpUser = await this.usersService.findUser(user, null, ['channels']);
		if (!tmpUser)
			throw new NotFoundException('User does not exist!');
		const singleUser= Array.isArray(tmpUser) ? tmpUser[0] : tmpUser;
		if (!singleUser.channels || !tmpChannel.members)
			throw new Error('Invalid state: User or Channel data is incomplete');
		// Kullanıcının channels ilişkisinden kanalı çıkarın
		singleUser.channels = singleUser.channels.filter(c => c.id !== tmpChannel.id);
		// Kanalın members ilişkisinden kullanıcıyı çıkarın
		tmpChannel.members = tmpChannel.members.filter(m => m.id !== singleUser.id);
		await this.userRepository.save(singleUser);
		await this.channelRepository.save(tmpChannel);
		return ({message: 'User removed from the channel successfully' });
	}

	async removeMessage() {
		return (await this.messageRepository.delete({}));
	}
}
