import { MessageEmbed } from 'discord.js';
import { bot } from '../../bot';
import { EMBED_ERROR_COLOR, EMBED_INFO_COLOR, EMBED_SUCCESS_COLOR, makeError, sendReply } from '../../utils';
import { cannedReplies, saveCannedReplies } from '../listener';

bot.registerCommand('crlock', [], message => {
    const [name] = bot.parseCommand(message, /=?(.*)/);

    if (!name) {
        bot.replyTo(message, EMBED_ERROR_COLOR, makeError('Please specify the name of the canned reply to lock'));
        return;
    } else if (!cannedReplies[message.guildId].hasOwnProperty(name)) {
        bot.replyTo(message, EMBED_ERROR_COLOR, makeError('No such canned reply'));
        return;
    }

    cannedReplies[message.guildId][name].locked = true;
    saveCannedReplies();
    bot.replyTo(message, EMBED_SUCCESS_COLOR, `✅ =${name} has now been locked and can only be edited from command channels such as this one`);
});
