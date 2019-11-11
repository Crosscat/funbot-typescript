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

  afterEach(() => {
    handler.disconnect();
  })
});
