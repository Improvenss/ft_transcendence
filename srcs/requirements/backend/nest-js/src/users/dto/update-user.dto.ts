import { PartialType } from '@nestjs/swagger';
import { CreateUserDto } from './create-user.dto';

/**
 * Burada extends PartialType(CreateUserDto) olarak eklenen kisimda,
 *  buradaki 'dto' dosyasinin icerisinden cekiyor da olabilir veriyi...
 */
export class UpdateUserDto extends PartialType(CreateUserDto) {
	login?: string;
	// first_name?: string; // Bu user.service.ts dosyasinin icerisinde oldugu icin degisitirilebiliyor. Ama burada olmasi bir sey degistirmiyor neden bele bilmiyorum su anlik.
	last_name?: string; // Bunu user.service.ts'nin icerisindeki update()'a da eklemezsek bir seye yaramiyor burada olup olmamasi.
	// Buraya da baska seyleri degistirmek istiyorsak onlari da teker teker eklememiz gerekiyor.
	// Niye boyle bilmiyorum.
}
