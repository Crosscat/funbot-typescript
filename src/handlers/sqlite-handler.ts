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
  
  public async getInfos(words: string[]): Promise<WordInfo[]> {
    const query = `select * from words where word in (${words.map((word) => `'${word}'`).join(', ')}) and frequency > 0`

    let infos = [];

    await new Promise((resolve, reject) => {
      this.db.all(query, [], (err, rows) => {
        console.log('rows: ' + rows);
        infos = rows.map((row) => this.mapWordInfo(row));
      });
    });

    return infos;
  }

  public getInfo(word: string): Promise<WordInfo> {
    return null;
  }

  mapWordInfo = (row: any): WordInfo => {
    return {
      id: row.ID,
      word: row.Word,
      frequency: row.Frequency,
      endFrequency: row.EndFrequency,
      startFrequency: row.StartFrequency,
    };
  };
}
