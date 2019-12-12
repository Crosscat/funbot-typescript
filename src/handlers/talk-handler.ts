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
    const keywords = await this.getKeywords(message);
    
    return this.generateSentence(keywords.primary);
  }

  public async getKeywords(message: string) {
    const infos = await this.database.getInfos(message.split(' '));
    if (!infos.length) return null;
    
    const primaryWord = infos.reduce((a: WordInfo, b: WordInfo) => a.frequency < b.frequency && a.frequency > 0 ? a : b);

    return { primary: primaryWord, secondary: null };
  }

  public async generateSentence(keyword: WordInfo): Promise<string> {
    const forwards = await this.getSentence(keyword, keyword.word, false, 1);
    const backwards = await this.getSentence(keyword, '', true, 1);

    return backwards + forwards;
  }

  private async getSentence(word: WordInfo, sentence: string, backwards: boolean = false, distance: number = 2): Promise<string> {
    const shouldStop = true;
    if (shouldStop) {
      return backwards ? sentence : this.reverseSentence(sentence);
    }

    const nextWord = this.database.getNextWord(word, backwards, distance);

    return this.getSentence(nextWord, sentence + nextWord, )
  }

  private reverseSentence(sentence: string): string {
    const reversed = [];
    sentence.split(' ').forEach((word) => {
      reversed.unshift(word);
    });

    return reversed.join(' ');
  }
}
