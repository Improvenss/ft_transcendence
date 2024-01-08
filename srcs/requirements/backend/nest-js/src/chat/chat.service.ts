import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateChannelDto, UpdateChannelDto } from './dto/chat-channel.dto';
import { CreateMessageDto, UpdateMessageDto } from './dto/chat-message.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Channel, ChannelType, Message } from './entities/chat.entity';
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

	async parseType(value: string){
		const channelType: ChannelType = ChannelType[value.toUpperCase() as keyof typeof ChannelType];
		if (!channelType) {
			throw new BadRequestException('Invalid channel type');
		}
		return (channelType);
	}

	async createChannel(createChannelDto: CreateChannelDto) {
		const	newChannel = new Channel(createChannelDto);
		console.log(`New Channel created: #${newChannel.name}`);
		return (await this.channelRepository.save(newChannel));
	}

	async createMessage(createMessageDto: CreateMessageDto) {
		const	newMessage = new Message(createMessageDto);
		console.log(`New Message created: #${newMessage.content}`);
		return (await this.messageRepository.save(newMessage));
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
	async getChannelPrimary({id, name}:{id?: number, name?: string}){
		const inputSize = [id, name].filter(Boolean).length;
		if (inputSize !== 1){
			throw new Error('Provide exactly one of id or name.');
		}

		const whereClause: Record<string, any> = {
			id: id,
			name: name,
		};
		
		return (await this.channelRepository.findOne({where: whereClause}));
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
		if (Object.keys(relation).length === 0){
			const allChannelRelation = await this.getRelationNames();
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
		userId: number,
	) {
		const involvedChannels = await this.usersService.getUserChannelRelationDetails( userId, await this.getRelationNames(true) );
		if (!involvedChannels){
			throw new Error('User not found!');
		}
		// console.log("involved:",involvedChannels);
		const publicChannels = await this.channelRepository.find({where: {type: ChannelType.PUBLIC }});
		// console.log("public:", publicChannels);

		for (const involvedChannel of involvedChannels) {
			// Aynı ID'ye sahip "public" türündeki kanalı bul
			const matchingPublicChannelIndex = publicChannels.findIndex(publicChannel => publicChannel.id === involvedChannel.id);
		
			if (matchingPublicChannelIndex !== -1) {
				publicChannels.splice(matchingPublicChannelIndex, 1);
				// console.log(`Kanal siliniyor: ${involvedChannel.id}`);
			}
			involvedChannel['status'] = 'involved';
			delete involvedChannel.password;
		}

		for (const publicChannel of publicChannels) {
			publicChannel['status'] = 'public';
			// console.log(`Kanal güncelleniyor: ${publicChannel.id}`);
		}

		// console.log("involved:",involvedChannels);
		// console.log("public:", publicChannels);
		const mergedChannels = [...involvedChannels, ...publicChannels];
		return (mergedChannels);


		// const involvedChannels = await this.usersService.getUserChannelRelationDetails(userLogin, await this.getRelationNames());
		// if (!involvedChannels){
		// 	throw new Error('User not found!');
		// }
		// const publicChannels = await this.channelRepository.find({ where: { type: 'public' } });
	  
		// const involvedChannelIds = new Set(involvedChannels.map(channel => channel.id));
		// const uniquePublicChannels = publicChannels.filter(publicChannel => !involvedChannelIds.has(publicChannel.id));
	  
		// const mergedChannels = [
		//   ...uniquePublicChannels.map(publicChannel => ({
		// 		...publicChannel, status: involvedChannelIds.has(publicChannel.id) ? 'involved' : 'public'//'not-involved'
		// 	})),
		//   ...involvedChannels.map(involvedChannel => ({
		// 		...involvedChannel, status: 'involved'
		// 	})),
		// ];
	  
		// const mergedChannelsWithoutPassword = mergedChannels.map(({ password, ...rest }) => rest);
		// return mergedChannelsWithoutPassword;
	}

	async saveChannel(channel: Channel){
		return (this.channelRepository.save(channel));
	}

	/**
	 * PATCH genellikle guncellemek icin kullanilir.
	 */
	async	patchChannel(
		channel: string | undefined,
		body: Partial<UpdateChannelDto>,
	){
		const tmpChannel = await this.getChannelRelation({
			channelName: channel,
			relation: {}, 
			primary: true
		});
		if (!tmpChannel)
			return (`Channel'${channel}' not found.`);
		if (!Array.isArray(tmpChannel))
		{ // Channel seklinde gelirse alttaki for()'un kafasi karismasin diye.
			Object.assign(tmpChannel, body);
			return (await this.channelRepository.save(tmpChannel));
		}
		for (const channel of tmpChannel)
		{ // Channel[] seklinde gelirse hepsini tek tek guncellemek icin.
			Object.assign(channel, body);
			await this.channelRepository.save(channel);
		}
		return (tmpChannel);
	}

	async removeAllChannel() {
		return (await this.channelRepository.delete({}));
	}
	
	async removeChannel(channel: Channel){
		return (await this.channelRepository.remove(channel));
	}

	async removeUser(
		channel: string,
		relation: 'members' | 'bannedUsers',
		userId: number
	){
		const tmpChannel = await this.channelRepository.findOne({ where: { name: channel }, relations: [relation]});
		if (!tmpChannel){
			throw new NotFoundException('Channel does not exist!');
		}

		if (relation === 'members')
			tmpChannel.members = tmpChannel.members.filter(m => m.id !== userId);
		else if (relation === 'bannedUsers')
			tmpChannel.bannedUsers = tmpChannel.bannedUsers.filter(m => m.id !== userId);
		else
			throw (new NotFoundException('Relation not found!'));

		await this.channelRepository.save(tmpChannel);
		return (tmpChannel.id);
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
