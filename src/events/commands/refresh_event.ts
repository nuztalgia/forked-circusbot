import { bot } from '../../bot';
import { EMOJI_ERROR } from '../../utils';
import { queueEventUpdate } from '../embeds';
import { findEvent } from '../persistence';

bot.registerCommand('refresh_event', ['rebuild_event', 're'], async message => {
    const [eventId] = bot.parseCommand(message, /([0-9]+)/);
    const event = findEvent(eventId);

    if (!event) {
        bot.replyTo(message, bot.COLORS.ERROR, `${EMOJI_ERROR} Unable to rebuild event, invalid event ID provided`);
        return;
    }
    
    await bot.startTyping(message.channel);
    await queueEventUpdate(event);
    bot.replyTo(message, bot.COLORS.INFO, `✅ [${event.title}](${message.url.replace(message.id, eventId)}) has been re-rendered and updated across all channels`);
});
