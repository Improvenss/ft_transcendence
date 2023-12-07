import { Controller, Get, NotFoundException, Param, Res } from '@nestjs/common';
import { AppService } from './app.service';
import * as path from 'path';
import * as fs from 'fs';
import { Response } from 'express';

@Controller()
export class AppController {
	constructor(private readonly appService: AppService) {}

	@Get()
	getHello(): string {
		return this.appService.getHello();
	}

	@Get('uploads/:imageName')
	async getImage(
		@Param('imageName') imageName: string,
		@Res() res: Response): Promise<void>
	{
		const imagePath = path.join(process.cwd(), './uploads/', imageName);

		// Dosya var mı diye kontrol et
		if (fs.existsSync(imagePath)) {
			// Dosyayı oku ve istemciye gönder
			res.sendFile(imagePath, (err) => {
			if (err) {
				console.error(err);
				throw new NotFoundException('File not found');
			}
			});
		} else {
			// Dosya bulunamazsa 404 hatası gönder
			throw new NotFoundException('File not found');
		}
	}
}


/*-----------------image upload yapısı-----------------//
// channelCreate yapısı içine taşındığı için burada yorum satırında bıraktım.

// Dosya Adı Değiştirme Fonksiyonu
	const editFileName = (req, file, callback) => {
		const randomName = Array(15)
		  .fill(null)
		  .map(() => Math.round(Math.random() * 16).toString(16))
		  .join('');
		callback(null, `${randomName}${extname(file.originalname)}`);
  	};
  
// Dosya Türü Kontrolü Fonksiyonu
	const imageFileFilter = (req, file, callback) => {
		if (!file.originalname.match(/\.(jpg|jpeg|png|gif)$/)) {
		  return callback(new Error('Only image files are allowed!'), false);
	}
	callback(null, true);
  };

  	const MAX_FILE_SIZE = 1024 * 1024 * 2; // 1MB

 	const storage = diskStorage({
	  destination: './uploads/',
	  filename: editFileName,
	});

  	const multerConfig = {
		storage,
		limits: {
		  fileSize: MAX_FILE_SIZE,
		},
		fileFilter: imageFileFilter,
	};

	@Post('upload')
	@UseInterceptors(FileInterceptor('file', multerConfig))
	uploadFile(@UploadedFile() file) {
		if (!file) {
			throw new Error('No file uploaded');
		}
		console.log("Uploaded file:", file);
		const response = {
			filename: file.filename,
		};
		return response;
	}

//-----------------------------------------------------*/
