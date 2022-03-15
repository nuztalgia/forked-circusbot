import { Message, TextChannel } from 'discord.js';
import { bot } from '../../bot';
import { client } from '../../client';

bot.registerCommand('admin_msg', ['msg'], async message => {
    if (!(message instanceof Message) || message.author.id !== '200716538729201664') return;
        
    let [channelId, timeDelay, textMsg] = bot.parseCommand(message, /(.*?) (@[0-9]+ )?(.*)/);
    const channel = await client.channels.fetch(channelId) as TextChannel;

    const msg = await channel.send(textMsg);
    message.react('👍');

    if (timeDelay) {
        setTimeout(() => {
            msg.delete();
        }, parseInt(timeDelay.substring(1)) * 1000);
    }
});
