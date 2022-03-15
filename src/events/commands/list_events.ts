import { MessageEmbed } from 'discord.js';
import { bot } from '../../bot';
import { EMBED_INFO_COLOR } from '../../utils';
import { events } from '../persistence';

bot.registerCommand('list_events', ['list_events', 'le'], message => {
    const showAll = message.content.match(/(-a|-A|all)/);
    let fields: string[][] = [];

    for (const event of Object.values(events)) {
        if (!event.published_channels.hasOwnProperty(message.channel.id)) continue;
        if (Date.parse((event.date + ' ' + event.time) || '') <= Date.now() && !showAll) continue;

        fields.push([ event.id || '', event.date + ' ' + event.time?.toUpperCase().replace(/ [A-Z]{3}$/, ''), `[${event.title.substring(0,28)}](${message.url.replace(message.id, event.id || '')})` ])
    }

    const embed = new MessageEmbed()
        .setColor(EMBED_INFO_COLOR);

    if (fields.length === 0) {
        embed.setDescription(`There are no upcoming events in this channel. You can create an event using the \`!create_event\` command.`);
    } else {
        embed.setDescription(`${showAll ? 'All' : 'Upcoming'} events in this channel:`)
            .addFields([ 
                { name: 'Event ID', value: fields.map(x => x[0]).join('\n'), inline: true },
                { name: 'Date', value: fields.map(x => x[1]).join('\n'), inline: true },
                { name: 'Title', value: fields.map(x => x[2]).join('\n'), inline: true },
            ]);
    }

    message.reply({ allowedMentions: { repliedUser: false }, embeds: [embed] });
});
