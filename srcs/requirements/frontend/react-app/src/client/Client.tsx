import	IAuthenticate from "./IAuthenticate";

class	Client implements IAuthenticate
{
	private _isAuth: boolean;

	constructor()
	{
		this._isAuth = false;
	}

	Authenticate = (status: boolean): number =>
	{
		this._isAuth = status;
		return (0); // Bu değeri kendi uygulamanızın gereksinimlerine göre ayarlayın
	}

	isAuthenticate = (): boolean =>
	{
		return this._isAuth;
	}
}

export default Client;







// import React from "react";
// import IAuthenticate from "./Authenticate";

// /**
//  * Burada yeni bir client geldiginde sifirdan client olusturuyoruz.
//  * 
//  * Default variable'leri 'constructor'da ataniyor.
//  */
// class	Client implements IAuthenticate
// {
// 	private	_isAuth: boolean; // Burada variable'leri tanimliyoruz.

// 	constructor( _isAuth: boolean ) // Atama islemleri gerceklesiyor.
// 	{
// 		this._isAuth = false;
// 	};

// 	private	Authenticate = ( status: boolean ): number =>
// 	{
// 		this._isAuth = status;
// 		return (0);
// 	};

// 	// Bunlarin hepsi Interface'in icinde olusturuldugu icin public oluyor private olamiyor.
// 	isAuthenticate = (): boolean =>
// 	{
// 		return (this._isAuth);
// 	}
// };

// export default	Client;