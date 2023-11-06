import { Injectable } from '@nestjs/common';
import * as fs from 'fs';

@Injectable()
export class AppService {
	getHello(): string {
		return ('Hello World! from backend/nest-js/src/app.service.ts.');
	}

	private	fileName = "asdf.txt";

	createFile(): void {
		fs.writeFileSync(this.fileName, "ehehhehe", 'utf8');
	}

	readFile(): string {
		if (fs.existsSync(this.fileName)) {
			const	data = fs.readFileSync(this.fileName, 'utf8');
			return (data);
		}
		return ("File not found!");
	}

	writeFile(content: string): void {
		if (fs.existsSync(this.fileName)) {
			fs.writeFileSync(this.fileName, content, 'utf8');
		}
	}

	// appendFile(): 
}
