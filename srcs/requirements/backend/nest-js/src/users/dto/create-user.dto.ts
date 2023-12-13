import { IsEmail, IsNotEmpty, IsString, IsOptional } from 'class-validator';
import { PartialType } from "@nestjs/swagger";

export class CreateUserDto {
	@IsNotEmpty({ message: 'Email cannot be empty' })
	@IsEmail({}, { message: 'Invalid email format' })
	email: string;

	@IsNotEmpty({ message: 'Login cannot be empty' })
	@IsString({ message: 'Login must be a string' })
	login: string;

	@IsNotEmpty({ message: 'Display name cannot be empty' })
	@IsString({ message: 'Display name must be a string' })
	displayname: string;

	@IsNotEmpty({ message: 'Image URL cannot be empty' })
	@IsString({ message: 'Image URL must be a string' })
	imageUrl: string;

	@IsOptional()
	@IsString({ message: 'Socket ID must be a string' })
	socketId?: string;

	@IsOptional()
	@IsString({ message: 'Nickname must be a string' })
	nickname?: string;

	@IsOptional()
	@IsString({ message: 'Avatar must be a string' })
	avatar?: string;
}

/**
 * Burada extends PartialType(CreateUserDto) olarak eklenen kisimda,
 *  buradaki 'dto' dosyasinin icerisinden cekiyor da olabilir veriyi...
 */
export class UpdateUserDto extends PartialType(CreateUserDto) {
	// extends olarak tanimladigimiz icin bu CreateUserDto'nun
	//  icindeki her seyi buraya da yazdigimizi dusun.
}
