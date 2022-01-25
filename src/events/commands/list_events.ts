import { MessageEmbed } from 'discord.js';
import { registerCommand } from '../../utils/commands';
import { events } from '../persistence';

registerCommand('list_events', ['list_events', 'le'], message => {
    const messageContent = message.content.replace(/  +/g, ' ');
    const showAll = messageContent.match(/(-a|-A|all)/);
    let fields = [];

    for (const event of Object.values(events)) {
        if (!event.published_channels.hasOwnProperty(message.channel.id)) continue;
        if (Date.parse((event.date + ' ' + event.time) || '') <= Date.now() && !showAll) continue;
        console.log(event);

        fields.push([ `[${event.id}](${message.url.replace(message.id, event.id || '')})`, event.date + ' ' + event.time, event.title.substring(0,28) ])
    }

    const embed = new MessageEmbed()
        .setColor("#0099ff");

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

    message.channel.send({ embeds: [embed] });
});
