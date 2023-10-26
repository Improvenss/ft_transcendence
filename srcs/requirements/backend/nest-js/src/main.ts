import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import * as fs from 'fs';
import * as cors from 'cors';
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";

async function bootstrap() {
	require('dotenv').config(); // Bu .env dosyalasini kullanabilmemizi sagliyor.
	const	httpsOptions = {
		key: fs.readFileSync(process.env.SSL_KEY_FILE as string),
		cert: fs.readFileSync(process.env.SSL_CRT_FILE as string),
	};
	const	app = await NestFactory.create(AppModule, {httpsOptions}); // Bu ana 'app'imiz.

	const	configSwagger = new DocumentBuilder() // Bu ve altindakiler 'swagger' icin;
		.setTitle('ft_transcendence') // Config olusturduk.
		.setDescription('ft_transcendence API UI!') // Direkt icerisine yazmaktansa,
		.setVersion('1.0') // bu config'i verecegiz.
		.build()
	const	documentSwagger = SwaggerModule.createDocument(app, configSwagger);
	SwaggerModule.setup('swagger', app, documentSwagger);
	app.use(
		cors({
			origin: 'https://192.168.1.36/', // İzin verilen kök alan
			methods: 'GET,HEAD,PUT,PATCH,POST,DELETE', // İzin verilen HTTP yöntemleri
		})
	);
	app.listen(process.env.PORT);
}

bootstrap();