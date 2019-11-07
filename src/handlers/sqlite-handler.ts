import { injectable } from "inversify";
import { Database } from 'sqlite3';

import { WordInfo, DatabaseHandler } from "../interfaces/data.interfaces";

@injectable()
export class SqLiteHandler implements DatabaseHandler {
  private db: Database;
  
  connect(path: string): void {
    this.db = new Database(path);
  }

  disconnect(): void {
    this.db.close();
  }
  
  public getInfos(words: string[]): WordInfo[] {
    return [{}] as WordInfo[];
  }

  public getInfo(word: string): WordInfo {
    return {} as WordInfo;
  }
}
