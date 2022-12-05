import { Permissions } from 'discord.js';
import { bot } from '../../bot';
import { makeError, sendMessage } from '../../utils';

bot.registerCommand('delete', ['sweep', 'erase'], async message => {
    const [_user, _msgCount] = bot.parseCommand(message, /(<@.*?> )?(.*)/);
    const user = message.mentions.users.first();
    const msgCount = parseInt(_msgCount) + (user ? 0 : 1);
    const member = await message.guild?.members.fetch(message.author.id);
    bot.startTyping(message.channel);

    setTimeout(async () => {
        if (!member?.permissions.has(Permissions.FLAGS.MANAGE_MESSAGES)) {
            return bot.replyTo(message, bot.COLORS.ERROR, makeError("Sorry, but you don't have permission to do that"));
        } else if (msgCount <= 0) {
            return bot.replyTo(message, bot.COLORS.ERROR, 'Please specify the number of messages to delete (must be between 1 and 30)');
        } else if (msgCount > 31) {
            return bot.replyTo(message, bot.COLORS.ERROR, 'Please specify the number of messages to delete (must be between 1 and 30)');
        }
    
        if (user) {
            let messages = await message.channel.messages.fetch({ limit: 100 });
            messages = messages.filter(x => x.author.id === user.id).first(msgCount);
    
            let bulkDelete = await message.channel.bulkDelete(messages);
            sendMessage(message.channel, `Deleted ${bulkDelete.size} messages from <@${user.id}> (requested by <@${message.author.id}>)`)
        } else {
            let bulkDelete = await message.channel.bulkDelete(msgCount);
            sendMessage(message.channel, `Deleted ${bulkDelete.size} messages (requested by <@${message.author.id}>)`);
        }
    }, 300);
});
