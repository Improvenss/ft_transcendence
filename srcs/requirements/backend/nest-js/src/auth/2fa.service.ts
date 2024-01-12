import { Injectable } from '@nestjs/common';
import * as speakeasy from 'speakeasy'
import * as qrcode from 'qrcode'

@Injectable()
export class TwoFactorAuthService {
	createQrCode(user: string): Promise<string> {
		const	secretCode = speakeasy.generateSecret({
			name: `ft_transcendence(${user})`,
		});
		// qrcode.toDataURL(secretCode.otpauth_url, function(err, data){
		// 	console.log(data);
		// 	return (data);
		// });
		return (qrcode.toDataURL(secretCode.otpauth_url));
	}

	verifyToken(secret: string, token: string): boolean{
		const	verified = speakeasy.totp.verify({
			secret,
			encoding: 'base32',
			token
		});
		return (verified); // verify edilip edilmedigini donduruyor.
	}
}
// backend'den frontend'e cookie'yi set etme. req.cookie