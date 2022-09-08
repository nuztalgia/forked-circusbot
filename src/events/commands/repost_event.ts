import { bot } from '../../bot';
import { sendError } from '../../utils/replies';
import { createEventEmbed, updateEventEmbeds } from '../embeds';
import { events, saveEvents } from '../persistence';

bot.registerCommand('repost_event', [], async message => {
    const messageContent = message.content.replace(/  +/g, ' ');
    const event_id = messageContent.split(' ')[1];
    const target_channel = message.mentions.channels.first() || message.channel;

    if (!events.hasOwnProperty(event_id)) {
        sendError(message.channel, "Unable to publish event, no such event ID was found");
        return;
    }
    
    if (!events[event_id].published_channels[target_channel.id]) {
        sendError(message.channel, "This event has not been published to the specified channel. Please use !publish_event instead");
        return;
    }
    
    const embed = createEventEmbed(events[event_id]);

    try {
        let oldMsg = await target_channel.messages.fetch(events[event_id].published_channels[target_channel.id]);
        await oldMsg.edit({ content: 'This message will no longer be synced with event data as it has been reposted.', embeds: [embed] });

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
