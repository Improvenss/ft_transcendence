import { PartialType } from '@nestjs/swagger';
import { CreateChatDto } from './create-chat.dto';

export class UpdateChatDto extends PartialType(CreateChatDto) {}

// import { IsNotEmpty } from 'class-validator';

// export class UpdateChannelDto {
//   @IsNotEmpty()
//   name: string;

//   // Güncellenecek diğer DTO sütunları buraya eklenebilir
// }
