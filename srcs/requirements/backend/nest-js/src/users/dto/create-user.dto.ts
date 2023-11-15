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
	socket_id?: string | null;
	first_name: string;
	last_name: string;
	email: string;
	image: Image;
}
