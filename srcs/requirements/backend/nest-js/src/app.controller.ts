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
		@Res() res: Response
	){
		try {
			const imagePath = path.join(process.cwd(), './uploads/', imageName);
			// Dosya var mı diye kontrol et
			if (fs.existsSync(imagePath)) {
				// Dosyayı oku ve istemciye gönder
				//res.download(imagePath); // Dosya indirme işlemi, dosyanın HTTPS üzerinden gönderilmesini sağlar
				res.sendFile(imagePath);
			} else {
				// Dosya bulunamazsa 404 hatası gönder
				throw new NotFoundException('File not found');
			}
		} catch (err) {
			console.log("imageUpload err:", err.message);
		}
	}
}
