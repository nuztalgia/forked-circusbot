import { eventCreationHandler } from './events/creator';
import { threadCreationHandler } from './threads/thread_creator';
import { registerEventReactions } from './events/reaction_signups';
import { antispamHandler } from './misc/antispam';
import { easterEggHandler } from './misc/easter_eggs';
import { cannedReplyHandler } from './cannedreplies/listener';
import { log } from './utils';
import { client } from './client';
import { DMChannel, TextChannel } from 'discord.js';
import { bot } from './bot';

import './admin/removed_member_log';
import './admin/welcome_channel';
import './admin/commands';
import './cannedreplies/commands';
import './events/commands';
import './threads/commands';
import './misc/commands';

client.on('ready', async () => {
  log('info', `Logged in as ${client?.user?.tag}!`);

  client.guilds.cache.forEach(async guild => {
    log('debug', `Fetching members for server '${guild.name}'`);
    await guild.members.fetch();
    log('debug', `Finished fetching members for server '${guild.name}'`);
  });
});

client.on('messageUpdate', async (message) => {
    // Easter egg - emote only channel
    // TODO: Move into separate handler
    if (message.channel instanceof TextChannel && message.channel.name.includes('emotes-only')) {
        message.delete();
    }
});

client.on('messageCreate', async (message) => {
    // In development mode, ignore messages unless listed in BOT_DEVS to avoid duplicate responses
    // from CircusBot (e.g. if both the prod and dev bots respond).
    if (process.env.MODE === 'development' && !bot.config.BOT_DEVS.includes(message.author.id)) {
        return;
    }

    // Ignore messages written by other bots
    if (message.author.bot) {
        return;
    }

    // Easter egg - emote only channel
    // TODO: Move into separate handler
    if (message.channel instanceof TextChannel && message.channel.name.includes('emotes-only')) {
        const text = message.content.replace(/<a?:.+?:\d+>|\p{Extended_Pictographic}/gu, '').replace(/\s+/g, '');

        if (text) {
            console.log(`Deleting message from ${message.channel.name} by ${message.author.tag}: ${message.content}`);
            message.delete();
        }
    }

    // If it's a registered command, call the command handler
    if (bot.isValidCommand(message.content)) {
        bot.runCommand(message);
        return;
    }

    // Check if it's a DM
    if (message.channel instanceof DMChannel) {
        log('info', `New DM from ${message.author.tag}: ${message.content}`);
        return;
    }

    // If the message isn't a registered command, delegate to the event/thread creation wizards
    // in case we are in the process of creating an event/thread.
    eventCreationHandler(message);
    threadCreationHandler(message);
    antispamHandler(message);
    easterEggHandler(message);
    cannedReplyHandler(message, true);
});

if (process.env.MODE === 'development') {
    console.log('Disabling event reaction handler in development mode');
    // registerEventReactions(client);
} else {
    registerEventReactions(client);
}

process.on('unhandledRejection', error => {
    console.error('Unhandled rejection: ', error);
});

client.login(bot.config.BOT_TOKEN);
