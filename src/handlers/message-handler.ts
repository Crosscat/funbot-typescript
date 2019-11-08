import { inject, injectable } from "inversify";

import { Message } from "../interfaces/message.interface";
import { TalkHandler } from "./talk-handler";
import { TYPES } from "../types";

@injectable()
export class MessageHandler {
  constructor(
    @inject(TYPES.TalkHandler) private talkHandler: TalkHandler,
  ) { }

  public async handleMessage(message: string): Promise<string> {
    if (!this.isValidMessage(message)) return;

    const parsedMessage = this.parseMessage(message);

    switch (parsedMessage.prefix) {
      case 'talk':
        return this.talkHandler.handleMessage(parsedMessage.message);
      default:
        return null;
    }
  }

  private isValidMessage(message: string): boolean {
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
