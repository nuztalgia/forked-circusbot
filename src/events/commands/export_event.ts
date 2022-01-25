import { MessageEmbed } from 'discord.js';
import { registerCommand } from '../../utils/commands';
import { sendError } from '../../utils/embeds';
import { events } from '../persistence';

registerCommand('export_event', ['event_export'], message => {
    const messageContent = message.content.replace(/  +/g, ' ');
    const event_id = messageContent.split(' ')[1].trim();

    if (!events.hasOwnProperty(event_id)) {
        sendError(message.channel, "Unable to export event, no such event ID was found");
        return;
    }

    const dmLogEmbed = new MessageEmbed()
        .setColor("#0099ff")
        .setDescription(`\`\`\`\n${JSON.stringify(events[event_id], null, 2)}\n\`\`\``);

    message.channel.send({ embeds: [dmLogEmbed] });
});
