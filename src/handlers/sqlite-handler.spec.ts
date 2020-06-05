import 'reflect-metadata';
import 'dotenv/config';

import { Database } from "sqlite3";
import * as fs from 'fs';
import { expect } from 'chai';

import { SqLiteHandler } from "./sqlite-handler";

describe('sql-lite handler', () => {
  let handler: SqLiteHandler;
  
  beforeEach(() => {
    handler = new SqLiteHandler(new Database(':memory:'));
    const sql = fs.readFileSync('db-setup.sql').toString();
    handler.exec(sql);
  });

  it('should insert and get words', async () => {
    await handler.updateWords('this this is a test'.split(' '));
    const infos = await handler.getInfos('this is a test'.split(' '));
    
    expect(infos).to.deep.equal([{
      id: 1,
      word: 'this',
      frequency: 2,
      startFrequency: 1,
      endFrequency: 0,
    },{
      id: 2,
      word: 'is',
      frequency: 1,
      startFrequency: 0,
      endFrequency: 0,
    },{
      id: 3,
      word: 'a',
      frequency: 1,
      startFrequency: 0,
      endFrequency: 0,
    },{
      id: 4,
      word: 'test',
      frequency: 1,
      startFrequency: 0,
      endFrequency: 1,
    }]);
  });

  it('should track id order', async () => {
    const words = 'this is a fairly long id test'.split(' ');
    await handler.updateWords(words);
    const infos = await handler.getInfos(words);
    const idInfos = await handler.getIdInfos(infos);

    expect(idInfos).to.deep.equal([
      { id: 1, trailingIds: [ 0, 0, 0 ], followingIds: [ 2, 3, 4 ] },
      { id: 2, trailingIds: [ 0, 0, 1 ], followingIds: [ 3, 4, 5 ] },
      { id: 3, trailingIds: [ 0, 1, 2 ], followingIds: [ 4, 5, 6 ] },
      { id: 4, trailingIds: [ 1, 2, 3 ], followingIds: [ 5, 6, 7 ] },
      { id: 5, trailingIds: [ 2, 3, 4 ], followingIds: [ 6, 7, 0 ] },
      { id: 6, trailingIds: [ 3, 4, 5 ], followingIds: [ 7, 0, 0 ] },
      { id: 7, trailingIds: [ 4, 5, 6 ], followingIds: [ 0, 0, 0 ] },
    ]);
  });

  it('should get next and previous word', async () => {
    const words = 'this is a test'.split(' ');
    await handler.updateWords(words);
    const infos = await handler.getInfos(['is', 'a']);
    
    const nextWord = await handler.getNextWord(infos[0], infos[1], false);
    expect(nextWord.word).to.equal('test');
    
    const previousWord = await handler.getNextWord(infos[1], infos[0], true);
    expect(previousWord.word).to.equal('this');
  });

  it('should return empty if no next word', async () => {
    const words = 'this test'.split(' ');
    await handler.updateWords(words);
    const infos = await handler.getInfos(words);

    const nextWord = await handler.getNextWord(infos[0], infos[1], false);
    expect(nextWord).to.equal(null);
  });

  it('should return empty if no previous word (single word)', async () => {
    const words = ['test'];
    await handler.updateWords(words);
    const infos = await handler.getInfos(words);

    const prevWord = await handler.getNextWord(null, infos[0], true);
    expect(prevWord).to.equal(null);
  })

  it('should return empty if unable to match following word', async () => {
    const words = 'this is a test'.split(' ');
    await handler.updateWords(words);
    await handler.updateWords(['not']);
    const infos = await handler.getInfos(['is', 'not']);

    const nextWord = await handler.getNextWord(infos[0], infos[1], false);
    expect(nextWord).to.equal(null);
  });

  it('should get next word if no following word', async () => {
    const words = 'this test'.split(' ');
    await handler.updateWords(words);
    const infos = await handler.getInfos(['this']);

    const nextWord = await handler.getNextWord(infos[0], null, false);
    expect(nextWord.word).to.equal('test');
  })

  afterEach(() => {
    handler.disconnect();
  });
});
