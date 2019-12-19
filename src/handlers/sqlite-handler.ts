import { injectable, inject } from "inversify";
import { Database } from 'sqlite3';

import { WordInfo, DatabaseHandler, IdInfo } from "../interfaces/data.interfaces";
import { TYPES } from "../types";

@injectable()
export class SqLiteHandler implements DatabaseHandler {
  constructor(
    @inject(TYPES.Database) private db: Database,
  ) { }
  
  public connect(path: string): void {
    this.db = new Database(path);
  }

  public disconnect(): void {
    this.db.close();
  }
  
  public async getInfos(words: string[]): Promise<WordInfo[]> {
    const query = `Select * From Words Where Word In (${words.map((word) => `'${word}'`).join(', ')})`;

    let result = await new Promise<WordInfo[]>((resolve) => {
      this.db.all(query, [], (_, rows) =>
        resolve(rows == null ? [] : rows.map((row) => this.mapWordInfo(row)))
      );
    });

    return words.map((word) => result.find((row) => row.word === word));
  }

  public async getIdInfos(words: WordInfo[]): Promise<IdInfo[]> {
    const query = `Select * From IDs Where WordID in (${words.map((word) => `${word.id}`).join(', ')}) Order By WordID Asc`;

    let result = await new Promise<IdInfo[]>((resolve) => {
      this.db.all(query, [], (_, rows) =>
        resolve(rows.map((row) => this.mapIdInfo(row)))
      );
    });

    return result;
  }

  public async updateWords(words: string[]): Promise<void> {
    let wordInfos = await this.getInfos(words);
    wordInfos = await Promise.all(wordInfos.map(async (word, index) =>
      word === undefined ? this.newWord(words[index]) : word
    ));
    wordInfos = this.combineDuplicates(wordInfos);
    for (let i = 0; i < wordInfos.length; i++) {
      await this.updateWord(wordInfos[i]);
    }

    await Promise.all(wordInfos.map(async (_, index) => {
      let info = {
        trailingIds: [],
        id: 0,
        followingIds: [],
      } as IdInfo;

      for (let i = -3; i <= 3; i++) {
        const offset = index + i;
        let id = offset >= 0 && offset < wordInfos.length
          ? wordInfos[offset].id
          : 0;

        if (i < 0) {
          info.trailingIds[i + 3] = id;
        } else if (i > 0) {
          info.followingIds[i - 1] = id;
        } else {
          info.id = id;
        }
      }

      return this.insertId(info);
    }));
  }

  public async exec(sql: string): Promise<void> {
    await new Promise<void>((resolve) => {
      this.db.exec(sql, () => resolve());
    })
  }

  public async getNextWord(baseWord: WordInfo, followingWord: WordInfo, isBackwards: boolean): Promise<WordInfo> {
    let infos = await this.getIdInfos([baseWord]);
    if (followingWord != null) {
      infos = infos.filter((x) => isBackwards ? followingWord.id === x.trailingIds[2] : followingWord.id === x.followingIds[0]);
    }
    if (!infos.length) {
      return null;
    }
    const randomInfo = infos[Math.floor(Math.random() * infos.length)];
    
    const nextId = followingWord != null ? (isBackwards ? randomInfo.trailingIds[1] : randomInfo.followingIds[1])
                                         : (isBackwards ? randomInfo.trailingIds[2] : randomInfo.followingIds[0]);
    if (nextId === 0) {
      return null;
    }
    return await this.getWordInfoFromId(nextId);
  }

  private async getWordInfoFromId(id: number): Promise<WordInfo> {
    const query = `Select * From Words Where ID = ${id}`;

    let result = await new Promise<WordInfo[]>((resolve) => {
      this.db.all(query, [], (_, rows) =>
        resolve(rows == null ? [] : rows.map((row) => this.mapWordInfo(row)))
      );
    });

    return result[0];
  }

  private async insertWord(word: string): Promise<WordInfo> {
    const query = `Insert into Words (Word, Frequency, EndFrequency, StartFrequency)
                  Values ('${word}', 0, 0, 0)`;

    await this.exec(query);
    const data = await this.getInfos([word]);

    return data[0];
  }

  private async updateWord(wordInfo: WordInfo): Promise<void> {
    if (wordInfo.id === 0) {
      const newWord = await this.insertWord(wordInfo.word);
      wordInfo.id = newWord.id;
    }

    const query = `Update Words Set Frequency = ${wordInfo.frequency}, EndFrequency = ${wordInfo.endFrequency}, StartFrequency = ${wordInfo.startFrequency} Where ID = ${wordInfo.id}`;

    await this.exec(query);
  }

  private async insertId(idInfo: IdInfo): Promise<void> {
    const query = `Insert into IDs (WordID, FollowingWordID1, FollowingWordID2, FollowingWordID3, TrailingWordID1, TrailingWordID2, TrailingWordID3)
                  Values (${idInfo.id}, ${idInfo.followingIds[0]}, ${idInfo.followingIds[1]}, ${idInfo.followingIds[2]}, ${idInfo.trailingIds[0]}, ${idInfo.trailingIds[1]}, ${idInfo.trailingIds[2]})`;

    await this.exec(query);
  }

  private combineDuplicates(words: WordInfo[]): WordInfo[] {
    const output: WordInfo[] = [];
    words.forEach((word, index) => {
      const existingItems = output.filter((w) => w.word === word.word);
      word = existingItems.length ? existingItems[0] : word;
      word.frequency ++;
      word.startFrequency += index === 0 ? 1 : 0;
      word.endFrequency += index === words.length - 1 ? 1 : 0;

      if (!existingItems.length) {
        output.push(word);
      }
    });

    return output;
  }

  newWord = (word: string): WordInfo => {
    return {
      id: 0,
      word: word,
      frequency: 0,
      endFrequency: 0,
      startFrequency: 0,
    }
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

  mapIdInfo = (row: any): IdInfo => {
    return {
      id: row.WordID,
      trailingIds: [
        row.TrailingWordID1,
        row.TrailingWordID2,
        row.TrailingWordID3,
      ],
      followingIds: [
        row.FollowingWordID1,
        row.FollowingWordID2,
        row.FollowingWordID3,
      ],
    };
  };
}
