import { registerCommand } from '../../utils/commands';
import { sendMessage } from '../../utils/embeds';
import { updateEventEmbeds } from '../embeds';
import { events } from '../persistence';

registerCommand('refresh_event', ['rebuild_event', 're'], message => {
    const messageContent = message.content.replace(/  +/g, ' ');
    updateEventEmbeds(events[messageContent.split(' ')[1]]);
    sendMessage(message.channel, `✅ Event ${messageContent.split(' ')[1]} has been rebuilt across all channels`);
    message.react('👍');
});
