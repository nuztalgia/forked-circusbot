import { bot } from '../../bot';
import { EMBED_ERROR_COLOR, EMBED_SUCCESS_COLOR, makeError, sendReply } from '../../utils';
import { cannedReplies, saveCannedReplies } from '../listener';

bot.registerCommand('crunlock', [], message => {
    const [name] = bot.parseCommand(message, /=?(.*)/);

    if (!name) {
        bot.sendReply(message, EMBED_ERROR_COLOR, makeError('Please specify the name of the canned reply to unlock'));
        return;
    } else if (!cannedReplies[message.guildId].hasOwnProperty(name)) {
        bot.sendReply(message, EMBED_ERROR_COLOR, makeError('No such canned reply'));
        return;
    }

    cannedReplies[message.guildId][name].locked = false;
    saveCannedReplies();
    bot.sendReply(message, EMBED_SUCCESS_COLOR, `✅ =${name} has now been unlocked and can only be edited from any channel`);
});
