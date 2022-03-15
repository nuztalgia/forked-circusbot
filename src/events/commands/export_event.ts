import { MessageEmbed } from 'discord.js';
import { bot } from '../../bot';
import { EMBED_ERROR_COLOR, EMBED_INFO_COLOR, EMOJI_ERROR, sendReply } from '../../utils/replies';
import { findEvent } from '../persistence';

bot.registerCommand('export_event', ['event_export'], message => {
    const [eventId] = bot.parseCommand(message, /([0-9]+)/);
    const event = findEvent(eventId);

    if (!event) {
        bot.sendReply(message, EMBED_ERROR_COLOR, `${EMOJI_ERROR} Unable to export event, invalid event ID provided`);
        return;
    }

    const dmLogEmbed = new MessageEmbed()
        .setColor(EMBED_INFO_COLOR)
        .setDescription(`\`\`\`\n${JSON.stringify(event, null, 2)}\n\`\`\``);

    message.reply({ embeds: [dmLogEmbed] });
});
