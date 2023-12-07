import { Channel, Message } from "src/chat/entities/chat.entity";
import { IsEmail, IsNotEmpty, IsString, IsOptional } from 'class-validator';

// class Image {
	// link: string;
	// versions: {
	// 	large: string;
	// 	medium: string;
	// 	micro: string;
	// 	small: string;
	// }
// }

// export class CreateUserDto {
// 	login: string;
// 	socket_id?: string | null;
// 	first_name: string;
// 	last_name: string;
// 	email: string;
// 	// image: Image;
// 	image: string;
// 	channels: Channel[];
// 	messages: Message[];
// }

export class CreateUserDto {
	@IsNotEmpty({ message: 'Email cannot be empty' })
	@IsEmail({}, { message: 'Invalid email format' })
	email: string;

	@IsNotEmpty({ message: 'Login cannot be empty' })
	@IsString({ message: 'Login must be a string' })
	login: string;

	@IsNotEmpty({ message: 'Display name cannot be empty' })
	@IsString({ message: 'Display name must be a string' })
	displayname: string;

	@IsNotEmpty({ message: 'Image URL cannot be empty' })
	@IsString({ message: 'Image URL must be a string' })
	imageUrl: string;

	@IsOptional()
	@IsString({ message: 'Socket ID must be a string' })
	socketId?: string;

	@IsOptional()
	@IsString({ message: 'Nickname must be a string' })
	nickname?: string;

	@IsOptional()
	@IsString({ message: 'Avatar must be a string' })
	avatar?: string;
}
