import { MessageEmbed } from 'discord.js';
import { parseCommand, registerCommand } from '../../utils/commands';
import { EMBED_ERROR_COLOR, EMBED_INFO_COLOR, EMOJI_ERROR, sendReply } from '../../utils/replies';
import { findEvent } from '../persistence';

registerCommand('export_event', ['event_export'], message => {
    const [eventId] = parseCommand(message, /([0-9]+)/);
    const event = findEvent(eventId);

    if (!event) {
        sendReply(message, EMBED_ERROR_COLOR, `${EMOJI_ERROR} Unable to export event, invalid event ID provided`);
        return;
    }

    const dmLogEmbed = new MessageEmbed()
        .setColor(EMBED_INFO_COLOR)
        .setDescription(`\`\`\`\n${JSON.stringify(event, null, 2)}\n\`\`\``);

    message.reply({ embeds: [dmLogEmbed] });
});
