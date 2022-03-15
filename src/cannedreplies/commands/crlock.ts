import { bot } from '../../bot';
import { makeError } from '../../utils';
import { cannedReplies, saveCannedReplies } from '../listener';

bot.registerCommand('crlock', [], message => {
    const [name] = bot.parseCommand(message, /=?(.*)/);

    if (!name) {
        bot.replyTo(message, bot.COLORS.ERROR, makeError('Please specify the name of the canned reply to lock'));
        return;
    } else if (!cannedReplies[message.guildId || message.channelId].hasOwnProperty(name)) {
        bot.replyTo(message, bot.COLORS.ERROR, makeError('No such canned reply'));
        return;
    }

    cannedReplies[message.guildId || message.channelId][name].locked = true;
    saveCannedReplies();
    bot.replyTo(message, bot.COLORS.SUCCESS, `✅ =${name} has now been locked and can only be edited from command channels such as this one`);
});
