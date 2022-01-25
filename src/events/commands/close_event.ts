import { registerCommand } from '../../utils/commands';
import { sendError, sendMessage } from '../../utils/embeds';
import { updateEventEmbeds } from '../embeds';
import { events, saveEvents } from '../persistence';

registerCommand('close_event', ['event_close'], message => {
    const messageContent = message.content.replace(/  +/g, ' ');
    const event_id = messageContent.split(' ')[1];

    if (!events.hasOwnProperty(event_id)) {
        sendError(message.channel, "Unable to close event, no such event ID was found");
        return;
    }

    events[event_id].signup_status = 'closed';
    saveEvents();
    updateEventEmbeds(events[event_id]);

    sendMessage(message.channel, `✅ Event ${messageContent.split(' ')[1]} is now closed for sign-ups!`);
    message.react('👍');
});
