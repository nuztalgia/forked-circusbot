import { TextBasedChannel } from 'discord.js';
import { registerCommand } from '../../utils/commands';
import { sendError } from '../../utils/embeds';
import { updateEventEmbeds } from '../embeds';
import { events, saveEvents } from '../persistence';

function editEventUsage(channel: TextBasedChannel) {
    sendError(channel, "Incorrect syntax to edit event event. Correct usage:\n\n" +
        "`!edit_event <EVENT_ID> <FIELD_NAME> <NEW VALUE>`\n\n" +
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
    const messageContent = message.content.replace(/  +/g, ' ');

    if (!messageContent.match('(.*?) (.*?) (.*?) (.*)')) {
        editEventUsage(message.channel);
        message.react('👎');
        return;
    }

    const event_id = messageContent.split(' ')[1]?.trim();
    const event_field = messageContent.split(' ')[2]?.trim();
    const event_value = messageContent.match('(.*?) (.*?) (.*?) (.*)')[4].trim();

    if (!events.hasOwnProperty(event_id)) {
        sendError(message.channel, "Unable to edit event, no such event ID was found");
        return;
    }

    if (event_field.match(/(tank_requirements?|tank_reqs?)/i)) {
        events[event_id].role_requirements.tank = event_value;
    } else if (event_field.match(/(heal(er)?_requirements?|heal(er)?_reqs?)/i)) {
        events[event_id].role_requirements.healer = event_value;
    } else if (event_field.match(/(dps_requirements?|dps_reqs?)/i)) {
        events[event_id].role_requirements.dps = event_value;
    } else if (event_field === 'tank_limit') {
        events[event_id].role_limits.tank = parseInt(event_value);
    } else if (event_field === 'heal_limit' || event_field === 'healer_limit') {
        events[event_id].role_limits.healer = parseInt(event_value);
    } else if (event_field === 'dps_limit') {
        events[event_id].role_limits.dps = parseInt(event_value);
    } else if (events[event_id].hasOwnProperty(event_field)) {
        events[event_id][event_field] = event_value;
    } else {
        editEventUsage(message.channel);
        message.react('👎');
        return;
    }

    saveEvents();
    updateEventEmbeds(events[event_id]);
    message.react('👍');
});
