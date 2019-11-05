import 'dotenv/config';

import Discord = require('discord.js');
import { MessageHandler } from './message-handlers/message-handler';

export class Funbot {
  private discordClient: Discord.Client;
  private messageHandler: MessageHandler;

  constructor() {
    this.discordClient = new Discord.Client();
    this.messageHandler = new MessageHandler();

    this.setupDiscordClient();
  }

  private setupDiscordClient() {
    console.log('token: ' + process.env.DISCORD_TOKEN);
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
