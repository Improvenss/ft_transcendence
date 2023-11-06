// import { Image } from "../entities/user.entity";

class Image {
	link: string;
	versions: {
		large: string;
		medium: string;
		micro: string;
		small: string;
	}
}

export class CreateUserDto {
	login: string;
	first_name: string;
	last_name: string;
	image: Image;
}
