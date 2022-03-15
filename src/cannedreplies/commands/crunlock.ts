import { bot } from '../../bot';
import { makeError } from '../../utils';
import { cannedReplies, saveCannedReplies } from '../listener';

bot.registerCommand('crunlock', [], message => {
    const [name] = bot.parseCommand(message, /=?(.*)/);

    if (!name) {
        bot.replyTo(message, bot.COLORS.ERROR, makeError('Please specify the name of the canned reply to unlock'));
        return;
    } else if (!cannedReplies[message.guildId || message.channelId].hasOwnProperty(name)) {
        bot.replyTo(message, bot.COLORS.ERROR, makeError('No such canned reply'));
        return;
    }

    cannedReplies[message.guildId || message.channelId][name].locked = false;
    saveCannedReplies();
    bot.replyTo(message, bot.COLORS.SUCCESS, `✅ =${name} has now been unlocked and can only be edited from any channel`);
});
