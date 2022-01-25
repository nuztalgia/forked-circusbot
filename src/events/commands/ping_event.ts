import { parseCommand, registerCommand } from '../../utils/commands';
import { sendError } from '../../utils/embeds';
import { events } from '../persistence';

registerCommand('ping_event', ['event_ping'], message => {
    const [eventId, _, pingMsg] = parseCommand(message, /([0-9]+) +([\S]+) +(.*)/);
    const targetChannel = message.mentions.channels.first();

    if (!events.hasOwnProperty(eventId)) {
        sendError(message.channel, "Unable to ping event, no such event ID was found. Correct usage:\n\n`!ping_event 123456789 #event-signups Now forming up, please x in guild`");
        return;
    } else if (!targetChannel) {
        sendError(message.channel, "Please mention the channel in your message. Correct usage:\n\n`!ping_event 123456789 #event-signups Now forming up, please x in guild`");
        return;
    } else if (!pingMsg) {
        sendError(message.channel, "Please provide a message for the ping. Correct usage:\n\n`!ping_event 123456789 #event-signups Now forming up, please x in guild`");
        return;
    }

    let allUsers = Object.keys(events[eventId].signups.tanks);
    allUsers = allUsers.concat(Object.keys(events[eventId].signups.healers));
    allUsers = allUsers.concat(Object.keys(events[eventId].signups.dps));

    targetChannel.send(allUsers.map(x => `<@${x}>`).join(' ') + ' ' + pingMsg);
});
