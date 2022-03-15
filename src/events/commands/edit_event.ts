import { Message, TextBasedChannel } from 'discord.js';
import { bot } from '../../bot';
import { EMBED_ERROR_COLOR, EMOJI_ERROR, sendReply } from '../../utils';
import { updateEventEmbeds } from '../embeds';
import { events, findEvent, saveEvents } from '../persistence';

function editEventUsage(message: Message<boolean>) {
    bot.replyTo(message, EMBED_ERROR_COLOR, `${EMOJI_ERROR} Incorrect syntax to edit event. Correct usage:\n\n` +
        "`!edit_event <eventId> <FIELD_NAME> <NEW VALUE>`\n\n" +
        "Example:\n\n" +
        "`!edit_event 123456789 tank_requirements Previous tank clear in 8m required`\n\n" +
        "Valid fields:\n\n" +
        " - title\n" + 
        " - description\n" +
        " - date\n" +
        " - time\n" +
        " - tank_requirements\n" +
        " - healer_requirements\n" + 
        " - dps_requirements\n" + 
        " - tank_limit\n" +
        " - healer_limit\n" + 
        " - dps_limit");
}

bot.registerCommand('edit_event', ['event_edit', 'ee'], message => {
    const [eventId, eventField, eventValue] = bot.parseCommand(message, /([0-9]+) +([\S]+) +(.*)/);
    const event = findEvent(eventId);

    if (!eventId) {
        editEventUsage(message);
        return;
    } else if (!event) {
        bot.replyTo(message, EMBED_ERROR_COLOR, `${EMOJI_ERROR} Unable to edit event, invalid event ID provided`);
        return;
    }

    if (eventField.match(/(tank_requirements?|tank_reqs?)/i)) {
        event.role_requirements.tank = eventValue;
    } else if (eventField.match(/(heal(er)?_requirements?|heal(er)?_reqs?)/i)) {
        event.role_requirements.healer = eventValue;
    } else if (eventField.match(/(dps_requirements?|dps_reqs?)/i)) {
        event.role_requirements.dps = eventValue;
    } else if (eventField === 'tank_limit') {
        event.role_limits.tank = parseInt(eventValue);
    } else if (eventField === 'heal_limit' || eventField === 'healer_limit') {
        event.role_limits.healer = parseInt(eventValue);
    } else if (eventField === 'dps_limit') {
        event.role_limits.dps = parseInt(eventValue);
    } else if (event.hasOwnProperty(eventField)) {
        event[eventField] = eventValue;
    } else {
        editEventUsage(message);
        return;
    }

    saveEvents();
    updateEventEmbeds(event);
    message.react('👍');
});
