import { Controller, Get, Post, Body, Patch, Param, Delete, NotFoundException, Query, HttpException, HttpStatus, UseGuards, Head, SetMetadata, Req } from '@nestjs/common';
import { ChatService } from './chat.service';
import { CreateMessageDto, UpdateMessageDto } from './dto/chat-message.dto';
import { UsersService } from 'src/users/users.service';
import { Colors as C } from '../colors';
import { AuthGuard } from 'src/auth/auth.guard';

/**
 * Bu @UseGuard()'i buraya koyarsan icerisindeki
 *  requestlerde tekrar tekrar yazmana gerek kalmaz.
 */
@UseGuards(AuthGuard)
@Controller('/chat')
export class ChatController {
	constructor(
		private readonly chatService: ChatService,
		private readonly usersService: UsersService,
	) {}

	// ---------- Create ---------
	// @Post(':channel')
	// async createChannel(@Body() createChannelDto: CreateChannelDto) {
	// 	return await this.chatService.createChannel(createChannelDto);
	// }

	@Post(':message')
	createMessage(@Body() createMessageDto: CreateMessageDto) {
		return this.chatService.createMessage(createMessageDto);
	}

	// ---------- Get ------------
	/**
	 * @Usage {{baseUrl}}:3000/chat/@all?relations=all
	 * 
	 * @Body() relationData: string[],
	 *  Bu da fetch istegi atarken body kismina yazdigimiz bilgiler.
	 * 
	 * @Query('relations') relations: string[] | null | 'all', 
	 *  {{baseUrl}}:3000/chat/channel?relations=users&relations=admins.
	 * @param channel 
	 * @param relations 
	 * @returns 
	 */
	@Get('/channel')
	// @SetMetadata('login', ['gsever', 'akaraca'])
	async findChannel(
		@Req() {user},
		@Query('channel') channel: string | undefined,
		@Query('relations') relations: string[] | null | 'all',
	) {
		try
		{
			console.log(`${C.B_GREEN}GET: Channel: [${channel}], Relation: [${relations}]${C.END}`);
			console.log("@Req() user:", user);
			return (await this.chatService.findChannel(channel, relations));
		}
		catch (err)
		{
			console.log("@Get('/channel'): ", err);
			return (null)
		}
	}

	// ---------- Delete ---------
	@Delete('/channel')
	async removeChannel(
		@Req() {user},
		@Query('channel') channel: string | undefined
	){
		try
		{
			console.log(`DELETE: Channel: ${channel}`);
			if (channel === "all")
			{
				const	response = await this.chatService.removeAllChannel();
				console.log(`All channels removed!`);
				return (response);
			}
			const tmpUser = await this.chatService.removeChannel(channel);
			if (!tmpUser)
				throw (new NotFoundException("name: Channel does not exist!"));
			return (tmpUser);
		}
		catch (err)
		{
			console.error("@Delete('/channel'): removeChannel(): ", err);
			return (null);
		}

	}
}