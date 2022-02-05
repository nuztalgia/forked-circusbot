import { MessageEmbed } from 'discord.js';
import { EMBED_INFO_COLOR, registerCommand, getRandomInt, parseCommand } from '../../utils';

registerCommand('nroll', [], message => {
    const [params] = parseCommand(message, /(.*)/);
    let min = 0, max = 0;

    if (!params.trim()) { 
        return;
    } else if (params.includes('-')) {
        min = parseInt(params.split('-')[0].trim());
        max = parseInt(params.split('-')[1].trim());
    } else {
        max = parseInt(params.trim());
    }

    const roll = getRandomInt(min, max);

    const embed = new MessageEmbed()
        .setColor(EMBED_INFO_COLOR)
        .setDescription(`**${message.author.tag}** rolled **${roll == 69 ? '<:69:776740697892978728>' : roll}**`);

    message.reply({ embeds: [embed] });
});
