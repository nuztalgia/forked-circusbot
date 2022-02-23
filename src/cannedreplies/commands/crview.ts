import { EMBED_ERROR_COLOR, EMBED_INFO_COLOR, makeError, parseCommand, registerCommand, sendReply } from '../../utils';
import { cannedReplies, renderCannedReply } from '../listener';

registerCommand('crview', [], message => {
    const [name] = parseCommand(message, /=?(.*)/);
    const guildId = message.guildId || '*';

    if (!cannedReplies[guildId].hasOwnProperty(name)) {
        sendReply(message, EMBED_ERROR_COLOR, makeError('No such canned reply'));
        return;
    }

    const embed = renderCannedReply(cannedReplies[guildId][name])
        .setFooter({ text: 'This message will be automatically updated when the canned reply is updated' });

    sendReply(message, EMBED_INFO_COLOR, embed);
});
