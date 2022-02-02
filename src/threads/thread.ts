

import { MessageEmbed, TextChannel } from 'discord.js';
import { registerCommand } from '../utils/commands';
import { log } from '../utils/logging';

registerCommand('test', [], async message => {
    let target = message.mentions.channels.first() as TextChannel;

    if (target?.isText()) {
        const thread = target.threads.cache.find(x => x.name === 'Lockout');
        console.log(thread);

        if (thread.joinable) await thread.join();
    } else {
        log('warn', 'Not a text channel');
    }
});