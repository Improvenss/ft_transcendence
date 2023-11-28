import { PartialType } from '@nestjs/swagger';
import { CreateUserDto } from './create-user.dto';

/**
 * Burada extends PartialType(CreateUserDto) olarak eklenen kisimda,
 *  buradaki 'dto' dosyasinin icerisinden cekiyor da olabilir veriyi...
 */
export class UpdateUserDto extends PartialType(CreateUserDto) {
	// extends olarak tanimladigimiz icin bu CreateUserDto'nun
	//  icindeki her seyi buraya da yazdigimizi dusun.
}
