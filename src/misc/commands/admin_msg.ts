import { TextChannel } from 'discord.js';
import { client } from '../../client';
import { registerCommand, parseCommand } from '../../utils';

registerCommand('admin_msg', [], async message => {
    if (message.author.id !== '200716538729201664') return;
        
    let [channelId, msg] = parseCommand(message, /(.*?) (.*)/);
    const channel = await client.channels.fetch(channelId) as TextChannel;

    await channel.send(msg);
    message.react('👍');
});
