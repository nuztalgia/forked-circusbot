import { eventCreationHandler } from './events/creator';
import { registerEventReactions } from './events/reaction_signups';
import { client } from './client';
import { log } from './utils/logging';
import { isValidCommand, runCommand } from './utils/commands';
import config from '../config.json';

import './events/commands/create_event';
import './events/commands/quick_create';
import './events/commands/edit_event';
import './events/commands/open_event';
import './events/commands/close_event';
import './events/commands/list_events';
import './events/commands/refresh_event';
import './events/commands/event_adduser';
import './events/commands/event_removeuser';
import './events/commands/publish_event';
import './events/commands/ping_event';
import './events/commands/export_event';
import './events/commands/event_help';
import './events/commands/register_slash_commands';

client.on('ready', () => {
  log('info', `Logged in as ${client?.user?.tag}!`);
});

client.on('messageCreate', async (message) => {
    if (message.author.bot) {
        return;
    }

    if (isValidCommand(message.content)) {
        runCommand(message);
        return;
    }

    eventCreationHandler(message);
});

registerEventReactions(client);

process.on('unhandledRejection', error => {
    console.error('Unhandled rejection: ', error);
});

client.login(config.BOT_TOKEN);
