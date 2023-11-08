import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as fs from 'fs';
import * as cors from 'cors';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

/**
 * TODO: Cookies eklenecek, buna gore login sayfasina yonlendirme yapilacak.
 * TODO: JWT yapisini daha detayli ogren.
 * TODO: 42Login butonuna tiklandiginda veriler zaten varsa tekrardan
 *  kayit yapmayi engelle. Buna da 42'deki userData'sindaki 'id',
 *  login ve e-mail, bunlar unique degerler. Bunlarin hepsine gore
 *  kontrol et. Bunlar yoksa ekle, varsa ekleme. Cookie kontrolu yap,
 *  ona gore olustur. 
 * TODO: WS: Soket baglantisiyla ornek bir mesajlasma yap. Bunu 'backend'
 *  de yapacaksin sadece .emit() ile frontend'de baglanti kurulacak.
 */
async function bootstrap() {
	require('dotenv').config(); // Bu .env dosyalasini kullanabilmemizi sagliyor.
	const	httpsOptions = {
		key: fs.readFileSync(process.env.SSL_KEY_FILE as string),
		cert: fs.readFileSync(process.env.SSL_CRT_FILE as string),
	};
	const	app = await NestFactory.create(AppModule, {httpsOptions, cors: true}); // Bu ana 'app'imiz.
	app.enableCors();
	app.use(
		cors({
		origin: "https://localhost", // İzin verilen kök alan
		methods: "GET,HEAD,PUT,PATCH,POST,DELETE", // İzin verilen HTTP yöntemleri
		})
	);
	const	configSwagger = new DocumentBuilder() // Bu ve altindakiler 'swagger' icin;
		.setTitle('ft_transcendence') // Config olusturduk.
		.setDescription('ft_transcendence API UI!') // Direkt icerisine yazmaktansa,
		.setVersion('1.0') // bu config'i verecegiz.
		.build()
	const	documentSwagger = SwaggerModule.createDocument(app, configSwagger);
	SwaggerModule.setup('swagger', app, documentSwagger);

	app.listen(process.env.PORT);
}

bootstrap();

/**
 * Kurulan paketler sirasiyla;
 * 
 * npm install --save dotenv -> .env'lerimizi alabilmemiz icin.
 * npm install --save-dev @types/babel__core -> tsconfig.json dosyasinda istiyordu.
 * npm install --save-dev @types/cors -> cors pakedini kurduk, cors protokolu hatasini onlemek icin.
 * npm install --save-dev @nestjs/swagger -> Swagger ile postman gibi GET POST... Gibi istekleri tiklayarak yapabilmemizi sagliyor.
 * 
 * npm install --save-dev @nestjs/config -> app.module.ts icerisindeki @Module nin icerisinde .env dosyasini kullanabilmek icin.
 * npm install --save-dev @nestjs/typeorm -> Veritabani ile baglanti kurabilmemizi saglayan ORM(Object Relational Mapping).
 * npm install --save-dev pg -> PostgreSQL ile bagtanti kurabilmek icin.
 * 
 * nest generate resource api
 * 	? What transport layer do you use? REST API
 * 	? Would you like to generate CRUD entry points? Yes
 * 
 * npm install --save-dev typeorm -> Entity'de falan TypeORM CRUD yapisini kullanabilmek icin.
 * 
 * npm install --save-dev @nestjs/websockets @nestjs/platform-socket.io -> WebSocket'leri icin gerekli kutuphaneleri kurduk.
 * nest generate gateway chat -> Socket ile mesajlasabilmek icin 'gateway' yapisini ekledik.
 */