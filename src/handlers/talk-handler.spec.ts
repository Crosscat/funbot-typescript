import 'reflect-metadata';

import { Substitute, Arg, SubstituteOf } from '@fluffy-spoon/substitute';
import { expect } from 'chai';

import { TalkHandler } from "./talk-handler";
import { DatabaseHandler, WordInfo } from "../interfaces/data.interfaces";

describe('Talk Handler', () => {
  let database: SubstituteOf<DatabaseHandler>;
  let handler: TalkHandler;
  
  beforeEach(() => {
    database = Substitute.for<DatabaseHandler>();
    database.connect(Arg.any()).mimicks(() => {});
    handler = new TalkHandler(database);
  });

  describe('Keywords', () => {
    it('should determine correct keyword', async () => {
      database.getInfos(Arg.any()).returns(new Promise<WordInfo[]>((resolve) => resolve([
        { frequency: 0, word: 'this' } as WordInfo,
        { frequency: 1, word: 'is' } as WordInfo,
        { frequency: 2, word: 'a' } as WordInfo,
        { frequency: 3, word: 'message' } as WordInfo,
      ])));
      const keywords = await handler.getKeywords('this is a message');

      expect(keywords.primary.word).to.equal('is');
    });
  });
});
