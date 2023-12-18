import { CreateChannelDto } from './dto/chat-channel.dto';
import { User } from 'src/users/entities/user.entity';
import { Socket } from 'socket.io';
import { ChatService } from './chat.service';
import * as bcrypt from 'bcrypt';

import { extname } from 'path';
import { diskStorage } from 'multer';

// export async function saveImage() {
// Dosya Adı Değiştirme Fonksiyonu
const editFileName = (req, file, callback) => {
	const randomName = Array(15)
	.fill(null)
	.map(() => Math.round(Math.random() * 16).toString(16))
	.join('');

	// Dosya adını sanitize et
	// const sanitizeFilename = require('sanitize-filename');
	// const sanitizedFilename = sanitizeFilename(file.originalname);
	// Eğerki dosya adı My/File:Name.png ise MyFileName.png yapıyor.

	// callback(null, `${randomName}${sanitizedFilename}`);
	callback(null, `${randomName}${extname(file.originalname)}`);
};

// Dosya Türü Kontrolü Fonksiyonu
const imageFileFilter = (req, file, callback) => {
	if (!file.originalname.match(/\.(jpg|jpeg|png|gif)$/) 
		|| !file.mimetype.startsWith('image/')) {
	return callback(new Error('Only image files are allowed!'), false);
	}
	callback(null, true);
};

const MAX_FILE_SIZE = 1024 * 1024 * 3; // 3MB

const storage = diskStorage({
	destination: './uploads/',
	filename: editFileName,
});

export const multerConfig = {
	storage,
	limits: {
		fileSize: MAX_FILE_SIZE,
	},
	fileFilter: imageFileFilter,
};
// }

// /**
//  * Socket'in 'joinChannel' kisminin Channel yoksa olusturulan functionu.
//  * @param chatService 
//  * @param formData 
//  * @param responseUser 
//  * @param socket 
//  * @param server 
//  */
// export async function handleCreateChannel(
// 	chatService: ChatService,
// 	formData: any,
// 	responseUser: User | null,
// 	socket: Socket,
// 	server: any,
// 	)
// {
// 	console.log("formData password: ", typeof(formData.password), formData.password);
// 	const createChannelDto: CreateChannelDto = {
// 		name: formData.name as string,
// 		type: formData.type as string,
// 		description: null,
// 		password: formData.password === ('' || undefined || null)
// 			? null
// 			: bcrypt.hashSync(
// 				formData.password,
// 				bcrypt.genSaltSync(+process.env.DB_PASSWORD_SALT)),
// 		image: null,
// 		members: [responseUser],
// 		admins: [responseUser],
// 	};
// 	const response = await chatService.createChannel(createChannelDto);
// 	console.log(response, `ADMIN: ${socket.id}`); // Basarili bir sekidle Channel olusturuldu mu onu kontrol edebiliriz.
// 	socket.join(formData.name);
// 	server.emit('channelListener', formData);
// }