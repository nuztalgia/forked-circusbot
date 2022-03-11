import { Message } from 'discord.js';
import { registerCommand } from '../../utils';

registerCommand('plssnip', [''], async message => {
    if (!(message instanceof Message)) {
        return;
    }

    const messages = await message.channel.messages.fetch({ limit: 25 });

    for (let [_id, m] of messages) {
        if (m.content.trim().match(/<:pantsgrab:[0-9]+>/i)) {
            m.delete();
            message.react('👍')
            break;
        }
    }
});
