import { eventCreationHandler } from './events/creator';
import { threadCreationHandler } from './threads/thread_creator';
import { registerEventReactions } from './events/reaction_signups';
import { isValidCommand, runCommand, log } from './utils';
import { client } from './client';
import config from '../config.json';

import './events/commands';
import './threads/commands';

client.on('ready', () => {
  log('info', `Logged in as ${client?.user?.tag}!`);
});

client.on('messageCreate', async (message) => {
    // Ignore messages written by other bots
    if (message.author.bot) {
        return;
    }

    // If it's a registered command, call the command handler
    if (isValidCommand(message.content)) {
        runCommand(message);
        return;
    }

    // If the message isn't a registered command, delegate to the event/thread creation wizards
    // in case we are in the process of creating an event/thread.
    eventCreationHandler(message);
    threadCreationHandler(message);
});

registerEventReactions(client);

process.on('unhandledRejection', error => {
    console.error('Unhandled rejection: ', error);
});

client.login(config.BOT_TOKEN);
