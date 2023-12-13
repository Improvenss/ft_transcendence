import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as fs from 'fs';
import * as cors from 'cors';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { INestApplication } from '@nestjs/common';
import { EventEmitter } from 'events';

function setupSwagger(app: INestApplication) {
	const options = new DocumentBuilder() // Bu ve altindakiler 'swagger' icin;
	  .setTitle('NestJS API') // Config olusturduk.
	  .setDescription('NestJS API Documentation')  // Direkt icerisine yazmaktansa,
	  .setVersion('1.0')// bu config'i verecegiz.
	  .build();

	const document = SwaggerModule.createDocument(app, options);
	SwaggerModule.setup('swagger', app, document);
	fs.writeFileSync('swagger.json', JSON.stringify(document, null, 2)); // Buradaki swagger'in json dosyasini kaydediyoruz; boylelikle Postman uygulamasindan direkt olarak swagger'in butun http isteklerini Postman'dan atabiliyoruz.
}

/**
 * NOTES: GET: Bu @channel/:relation bu 1 tane string oluyor.
 * 
 * relations'u yap {{baseUrl}}:3000/chat/@all?relations=users&relations=admins. Bu string[] oluyor.
 * 
 * Sonra bunlari Users entity'sine de ekle.
 * 
 * Channel'e yazilan mesajlari DB'ye Messages[] tablosuna kaydet.
 * 
 * Ilk giris ekraninda login ve profile photo secim ekranindaki gelen verileri isle,
 *  fotografi DB'de ['bytea'] seklinde kaydet. Dosya olarak local'de falan bulunmayacak.
 *  postgres Db'nin icerisinde tutulacak bu bytea'nin icinde. istedigimizde indirebilecegiz.
 * 
 * TypeORM @Guards() bakilacak.
 * 
 * 
 * 
 */
async function bootstrap() {
	const myEmitter = new EventEmitter();
	myEmitter.setMaxListeners(15);
	const	httpsOptions = {
		key: fs.readFileSync(process.env.KEY_FILE as string),
		cert: fs.readFileSync(process.env.CERT_FILE as string),
	};
	const	app = await NestFactory.create(AppModule, {httpsOptions, cors: true}); // Bu ana 'app'imiz.
	app.enableCors();
	app.use(
		cors({
			origin: process.env.API_HOST as string, // İzin verilen kök alan
			methods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE'], // İzin verilen HTTP yöntemleri
		})
	);

	// app.use(express.json({ limit: '50mb' }));
	// app.use(express.urlencoded({ limit: '50mb', extended: true }));

	setupSwagger(app);
	await app.listen(process.env.B_PORT);
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
 * npm install jsonwebtoken -> Artik kullanmiyoruz. Cunku; @nestjs yapisindaki guard'larda falan kullanamiyoruz.
 * @OK npm install @nestjs/jwt -> JWT token icin.
 * @OK npm install --save-dev @types/bcrypt -> DB'deki password'lari sifreli bir sekilde tutmak icin.
 * @OK npm install --save-dev bcrypt -> Gormuyordu bcrypt'i o yuzden hepsini kurdum.
 * @OK /app/nest-js # nest generate guard auth -> Bilgilerin guvenligi icin guard.
 * 	CREATE src/auth/auth.guard.spec.ts (160 bytes)
 * 	CREATE src/auth/auth.guard.ts (299 bytes)
 * @OK /app/nest-js # nest generate module auth
 * 	CREATE src/auth/auth.module.ts (81 bytes)
 * 	UPDATE src/app.module.ts (1603 bytes)
 */