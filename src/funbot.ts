import 'dotenv/config';

import Discord = require('discord.js');
import { MessageHandler } from './handlers/message-handler';
import { IOC } from './ioc';
import { TYPES } from './types';
import { DatabaseHandler } from './interfaces/data.interfaces';

export class Funbot {
  private discordClient: Discord.Client;
  private messageHandler: MessageHandler;
  private database: DatabaseHandler;

  private ignoredChannels: string[];

  constructor() {
    const ioc = new IOC();
    this.discordClient = new Discord.Client();
    this.messageHandler = ioc.get<MessageHandler>(TYPES.MessageHandler);
    this.database = ioc.get<DatabaseHandler>(TYPES.DatabaseHandler);

    this.parseIgnoredChannels();
    this.setupDatabase();
    this.setupDiscordClient();
  }

  private setupDiscordClient() {
    this.discordClient.login(process.env.DISCORD_TOKEN);

    this.discordClient.on('ready', () => {
      console.log(`Logged in as ${this.discordClient.user.tag}!`);
    });

    this.ignoredChannels.forEach(x => console.log(`Ignoring channel ${x}`));

    this.discordClient.on('message', (msg) => {
      if (msg.author.bot) return;
      if (this.ignoredChannels.includes(msg.channel.id)) return;
      if (msg.author.username !== 'Meowgoocat') return;

      this.messageHandler.handleMessage(msg.content).then((response) => {
        if (response) {
          msg.channel.send(response);
        }
      })
    });
  }

  private setupDatabase() {
    this.database.connect(process.env.DATABASE_PATH);
  }

  private parseIgnoredChannels() {
    this.ignoredChannels = process.env.IGNORED_CHANNELS?.split(',').map(x => x.trim());
  }
}

new Funbot();
