import { registerCommand } from '../../utils/commands';
import { sendError } from '../../utils/embeds';
import { createEventEmbed, updateEventEmbeds } from '../embeds';
import { events, saveEvents } from '../persistence';

registerCommand('publish_event', ['pe'], async message => {
    const messageContent = message.content.replace(/  +/g, ' ');
    const event_id = messageContent.split(' ')[1];
    const target_channel = message.mentions.channels.first();

    if (!events.hasOwnProperty(event_id)) {
        sendError(message.channel, "Unable to publish event, no such event ID was found");
        return;
    }
    
    if (!target_channel) {
        sendError(message.channel, "Please mention the channel in your message");
        return;
    }
    
    const embed = createEventEmbed(events[event_id]);

    try {
        let msg = await target_channel.send({ embeds: [embed] });
        events[event_id].published_channels[target_channel.id] = msg.id;
        saveEvents();
        updateEventEmbeds(events[event_id]);
        message.react('👍');
    } catch (error) {
        sendError(message.channel, (error as any).toString());
        message.react('👎');
    }
});
