import { WordInfo, DatabaseHandler } from "../interfaces/data.interfaces";
import { inject, injectable } from "inversify";
import { TYPES } from "../types";

@injectable()
export class TalkHandler {
  private sentenceSizeLimit = 10;

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
    const words = message.split(' ');
    const infos = await this.database.getInfos(words);
    if (!infos.length) return null;
    
    const primaryWord = infos.reduce((a: WordInfo, b: WordInfo) => a.frequency < b.frequency && a.frequency > 0 ? a : b);

    return { primary: primaryWord, secondary: null };
  }

  public async generateSentence(keyword: WordInfo): Promise<string> {
    const secondaryKeyword = await this.database.getNextWord(keyword, null, false);
    let forwards = await this.getSentence([keyword, secondaryKeyword], false);
    let backwards = await this.getSentence([secondaryKeyword, keyword], true);

    forwards = this.trimSentence(forwards.filter(x => x != null), false);
    backwards = this.trimSentence(backwards.reverse().slice(0, backwards.length - 2), true);

    return backwards.concat(forwards).map((ele) => ele.word).join(' ');
  }

  private async getSentence(sentence: WordInfo[], isBackwards: boolean = false): Promise<WordInfo[]> {
    const nextWord = await this.database.getNextWord(sentence[sentence.length - 2], sentence[sentence.length - 1], isBackwards);
    
    if (nextWord === null || sentence.length > this.sentenceSizeLimit / 2) {
      return sentence;
    }

    sentence.push(nextWord);

    return await this.getSentence(sentence, isBackwards);
  }

  private trimSentence(wordInfos: WordInfo[], isBackwards: boolean) {
    if (!wordInfos || !wordInfos.length) return wordInfos;

    let maxPercent = isBackwards ? wordInfos[0].startFrequency / wordInfos[0].frequency : wordInfos[0].endFrequency / wordInfos[0].frequency;
    let maxIndex = 0;
    for (let i = 0; i < wordInfos.length; i++) {
      let word = wordInfos[i];
      if (isBackwards && word.startFrequency / word.frequency < maxPercent
        || !isBackwards && word.endFrequency / word.frequency < maxPercent) {
        continue;
      }
      
      maxIndex = i;
    }

    return wordInfos.slice(0, maxIndex + 1);
  }
}
