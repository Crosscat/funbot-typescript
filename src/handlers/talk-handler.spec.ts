import { Substitute, Arg } from '@fluffy-spoon/substitute';
import { expect } from 'chai';

import { TalkHandler } from "./talk-handler";
import { DatabaseHandler, WordInfo } from "../interfaces/data.interfaces";

describe('Talk Handler', () => {
  describe('Keywords', () => {
    it('should determine correct keyword', () => {
      const database = Substitute.for<DatabaseHandler>();
      const handler = new TalkHandler(database);

      database.getInfos(Arg.any()).returns([
        { frequency: 0, word: 'this' } as WordInfo,
        { frequency: 1, word: 'is' } as WordInfo,
        { frequency: 2, word: 'a' } as WordInfo,
        { frequency: 3, word: 'message' } as WordInfo,
      ]);
      const keywords = handler.getKeywords('this is a message');

      expect(keywords.primary.word).to.equal('is');
    });
  });
});
