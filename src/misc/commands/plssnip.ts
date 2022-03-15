import { bot } from '../../bot';

bot.registerCommand('plssnip', [''], async message => {
    const messages = await message.channel.messages.fetch({ limit: 25 });

    for (let [_id, m] of messages) {
        if (m.content.trim().match(/<:pantsgrab:[0-9]+>/i)) {
            m.delete();
            message.react('👍')
            break;
        }
    }
});
