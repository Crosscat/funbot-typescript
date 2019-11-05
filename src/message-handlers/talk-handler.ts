import { DatabaseHandler } from "../database/database-handler";

export class TalkHandler {
  private database: DatabaseHandler;

  constructor () {
    this.database = new DatabaseHandler();
  }

  public async handleMessage(message: string): Promise<string> {
    return this.database.test();
  }
}