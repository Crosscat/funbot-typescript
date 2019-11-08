import { WordInfo, DatabaseHandler } from "../interfaces/data.interfaces";
import { inject, injectable } from "inversify";
import { TYPES } from "../types";

@injectable()
export class TalkHandler {
  constructor (
    @inject(TYPES.DatabaseHandler) private database: DatabaseHandler,
  ) { 
    database.connect(process.env.DATABASE_PATH);
  }

  public async handleMessage(message: string): Promise<string> {
    const keywords = this.getKeywords(message);
    
    return keywords.primary.word;
  }

  public getKeywords(message: string) {
    const infos = this.database.getInfos(message.split(' '));
    
    const primaryWord = infos.reduce((a: WordInfo, b: WordInfo) => a.frequency < b.frequency && a.frequency > 0 ? a : b);

    return { primary: primaryWord, secondary: null };
  }
}
