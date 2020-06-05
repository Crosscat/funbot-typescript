import { WordInfo, DatabaseHandler } from "../interfaces/data.interfaces";
import { inject, injectable } from "inversify";
import { TYPES } from "../types";

@injectable()
export class TalkHandler {
  private sentenceSizeLimit = 10;

  constructor (
    @inject(TYPES.DatabaseHandler) private database: DatabaseHandler,
  ) { }

  public async handleMessage(message: string): Promise<string> {
    const keywords = await this.getKeywords(message);
    if (keywords == null) return null;
    
    return this.generateSentence(keywords.primary);
  }

  public async getKeywords(message: string) {
    const words = message.split(' ');
    const infos = await this.database.getInfos(words);
    if (infos.includes(undefined)) return null;
    
    const primaryWord = infos.reduce((a: WordInfo, b: WordInfo) => a.frequency < b.frequency && a.frequency > 0 ? a : b);

    return { primary: primaryWord, secondary: null };
  }

  public async generateSentence(keyword: WordInfo): Promise<string> {
    let backwards: WordInfo[] = [];
    let forwards: WordInfo[] = [];
    let secondaryKeyword = await this.database.getNextWord(keyword, null, false);

    // if can find word ahead of keyword
    if (secondaryKeyword != null) {
      backwards = await this.getSentence([secondaryKeyword, keyword], true);
      forwards = await this.getSentence([keyword, secondaryKeyword], false);
    } else {
      secondaryKeyword = await this.database.getNextWord(keyword, null, true);
      
      // if can find word behind keyword
      if (secondaryKeyword != null) {
        backwards = await this.getSentence([keyword, secondaryKeyword], true);
        forwards = await this.getSentence([secondaryKeyword, keyword], false);
      } else {
        // if no words around keyword
        return keyword.word;
      }
    }

    backwards = this.trimSentence(backwards.reverse().slice(0, backwards.length - 2).reverse(), true).reverse();
    forwards = this.trimSentence(forwards.filter(x => x != null), false);

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

  private trimSentence(wordInfos: WordInfo[], isBackwards: boolean): WordInfo[] {
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
