import { EMBED_ERROR_COLOR, EMBED_INFO_COLOR, EMOJI_ERROR, parseCommand, registerCommand, sendReply } from '../../utils';
import { queueEventUpdate } from '../embeds';
import { findEvent } from '../persistence';

registerCommand('refresh_event', ['rebuild_event', 're'], async message => {
    const [eventId] = parseCommand(message, /([0-9]+)/);
    const event = findEvent(eventId);

    if (!event) {
        sendReply(message, EMBED_ERROR_COLOR, `${EMOJI_ERROR} Unable to close event, invalid event ID provided`);
        return;
    }
    
    message.channel.sendTyping();
    await queueEventUpdate(event);
    sendReply(message, EMBED_INFO_COLOR, `✅ [${event.title}](${message.url.replace(message.id, eventId)}) has been re-rendered and updated across all channels`);
});
