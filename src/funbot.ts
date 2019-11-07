import 'dotenv/config';

import Discord = require('discord.js');
import { MessageHandler } from './handlers/message-handler';
import { IOC } from './ioc';
import { TYPES } from './types';

export class Funbot {
  private discordClient: Discord.Client;
  private messageHandler: MessageHandler;

  constructor() {
    const ioc = new IOC();
    this.discordClient = new Discord.Client();
    this.messageHandler = ioc.get<MessageHandler>(TYPES.MessageHandler);

    this.setupDiscordClient();
  }

  private setupDiscordClient() {
    this.discordClient.login(process.env.DISCORD_TOKEN);

    this.discordClient.on('ready', () => {
      console.log(`Logged in as ${this.discordClient.user.tag}!`);
    });

    this.discordClient.on('message', (msg) => {
      if (msg.author.bot) return;
      if (msg.author.username !== 'Meowgoocat') return;

      this.messageHandler.handleMessage(msg.content).then((response) => {
        if (response) {
          msg.channel.send(response);
        }
      })
    });
  }
}

new Funbot();
