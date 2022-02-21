import { EMBED_ERROR_COLOR, EMBED_SUCCESS_COLOR, makeError, parseCommand, registerCommand, sendReply } from '../../utils';
import { cannedReplies, saveCannedReplies } from '../listener';

registerCommand('crunlock', [], message => {
    const [name] = parseCommand(message, /=?(.*)/);

    if (!cannedReplies[message.guildId].hasOwnProperty(name)) {
        sendReply(message, EMBED_ERROR_COLOR, makeError('No such canned reply'));
        return;
    }

    cannedReplies[message.guildId][name].locked = false;
    saveCannedReplies();
    sendReply(message, EMBED_SUCCESS_COLOR, `✅ =${name} has now been unlocked and can only be edited from any channel`);
});
