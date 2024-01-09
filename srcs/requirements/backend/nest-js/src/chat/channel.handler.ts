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
	// const authToken = req.headers.authorization;
	// if (!authToken) {
	// 	return callback(new Error('Yetkisiz'), false);
	// }

	if (!file.mimetype.startsWith('image/') || !file.originalname.match(/\.(jpg|jpeg|png|gif)$/)){
		const errorMessage = "Only image files (jpg, jpeg, png, gif) are allowed!";
		callback(errorMessage, false);
	} else {
		callback(null, true);
	}
};

export const multerConfig = {
	limits: {
		file: 1,
		// fieldNameSize: 100,
		fileSize: 1024 * 1024 * 3,
	},
	storage: diskStorage({
		destination: './uploads/',
		filename: editFileName,
	}),
	fileFilter: imageFileFilter,
};
