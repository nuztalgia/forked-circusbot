import { TextBasedChannel } from 'discord.js';
import { parseCommand, registerCommand } from '../../utils/commands';
import { sendError } from '../../utils/embeds';
import { updateEventEmbeds } from '../embeds';
import { events, saveEvents } from '../persistence';

function editEventUsage(channel: TextBasedChannel) {
    sendError(channel, "Incorrect syntax to edit event event. Correct usage:\n\n" +
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

registerCommand('edit_event', ['event_edit', 'ee'], message => {
    const [eventId, eventField, eventValue] = parseCommand(message, /([0-9]+) +([\S]+) +(.*)/);

    if (!eventId) {
        editEventUsage(message.channel);
        return;
    } else if (!events.hasOwnProperty(eventId)) {
        sendError(message.channel, "Unable to edit event, no such event ID was found");
        return;
    }

    if (eventField.match(/(tank_requirements?|tank_reqs?)/i)) {
        events[eventId].role_requirements.tank = eventValue;
    } else if (eventField.match(/(heal(er)?_requirements?|heal(er)?_reqs?)/i)) {
        events[eventId].role_requirements.healer = eventValue;
    } else if (eventField.match(/(dps_requirements?|dps_reqs?)/i)) {
        events[eventId].role_requirements.dps = eventValue;
    } else if (eventField === 'tank_limit') {
        events[eventId].role_limits.tank = parseInt(eventValue);
    } else if (eventField === 'heal_limit' || eventField === 'healer_limit') {
        events[eventId].role_limits.healer = parseInt(eventValue);
    } else if (eventField === 'dps_limit') {
        events[eventId].role_limits.dps = parseInt(eventValue);
    } else if (events[eventId].hasOwnProperty(eventField)) {
        events[eventId][eventField] = eventValue;
    } else {
        editEventUsage(message.channel);
        return;
    }

    saveEvents();
    updateEventEmbeds(events[eventId]);
    message.react('👍');
});
