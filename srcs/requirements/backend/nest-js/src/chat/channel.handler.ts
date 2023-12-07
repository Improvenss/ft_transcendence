import { CreateChannelDto } from './dto/chat-channel.dto';
import { User } from 'src/users/entities/user.entity';
import { Socket } from 'socket.io';
import { ChatService } from './chat.service';
import * as bcrypt from 'bcrypt';

/**
 * Socket'in 'joinChannel' kisminin Channel yoksa olusturulan functionu.
 * @param chatService 
 * @param formData 
 * @param responseUser 
 * @param socket 
 * @param server 
 */
export async function handleCreateChannel(
	chatService: ChatService,
	formData: any,
	responseUser: User | null,
	socket: Socket,
	server: any,
	)
{
	console.log("formData password: ", typeof(formData.password), formData.password);
	const createChannelDto: CreateChannelDto = {
		name: formData.name as string,
		type: formData.type as string,
		password: formData.password === ('' || undefined || null)
			? null
			: bcrypt.hashSync(
				formData.password,
				bcrypt.genSaltSync(+process.env.DB_PASSWORD_SALT)),
		image: null,
		members: [responseUser],
		admins: [responseUser],
	};
	const response = await chatService.createChannel(createChannelDto);
	console.log(response, `ADMIN: ${socket.id}`); // Basarili bir sekidle Channel olusturuldu mu onu kontrol edebiliriz.
	socket.join(formData.name);
	server.emit('channelListener', formData);
}