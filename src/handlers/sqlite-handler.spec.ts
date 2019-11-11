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
      { id: 4, trailingIds: [ 1, 2, 3 ], followingIds: [ 5, 6, 0 ] },
      { id: 5, trailingIds: [ 2, 3, 4 ], followingIds: [ 6, 0, 0 ] },
      { id: 6, trailingIds: [ 3, 4, 5 ], followingIds: [ 0, 0, 0 ] },
    ]);
  });

  afterEach(() => {
    handler.disconnect();
  });
});
