import { registerCommand } from '../../utils/commands';
import { sendError } from '../../utils/embeds';
import { events } from '../persistence';

registerCommand('ping_event', ['event_ping', 'pe'], message => {
    const messageContent = message.content.replace(/  +/g, ' ');
    const event_id = messageContent.split(' ')[1].trim();
    const target_channel = message.mentions.channels.first();
    const ping_msg = messageContent.match('(.*?) (.*?) (.*?) (.*)')[4].trim();

    if (!events.hasOwnProperty(event_id)) {
        sendError(message.channel, "Unable to ping event, no such event ID was found");
        return;
    } else if (!target_channel) {
        sendError(message.channel, "Please mention the channel in your message");
        return;
    } else if (!ping_msg) {
        sendError(message.channel, "Please provide a message for the ping");
        return;
    }

    let allUsers = Object.keys(events[event_id].signups.tanks);
    allUsers = allUsers.concat(Object.keys(events[event_id].signups.healers));
    allUsers = allUsers.concat(Object.keys(events[event_id].signups.dps));

    target_channel.send(allUsers.map(x => `<@${x}>`).join(' ') + ' ' + ping_msg);
});
