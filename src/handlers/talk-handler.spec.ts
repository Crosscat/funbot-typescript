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
      const thisInfo: WordInfo = { ...mockInfo, word: 'this' };
      const isInfo: WordInfo = { ...mockInfo, word: 'is' };
      const aInfo: WordInfo = { ...mockInfo, word: 'a' };
      const messageInfo: WordInfo = { ...mockInfo, word: 'message' };

      const infos = [thisInfo, isInfo, aInfo, messageInfo];
      for (let i = 0; i < 4; i++) {
        if (i < 3) {
          database.getNextWord(Arg.is(arg => _.isEqual(arg, infos[i])), null, false).returns(Promise.resolve(infos[i+1])); // get secondary keyword
        } else {
          database.getNextWord(Arg.is(arg => _.isEqual(arg, infos[i])), null, false).returns(Promise.resolve(null)); // get secondary keyword
          database.getNextWord(null, Arg.is(arg => _.isEqual(arg, infos[i])), true).returns(Promise.resolve(infos[i-1])); // get secondary keyword
        }

        if (i < 2) {
          database.getNextWord(Arg.is(arg => _.isEqual(arg, infos[i])), Arg.is(arg => _.isEqual(arg, infos[i+1])), false).returns(Promise.resolve(infos[i+2])); // get subsequent word
        } else {
          database.getNextWord(Arg.is(arg => _.isEqual(arg, infos[i])), Arg.is(arg => _.isEqual(arg, infos[i+1])), false).returns(Promise.resolve(null)); // get subsequent word
        }

        if (i > 1) {
          database.getNextWord(Arg.is(arg => _.isEqual(arg, infos[i])), Arg.is(arg => _.isEqual(arg, infos[i-1])), true).returns(Promise.resolve(infos[i-2])); // get previous word
        } else {
          database.getNextWord(Arg.is(arg => _.isEqual(arg, infos[i])), Arg.is(arg => _.isEqual(arg, infos[i-1])), true).returns(null); // get previous word
          database.getNextWord(Arg.is(arg => _.isEqual(arg, infos[i])), null, true).returns(Promise.resolve(null));
        }
      }

      database.getInfos(Arg.is(arg => _.isEqual(arg, ['this']))).returns(Promise.resolve([thisInfo]));
      database.getInfos(Arg.is(arg => _.isEqual(arg, ['is']))).returns(Promise.resolve([isInfo]));
      database.getInfos(Arg.is(arg => _.isEqual(arg, ['a']))).returns(Promise.resolve([aInfo]));
      database.getInfos(Arg.is(arg => _.isEqual(arg, ['message']))).returns(Promise.resolve([messageInfo]));
      
      await expect(handler.handleMessage('this')).to.eventually.equal('this is a message');
      await expect(handler.handleMessage('is')).to.eventually.equal('this is a message');
      await expect(handler.handleMessage('a')).to.eventually.equal('this is a message');
      await expect(handler.handleMessage('message')).to.eventually.equal('this is a message');
    });
  });
});
