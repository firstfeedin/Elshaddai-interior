import { Module } from '@nestjs/common';

// Messages are handled via Socket.io in gateway
// REST endpoints for history retrieval
import { MessagesController } from './messages.controller';
import { MessagesService } from './messages.service';

@Module({ controllers: [MessagesController], providers: [MessagesService] })
export class MessagesModule {}
