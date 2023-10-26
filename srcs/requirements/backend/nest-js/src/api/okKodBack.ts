// // https://www.youtube.com/watch?v=i7k63JC8QFU

// import { Controller, Get, Param, Post, Body } from "@nestjs/common";
// import { CreateLoginDto } from "./dto/create-login.dto";

// @Controller("login")
// export class LoginController{
// 	@Get()
// 	getApi() { //localhost:3000/login
// 		return ("get api!");
// 	}

// 	@Get(":uri") //localhost:3000/login/asdadsasd   uri=asdadsasd
// 	getUri(@Param("uri") user_uri) {
// 		return `This id ${user_uri}.`;
// 	}

// 	@Post()
// 	create(@Body() code: CreateLoginDto) { //Json olarak gelen argümana bakıyor
// 		return { message: "User code received", code: code.code };
// 		//return (`User code: ${code.code}`);
// 		// http://localhost:3000/login?code=asdadad
// 		// network kısmındaki json dosyasını kontrol et
// 	}

// }