import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as fs from 'fs';
import * as cors from 'cors';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

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
			origin: process.env.API_HOST as string, // İzin verilen kök alan
			methods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE'], // İzin verilen HTTP yöntemleri
		})
	);
	const	configSwagger = new DocumentBuilder() // Bu ve altindakiler 'swagger' icin;
		.setTitle('ft_transcendence') // Config olusturduk.
		.setDescription('ft_transcendence API UI!') // Direkt icerisine yazmaktansa,
		.setVersion('1.0') // bu config'i verecegiz.
		.build()
	const	documentSwagger = SwaggerModule.createDocument(app, configSwagger);
	fs.writeFileSync('swagger.json', JSON.stringify(documentSwagger, null, 2)); // Buradaki swagger'in json dosyasini kaydediyoruz; boylelikle Postman uygulamasindan direkt olarak swagger'in butun http isteklerini Postman'dan atabiliyoruz.
	SwaggerModule.setup('swagger', app, documentSwagger);

	await app.listen(process.env.PORT);
	console.log(`Application is running on: ${await app.getUrl()}`);}
bootstrap();

/**
 * Kurulan paketler sirasiyla;
 * 
 * @OK npm install --save dotenv -> .env'lerimizi alabilmemiz icin.
 * npm install --save @types/babel__core -> tsconfig.json dosyasinda istiyordu.
 * npm install --save @types/cors -> cors pakedini kurduk, cors protokolu hatasini onlemek icin.
 * @OK npm install --save @nestjs/swagger -> Swagger ile postman gibi GET POST... Gibi istekleri tiklayarak yapabilmemizi sagliyor.
 * 
 * @OK npm install --save @nestjs/config -> app.module.ts icerisindeki @Module nin icerisinde .env dosyasini kullanabilmek icin.
 * @OK npm install --save @nestjs/typeorm -> Veritabani ile baglanti kurabilmemizi saglayan ORM(Object Relational Mapping).
 * @OK npm install --save pg -> PostgreSQL ile bagtanti kurabilmek icin.
 * 
 * @OK /app/nest-js # nest generate resource api
 * 	? What transport layer do you use? REST API
 * 	? Would you like to generate CRUD entry points? Yes
 * 
 * @OK /app/nest-js # nest generate resource users
 * 	? What transport layer do you use? REST API
 * 	? Would you like to generate CRUD entry points? Yes
 * 
 * npm install --save-dev typeorm -> Entity'de falan TypeORM CRUD yapisini kullanabilmek icin.
 * 
 * @OK npm install --save @nestjs/websockets @nestjs/platform-socket.io -> WebSocket'leri icin gerekli kutuphaneleri kurduk.
 * nest generate gateway chat -> Socket ile mesajlasabilmek icin 'gateway' yapisini ekledik.
 * 
 * @OK npm install jsonwebtoken -> JWT token icin.
 */