import { parseCommand, registerCommand } from '../../utils/commands';
import { sendError, sendMessage } from '../../utils/embeds';
import { events, updateEvent } from '../persistence';

registerCommand('close_event', ['event_close'], message => {
    const [eventId] = parseCommand(message, /([0-9]+)/);

    if (!events.hasOwnProperty(eventId)) {
        sendError(message.channel, "Unable to close event, no such event ID was found");
        return;
    }

    updateEvent(eventId, {
        signup_status: 'closed'
    });

    sendMessage(message.channel, `✅ [${events[eventId].title}](${message.url.replace(message.id, eventId)}) is now closed for sign-ups (it may take several seconds to remove reactions)`);
});
