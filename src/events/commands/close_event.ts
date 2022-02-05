import { parseCommand, registerCommand } from '../../utils/commands';
import { EMBED_ERROR_COLOR, EMBED_SUCCESS_COLOR, EMOJI_ERROR, sendReply } from '../../utils/embeds';
import { findEvent, updateEvent } from '../persistence';

registerCommand('close_event', ['event_close'], message => {
    const [eventId] = parseCommand(message, /([0-9]+)/);
    const event = findEvent(eventId);

    if (!event) {
        sendReply(message, EMBED_ERROR_COLOR, `${EMOJI_ERROR} Unable to close event, invalid event ID provided`);
        return;
    }

    updateEvent(eventId, {
        signup_status: 'closed'
    });

    sendReply(message, EMBED_SUCCESS_COLOR, `✅ [${event.title}](${message.url.replace(message.id, eventId)}) is now closed for sign-ups (it may take several seconds to remove reactions)`);
});
