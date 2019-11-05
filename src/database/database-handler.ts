import 'dotenv/config';

import sqlite3 = require('sqlite3');

export class DatabaseHandler {
  public test() {
    const db = new sqlite3.Database(process.env.DATABASE_PATH);

    db.serialize(() => {
      db.get('select * from Words', (err, row) => {
        if (err) {
          console.error(err.message);
        }
        console.log('queried row: ' + JSON.stringify(row));
      });
    });

    db.close();

    return 'oof';
  }
}
