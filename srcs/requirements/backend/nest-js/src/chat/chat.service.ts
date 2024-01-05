import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateChannelDto, UpdateChannelDto } from './dto/chat-channel.dto';
import { CreateMessageDto, UpdateMessageDto } from './dto/chat-message.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Channel, Message } from './entities/chat.entity';
import { FindOptionsRelations, EntityManager, Repository } from 'typeorm';
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
		const	newChannel = new Channel(createChannelDto);
		if (newChannel === null)
			throw new Error('createChannel err: Required arguments are missing.');
		console.log(`New Channel created: #${newChannel.name}`);
		return (await this.entityManager.save(newChannel));
	}

	async createMessage(createMessageDto: CreateMessageDto) {
		const	newMessage = new Message(createMessageDto);
		if (newMessage === null)
			throw new Error('createMessage err: Required arguments are missing.');
		console.log(`New Message created: #${newMessage.content}`);
		return (await this.entityManager.save(newMessage));
	}
	
	parsedRelation(relation: string[] | string): FindOptionsRelations<Channel> {
		if (Array.isArray(relation)) {
			const parsedRelation: FindOptionsRelations<Channel> = {};
			relation.forEach(rel => {
				parsedRelation[rel] = true;
			});
			return parsedRelation;
		} else if (typeof relation === 'string') {
			const parsedRelation: FindOptionsRelations<Channel> = {};
			parsedRelation[relation] = true;
			return parsedRelation;
		} else {
			throw new Error('Invalid relation format');
		}
	}

	/* channel relationslarını döndürür, prefix var ise channels. şeklinde döndürür. */
	async getRelationNames(prefix: boolean = false): Promise<string[]> {
		const pre = prefix ? 'channels.' : '';
		const metadata = this.channelRepository.metadata;
		const relationNames = metadata.relations.map((relation) => (pre + relation.propertyName));
		if (prefix)
			relationNames.push('channels');
		return relationNames;
	}

	/* channel'ın relationlardan bağımsız verilerini döndürür. Channel yoksa null döner */
	async getChannelPrimary(channelName: string){
		return (await this.channelRepository.findOne({where: {name: channelName}}));
	}

	/* channel'ın default ve relation verilerini döndürür, 
		channel name + relation(full) + primary(false) -> relation
		channel name + relation(full) + primary(true) -> default + relation
		channel name + relation(empty) + primary(false) -> relation all 
		channel name + relation(empty) + primary(true) -> default + relation all 
	*/
	async getChannelRelation({channelName, relation, primary}: {
		channelName: string,
		relation: FindOptionsRelations<Channel>,
		primary: boolean,
	}){
		if (!relation){
			const allChannelRelation = await this.getRelationNames(false);
			relation = allChannelRelation.reduce((acc, rel) => {
				acc[rel] = true;
				return acc;
			}, {} as FindOptionsRelations<Channel>);
		}

		const data = await this.channelRepository.findOne({where: {name: channelName}, relations: relation});
		if (!data)
			return (null);

		if (primary === true){ // default + relation
			return (data);
		}

		const result: Partial<Channel> = {};
		// Sadece ilişkileri döndür
		Object.keys(relation).forEach((rel) => {
			result[rel] = data[rel];
		});

		return result as Channel;
	}

	/* Kullanıcının kayıt olduğu tüm channelları döndürür(relationlarla) + public channeları döndürür */
	async getChannels(
		userLogin: string,
	) {
		// const relations = await this.getRelationNames(true);//?????????????????????????????????
		// const { channels: involvedChannels } = await this.usersService.getData({ userLogin: userLogin }, relations);
		// const { channels: involvedChannels } = await this.usersService.getUserRelation({
		// 	user: { login: userLogin },
		// 	relation: { channels: true }, //detayda döndürmemiz gerek sadece channels yetmiyor.
		// 	primary: false,
		// })
		const { channels: involvedChannels } = await this.usersService.getUserRelationDetails({
			login: userLogin,
			relation: 'channels',
		});
		console.log("---->", involvedChannels);
		if (!involvedChannels){
			throw new Error('User not found!');
		}
		const publicChannels = await this.channelRepository.find({ where: { type: 'public' } });
	  
		const involvedChannelIds = new Set(involvedChannels.map(channel => channel.id));
		const uniquePublicChannels = publicChannels.filter(publicChannel => !involvedChannelIds.has(publicChannel.id));
	  
		const mergedChannels = [
		  ...uniquePublicChannels.map(publicChannel => ({
				...publicChannel, status: involvedChannelIds.has(publicChannel.id) ? 'involved' : 'public'//'not-involved'
			})),
		  ...involvedChannels.map(involvedChannel => ({
				...involvedChannel, status: 'involved'
			})),
		];
	  
		const mergedChannelsWithoutPassword = mergedChannels.map(({ password, ...rest }) => rest);
		return mergedChannelsWithoutPassword;
	}

	async findChannel(
		channel: string | undefined,
		relations?: string[] | 'all' | null
	){
		// console.log(`ChatService: findChannel(): relations(${typeof(relations)}): [${relations}]`);
		const relationObject = (relations === 'all')
			? {members: true, admins: true, messages: true, bannedUsers: true} // relations all ise hepsini ata.
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

	async findChannelUser(
		channel: Channel,
		relation: 'members' | 'bannedUsers',
		user: User
	){
		if (!channel || !user)
			throw (new NotFoundException(`chat.service.ts: findChannelUser: channel: ${channel.name} || user: ${user.login} not found!`));
		if (relation === 'members' || relation === 'bannedUsers') {
			return (channel[relation].some((channelUser) => channelUser.login === user.login));
		}
		return (false)
	}

	// async checkInvolvedUser(channels: Channel | Channel[], user: User) {
	// 	const channelArray = Array.isArray(channels) ? channels : [channels];
	
	// 	const involvedChannelsInfo = channelArray.map((channel) => {
	// 		if (channel.members.some((channelUser) => channelUser.login === user.login)) {
	// 			return {
	// 				status: 'involved',
	// 				name: channel.name,
	// 				type: channel.type,
	// 				description: channel.description,
	// 				image: channel.image || 'default_image_url',
	// 				members: channel.members || null,
	// 				admins: channel.admins || null,
	// 				messages: channel.messages ? channel.messages.map((message) => ({
	// 					id: message.id,
	// 					sender: message.author,
	// 					content: message.content,
	// 					timestamp: message.sentAt,
	// 				})) : null,
	// 				bannedUsers: channel.bannedUsers
	// 			};
	// 		} else if (channel.type === 'public') {
	// 			return {
	// 				status: 'public',
	// 				name: channel.name,
	// 				type: channel.type,
	// 				image: channel.image || 'default_image_url',
	// 			};
	// 		}
	// 		return null;
	// 	}).filter(Boolean); // Filter out null values
	
	// 	return involvedChannelsInfo;
	// }
	
	async addChannelUser(
		channel: Channel,
		user: User,
		relation: 'members' | 'bannedUsers',
	){
		if (!relation)
			throw (new Error(`Which relation do you add this user?`));
		if (await this.findChannelUser(channel, relation, user))
			throw (new Error(`${user.login} already in this ${channel.name}.`));
		if (relation === 'members')
			channel.members.push(user);
		else if (relation === 'bannedUsers')
			channel.bannedUsers.push(user);
		else
			throw (new Error(`There is no relation for add this user?`));
		return (this.entityManager.save(channel));
	}

	async updateMessage(id: number, updateMessageDto: UpdateMessageDto) {
	}

	/**
	 * PATCH genellikle guncellemek icin kullanilir.
	 */
	async	patchChannel(
		channel: string | undefined,
		body: Partial<UpdateChannelDto>,
		// body: {
		// 	name: string,
		// 	description: string,
		// 	password: string,
		// }
	){
		const	tmpChannels = await this.findChannel(channel, 'all');
		if (!tmpChannels)
			return (`Channel'${channel}' not found.`);
		if (!Array.isArray(tmpChannels))
		{ // Channel seklinde gelirse alttaki for()'un kafasi karismasin diye.
			Object.assign(tmpChannels, body);
			return (await this.channelRepository.save(tmpChannels));
		}
		for (const channel of tmpChannels)
		{ // Channel[] seklinde gelirse hepsini tek tek guncellemek icin.
			Object.assign(channel, body);
			await this.channelRepository.save(channel);
		}
		return (tmpChannels);
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
		const deletedChannel = await this.channelRepository.remove(tmpChannel as Channel);
		return deletedChannel;
	}

	async removeUser(
		channel: string,
		relation: 'members' | 'bannedUsers',
		user: string
	){
		const tmpChannel = await this.channelRepository.findOne({ where: { name: channel }, relations: [relation]});
		if (!tmpChannel){
			throw new NotFoundException('Channel does not exist!');
		}
		// const tmpUser = await this.usersService.getData({userLogin: user}, 'channels', 'true');
		const tmpUser = await this.usersService.getUserRelation({
			user: { login: user },
			relation: { channels: true },
			primary: true,
		})
		if (!tmpUser){
			throw new NotFoundException('User does not exist!');
		}
		tmpUser.channels = tmpUser.channels.filter(c => c.id !== tmpChannel.id);

		if (relation === 'members')
			tmpChannel.members = tmpChannel.members.filter(m => m.id !== tmpUser.id);
		else if (relation === 'bannedUsers')
			tmpChannel.bannedUsers = tmpChannel.bannedUsers.filter(m => m.id !== tmpUser.id);
		else
			throw (new NotFoundException('Relation not found!'));

		await this.userRepository.save(tmpUser);
		await this.channelRepository.save(tmpChannel);
		return ({message: 'User removed from the channel successfully' });
	}

	async removeMessage() {
		return (await this.messageRepository.delete({}));
	}

	async setPermission(
		channel: Channel,
		user: User,
		action: 'remove' | 'set',
	){
		if (action === 'remove')
		{
			const index = channel.admins.findIndex(admin => admin.login === user.login);
			if (index === -1) {
				throw new Error(`user[${user.login}] does not have permission anyway!`);
			} else {
				channel.admins.splice(index, 1);
				await this.channelRepository.save(channel);
			}
		}
		else if (action === 'set')
		{
			if (channel.admins.some(admin => admin.login === user.login)) {
				throw new Error(`user[${user.login}] already has permission!`);
			} else {
				channel.admins.push(user);
				await this.channelRepository.save(channel);
			}
		}
		return ({admins: channel.admins});
	}
}
