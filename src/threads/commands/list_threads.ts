import { MessageEmbed } from 'discord.js';
import { registerCommand } from '../../utils/commands';
import { EMBED_INFO_COLOR } from '../../utils/embeds';
import { threads } from '../persistence';

registerCommand('list_threads', ['list_thread', 'thread_list'], message => {
    const showAll = message.content.match(/(-a|-A|all)/);
    let fields: string[][] = [];

    for (const thread of Object.values(threads)) {
        if (thread.serverId !== message.guildId) continue;
        if (!thread.enabled && !showAll) continue;

        fields.push([ thread.id, `Archived every ${thread.archiveDays} days at ${thread.archiveTime}`, `${thread.title}` ])
    }

    const embed = new MessageEmbed()
        .setColor(EMBED_INFO_COLOR);

    if (fields.length === 0) {
        embed.setDescription(`There are no upcoming threads in this server. You can create a scheduled thread using the \`!create_thread\` command.`);
    } else {
        embed.setDescription(`All threads in this server:`)
            .addFields([ 
                { name: 'Thread ID', value: fields.map(x => x[0]).join('\n'), inline: true },
                { name: 'Archive Rules', value: fields.map(x => x[1]).join('\n'), inline: true },
                { name: 'Title', value: fields.map(x => x[2]).join('\n'), inline: true },
            ]);
    }

    message.reply({ embeds: [embed] });
});
