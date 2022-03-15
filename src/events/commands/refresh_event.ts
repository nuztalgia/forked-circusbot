import { bot } from '../../bot';
import { EMBED_ERROR_COLOR, EMBED_INFO_COLOR, EMOJI_ERROR, sendReply, startTyping } from '../../utils';
import { queueEventUpdate } from '../embeds';
import { findEvent } from '../persistence';

bot.registerCommand('refresh_event', ['rebuild_event', 're'], async message => {
    const [eventId] = bot.parseCommand(message, /([0-9]+)/);
    const event = findEvent(eventId);

    if (!event) {
        bot.replyTo(message, EMBED_ERROR_COLOR, `${EMOJI_ERROR} Unable to close event, invalid event ID provided`);
        return;
    }
    
    await startTyping(message.channel);
    await queueEventUpdate(event);
    bot.replyTo(message, EMBED_INFO_COLOR, `✅ [${event.title}](${message.url.replace(message.id, eventId)}) has been re-rendered and updated across all channels`);
});
