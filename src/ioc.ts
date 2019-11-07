import 'reflect-metadata';

import { Container } from "inversify";
import { TYPES } from "./types";
import { DatabaseHandler } from "./interfaces/data.interfaces";
import { SqLiteHandler } from "./handlers/sqlite-handler";
import { TalkHandler } from "./handlers/talk-handler";
import { MessageHandler } from "./handlers/message-handler";

export class IOC extends Container {
  public constructor() {
    super();

    this.bind<DatabaseHandler>(TYPES.DatabaseHandler).to(SqLiteHandler);
    this.bind<MessageHandler>(TYPES.MessageHandler).to(MessageHandler);
    this.bind<TalkHandler>(TYPES.TalkHandler).to(TalkHandler);
  }
}
