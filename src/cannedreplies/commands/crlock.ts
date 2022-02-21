import { MessageEmbed } from 'discord.js';
import { EMBED_ERROR_COLOR, EMBED_INFO_COLOR, EMBED_SUCCESS_COLOR, makeError, parseCommand, registerCommand, sendReply } from '../../utils';
import { cannedReplies, saveCannedReplies } from '../listener';

registerCommand('crlock', [], message => {
    const [name] = parseCommand(message, /=?(.*)/);

    if (!cannedReplies[message.guildId].hasOwnProperty(name)) {
        sendReply(message, EMBED_ERROR_COLOR, makeError('No such canned reply'));
        return;
    }

    cannedReplies[message.guildId][name].locked = true;
    saveCannedReplies();
    sendReply(message, EMBED_SUCCESS_COLOR, `✅ =${name} has now been locked and can only be edited from command channels such as this one`);
});
