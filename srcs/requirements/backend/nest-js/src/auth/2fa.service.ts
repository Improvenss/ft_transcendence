import { Injectable } from '@nestjs/common';
import * as speakeasy from 'speakeasy'
import * as qrcode from 'qrcode'

export interface ISecretCode2FA {
	ascii: string,
	hex: string,
	base32: string,
	otpauth_url: string,
}
//  secretCode {
//    ascii: ',E]&Nonw&#dsuevEvh$>@}dpi]>uZ*,>',
//    hex: '2c455d264e6f6e7726236473756576457668243e407d6470695d3e755a2a2c3e',
//    base32: 'FRCV2JSON5XHOJRDMRZXKZLWIV3GQJB6IB6WI4DJLU7HKWRKFQ7A',
//    otpauth_url: 'otpauth://totp/ft_transcendence(gsever)?secret=FRCV2JSON5XHOJRDMRZXKZLWIV3GQJB6IB6WI4DJLU7HKWRKFQ7A'
//  }

@Injectable()
export class TwoFactorAuthService {
	generateSecret2FA(user: string): Promise<ISecretCode2FA> {
		const secretCode = speakeasy.generateSecret({
			name: `ft_transcendence(${user})`,
		});
		return (secretCode);
	}

	createQrCode(secretCode: ISecretCode2FA): Promise<string> {
		const dataUrl = qrcode.toDataURL(secretCode.otpauth_url);
		return (dataUrl);
	}

	verifyToken(
		secret: string,
		token: string, // sixDigitCode
	): Promise<boolean> {
		speakeasy.totp.verify({})
		const verified = speakeasy.totp.verify({
			secret,
			encoding: 'ascii',
			token
		});
		if (!verified)
			throw new Error('2FA Error!');
		return (verified); // verify edilip edilmedigini donduruyor.
	}
}
// backend'den frontend'e cookie'yi set etme. req.cookie