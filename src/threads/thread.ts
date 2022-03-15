

import { TextChannel } from 'discord.js';
import { bot } from '../bot';
import { log } from '../utils/logging';

bot.registerCommand('test', [], async message => {
    let target = message.mentions.channels.first() as TextChannel;

    if (target?.isText()) {
        const thread = target.threads.cache.find(x => x.name === 'Lockout');
        console.log(thread);

        if (thread.joinable) await thread.join();
    } else {
        log('warn', 'Not a text channel');
    }
});