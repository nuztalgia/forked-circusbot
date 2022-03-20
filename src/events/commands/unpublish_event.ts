import { bot } from '../../bot';
import { sendError } from '../../utils/replies';
import { updateEventEmbeds } from '../embeds';
import { events, saveEvents } from '../persistence';

bot.registerCommand('unpublish_event', [], async message => {
    const messageContent = message.content.replace(/  +/g, ' ');
    const event_id = messageContent.split(' ')[1];
    const target_channel = message.mentions.channels.first();

    if (!events.hasOwnProperty(event_id)) {
        sendError(message.channel, "Unable to unpublish event, no such event ID was found");
        return;
    }
    
    if (!target_channel) {
        sendError(message.channel, "Please mention the channel in your message");
        return;
    }
    
    try {
        const msgId = events[event_id].published_channels[target_channel.id];
        const msg = await target_channel.messages.fetch(msgId);
        await msg.delete();
        delete events[event_id].published_channels[target_channel.id];

        saveEvents();
        updateEventEmbeds(events[event_id]);
        message.react('👍');
    } catch (error) {
        sendError(message.channel, (error as any).toString());
        message.react('👎');
    }
});
