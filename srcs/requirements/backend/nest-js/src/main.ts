import { NestFactory } from '@nestjs/core';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';
import * as fs from 'fs';
import * as https from 'https';

async function bootstrap() {
	const app = await NestFactory.create(AppModule);

	require('dotenv').config();

	const config = new DocumentBuilder()
		.setTitle('ft_transcendence')
		.setDescription('API description')
		.setVersion('1.0')
		.build();
	const document = SwaggerModule.createDocument(app, config);
	SwaggerModule.setup('swagger', app, document);

	// console.log(process.env.SSL_CRT_FILE as string);
	// console.log(process.env.SSL_KEY_FILE as string);
	console.log('/etc/ssl/certs/ft_transcendence-backend.key');
	console.log('/etc/ssl/certs/ft_transcendence-backend.crt');
	console.log(fs.readFileSync('/etc/ssl/certs/ft_transcendence-backend.key'));
	console.log(fs.readFileSync('/etc/ssl/certs/ft_transcendence-backend.crt'));
	const httpsOptions = {
		key: fs.readFileSync('/etc/ssl/certs/ft_transcendence-backend.key'),
		cert: fs.readFileSync('/etc/ssl/certs/ft_transcendence-backend.crt'),
		
	};

	await app.init();

    // Yeni kod parçası burada
    const server = https.createServer(httpsOptions, app.getHttpAdapter().getHttpServer());
    server.listen(process.env.PORT, () => {
        console.log(`Server is listening on port ${process.env.PORT}`);
    });
}

bootstrap();
