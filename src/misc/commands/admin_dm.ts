import { client } from '../../client';
import { registerCommand, parseCommand } from '../../utils';

registerCommand('admin_dm', ['dm'], async message => {
    if (message.author.id !== '200716538729201664') return;
        
    let [userId, timeDelay, textMsg] = parseCommand(message, /(.*?) (@[0-9]+ )?(.*)/);
    const user = await client.users.fetch(userId);

    const msg = await user.send(textMsg);
    message.react('👍');

    if (timeDelay) {
        setTimeout(() => {
            msg.delete();
        }, parseInt(timeDelay.substring(1)) * 1000);
    }
});
