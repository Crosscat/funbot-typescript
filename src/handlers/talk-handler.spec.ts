import 'reflect-metadata';

import _ from 'lodash';
import { Substitute, Arg, SubstituteOf } from '@fluffy-spoon/substitute';
import chai, { expect } from 'chai';
import chaiAsPromised from 'chai-as-promised';

import { TalkHandler } from "./talk-handler";
import { DatabaseHandler, WordInfo } from "../interfaces/data.interfaces";

chai.use(chaiAsPromised);

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
      database.getInfos(Arg.any()).returns(Promise.resolve([
        { frequency: 0, word: 'this' } as WordInfo,
        { frequency: 1, word: 'is' } as WordInfo,
        { frequency: 2, word: 'a' } as WordInfo,
        { frequency: 3, word: 'message' } as WordInfo,
      ]));
      const keywords = await handler.getKeywords('this is a message');

      expect(keywords.primary.word).to.equal('is');
    });

    it('should generate correct message', async () => { // holy cow this test
      const mockInfo: WordInfo = { word: '', id: 1, frequency: 1, startFrequency: 0, endFrequency: 0 };
      const a: WordInfo = { ...mockInfo, word: 'a' };
      const b: WordInfo = { ...mockInfo, word: 'b' };
      const c: WordInfo = { ...mockInfo, word: 'c' };
      const d: WordInfo = { ...mockInfo, word: 'd' };

      // get secondary keywords
      nextWordMock(a, null, false, b);
      nextWordMock(b, null, false, c);
      nextWordMock(c, null, false, d);
      nextWordMock(d, null, false, null);
      nextWordMock(a, null, true, null);
      nextWordMock(b, null, true, a);
      nextWordMock(c, null, true, b);
      nextWordMock(d, null, true, c);

      // subsequent words
      nextWordMock(a, b, false, c);
      nextWordMock(b, c, false, d);
      nextWordMock(c, d, false, null);
      
      nextWordMock(a, b, true, null);
      nextWordMock(b, c, true, a);
      nextWordMock(c, d, true, b);

      nextWordMock(b, a, false, c);
      nextWordMock(c, b, false, d);
      nextWordMock(d, c, false, null);
      
      nextWordMock(b, a, true, null);
      nextWordMock(c, b, true, a);
      nextWordMock(d, c, true, b);

      database.getInfos(Arg.is(arg => _.isEqual(arg, ['a']))).returns(Promise.resolve([a]));
      database.getInfos(Arg.is(arg => _.isEqual(arg, ['b']))).returns(Promise.resolve([b]));
      database.getInfos(Arg.is(arg => _.isEqual(arg, ['c']))).returns(Promise.resolve([c]));
      database.getInfos(Arg.is(arg => _.isEqual(arg, ['d']))).returns(Promise.resolve([d]));
      
      await expect(handler.handleMessage('a')).to.eventually.equal('a b c d');
      await expect(handler.handleMessage('b')).to.eventually.equal('a b c d');
      await expect(handler.handleMessage('c')).to.eventually.equal('a b c d');
      await expect(handler.handleMessage('d')).to.eventually.equal('a b c d');
    });
    
    const nextWordMock = function(keyword: WordInfo, secondary: WordInfo, backwards: boolean, result: WordInfo) {
      database.getNextWord(
        Arg.is(arg => _.isEqual(arg, keyword)),
        Arg.is(arg => _.isEqual(arg, secondary)),
        backwards,
      ).returns(Promise.resolve(result));
    }
  });
});
