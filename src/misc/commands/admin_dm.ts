import { Message } from 'discord.js';
import { bot } from '../../bot';
import { client } from '../../client';

bot.registerCommand('admin_dm', ['dm'], async message => {
    if (!(message instanceof Message) || message.author.id !== '200716538729201664') return;
        
    let [userId, timeDelay, textMsg] = bot.parseCommand(message, /(.*?) (@[0-9]+ )?(.*)/);
    const user = await client.users.fetch(userId);

    const msg = await user.send(textMsg);
    message.react('👍');

    if (timeDelay) {
        setTimeout(() => {
            msg.delete();
        }, parseInt(timeDelay.substring(1)) * 1000);
    }
});
