import { MessageEmbed } from 'discord.js';
import { bot } from '../../bot';
import { EMBED_INFO_COLOR } from '../../utils';
import { cannedReplies } from '../listener';

bot.registerCommand('crlist', [], message => {
    let searchTerm = message.content.split(' ')[1];
    let fields: string[][] = [];
    let replies = cannedReplies[message.guildId || message.channelId];
    let couldntFind = false;

    if (!searchTerm && message.content.endsWith('rotation')) {
        searchTerm = 'rotation';
        couldntFind = true;
    }

    for (const [name, reply] of Object.entries(replies).sort()) {
        let flags: string[] = [];

        if (searchTerm && !name.includes(searchTerm.toLowerCase())) {
            continue;
        }

        if (reply.locked) {
            flags.push('Locked');
        }
        
        if (reply.value.startsWith('@')) {
            flags.push('Alias(' + reply.value + ')');
        }

        if (reply.hasOwnProperty('url')) {
            flags.push('Embed');
        }

        // Allow nice names for a subset of canned replies
        let niceName = name;
        if (searchTerm === 'rotation') niceName = name.replace(/ ?rotation/, ' rotation');

        // Avoid duplicates
        if (fields.find(x => x[0] === `=${niceName}`)) continue;

        fields.push([ `=${niceName}`, reply.author, flags.join(', ') || '⠀' ])
    }

    const embed = new MessageEmbed()
        .setColor(EMBED_INFO_COLOR);

    if (fields.length === 0) {
        embed.setDescription(
            searchTerm ? `There are no canned replies matching your search query in this server. You can create a canned reply using the \`=\` command.`
            : `There are no canned replies events in this server. You can create a canned reply using the \`=\` command.`);
    } else {
        let text = searchTerm ? 'All canned replies matching your search term:' : 'All canned replies in this server:';
        if (couldntFind) text = 'There was no canned reply with that name in this server. Did you mean one of the following?'
        
        embed.setDescription(`${text}`)
            .addFields([ 
                { name: 'Name', value: fields.map(x => x[0]).join('\n'), inline: true },
                { name: 'Author', value: fields.map(x => x[1]).join('\n'), inline: true },
                { name: 'Flags', value: message.content.startsWith('=') ? '\u200b' : fields.map(x => x[2]).join('\n'), inline: true },
            ]);
    }

    message.reply({ allowedMentions: { repliedUser: false }, embeds: [embed] });
});
