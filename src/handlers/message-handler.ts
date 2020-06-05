import { inject, injectable } from "inversify";

import { Message } from "../interfaces/message.interface";
import { TalkHandler } from "./talk-handler";
import { TYPES } from "../types";
import { DatabaseHandler } from "../interfaces/data.interfaces";

@injectable()
export class MessageHandler {
  constructor(
    @inject(TYPES.TalkHandler) private talkHandler: TalkHandler,
    @inject(TYPES.DatabaseHandler) private database: DatabaseHandler,
  ) { }

  public async handleMessage(message: string): Promise<string> {
    message = message.replace(/\s+/g, ' ');

    if (!this.isValidAction(message)) {
      const words = message.split(' ');
      this.database.updateWords(words);
      return;
    }

    const parsedMessage = this.parseMessage(message);

    switch (parsedMessage.prefix) {
      case 'talk':
        return this.talkHandler.handleMessage(parsedMessage.message);
      default:
        return;
    }
  }

  private isValidAction(message: string): boolean {
    return message.startsWith('!');
  }

  private parseMessage(message: string): Message {
    const prefix = message.split(' ')[0].substring(1).toLowerCase();
    return { 
      prefix: prefix,
      message: message.substring(prefix.length + 1).trim(),
    };
  }
}
