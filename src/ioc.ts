import 'reflect-metadata';

import { Database } from 'sqlite3';
import { Container, decorate, injectable } from "inversify";

import { TYPES } from "./types";
import { MessageHandler } from "./handlers/message-handler";
import { SqLiteHandler } from "./handlers/sqlite-handler";
import { TalkHandler } from "./handlers/talk-handler";
import { DatabaseHandler } from './interfaces/data.interfaces';

export class IOC extends Container {
  public constructor() {
    super();
    decorate(injectable(), Database);

    this.bind<Database>(TYPES.Database).toConstantValue(new Database(':memory:'));
    this.bind<DatabaseHandler>(TYPES.DatabaseHandler).to(SqLiteHandler).inSingletonScope();
    this.bind<MessageHandler>(TYPES.MessageHandler).to(MessageHandler);
    this.bind<TalkHandler>(TYPES.TalkHandler).to(TalkHandler);
  }
}
