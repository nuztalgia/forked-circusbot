import { MessageActionRow, MessageEmbed, MessageSelectMenu, TextChannel } from "discord.js";
import { client } from "../../client";
import { updateEventEmbeds } from "../embeds";
import { events, saveEvents } from "../persistence";
import { SlashCommandSubcommandBuilder } from '@discordjs/builders';
import { getDisplayName, makeError } from "../../utils";

export const data = (builder: SlashCommandSubcommandBuilder) => builder
	.setName('adduser')
	.setDescription('Add a user to an event')
	.addStringOption(option => option.setName('role')
        .setDescription('Event role')
        .setRequired(true)
        .addChoice('Tank', 'tanks')
        .addChoice('Healer', 'healers')
        .addChoice('DPS', 'dps')
        .addChoice('Tank Sub', 'tank_subs')
        .addChoice('Healer Sub', 'healer_subs')
        .addChoice('DPS Sub', 'dps_sub'))
	.addUserOption(option => option.setName('user').setDescription('User').setRequired(true))
	.addStringOption(option => option.setName('usernotes')
        .setDescription('Sign-up Notes')
        .setRequired(false));

client.on('interactionCreate', async interaction => {
    if (!(interaction.isCommand() && interaction.commandName === 'event' && interaction.options.getSubcommand() === 'adduser')) {
        return;
    } else if (!(interaction.channel instanceof TextChannel)) {
        return;
    }

    let upcomingEvents: CircusEvent[] = [];

    for (const event of Object.values(events)) {
        if (!event.published_channels.hasOwnProperty(interaction.channelId)) continue;
        if (Date.parse((event.date + ' ' + event.time) || '') <= Date.now()) continue;

        upcomingEvents.push(event)
    }

    const row = new MessageActionRow()
        .addComponents(
            new MessageSelectMenu()
                .setCustomId('event_id_select')
                .setPlaceholder('Select an event')
                .addOptions(upcomingEvents.map(x => {
                    return {
                        label: x.title || '',
                        value: x.id || '',
                    }
                })),
        );

    const eventRole = interaction.options.getString('role') || '';
    const user = interaction.options.getUser('user');
    const notes = interaction.options.getString('usernotes') || '';

    if (!user) {
        interaction.reply({ embeds: [makeError('No user selected')] });
        return;
    }

    await interaction.reply({ content: 'Please select the event to add the user to:', components: [row] });
            
    const select = await interaction.channel.awaitMessageComponent({ 
        filter: i => { 
            i.deferUpdate();
            return i.user.id === interaction.user.id;
        }, 
        componentType: 'SELECT_MENU', 
        time: 60000 
    });

    const eventId = select.values[0];

    let updated = events[eventId].signups[eventRole].hasOwnProperty(user.id);
    events[eventId].signups[eventRole][user.id] = await getDisplayName(user, interaction.guild);

    if (notes) {
        if ((events[eventId].signups[eventRole][user.id] + notes).length > 20) {
            events[eventId].signups[eventRole][user.id]  = events[eventId].signups[eventRole][user.id].substring(0, 20 - notes.length) + ' ' + notes;
        } else {
            events[eventId].signups[eventRole][user.id] += ' ' + notes;
        }
    }
    
    const eventLink = `https://discord.com/channels/${interaction.guildId}/${interaction.channelId}/${events[eventId].id}`;

    if (updated) {
        interaction.editReply({ content: null, components: [], embeds: [new MessageEmbed()
            .setColor("#77b255")
            .setDescription(`✅ Updated <@${user.id}> for [${events[eventId].title}](${eventLink})`)
        ]});
    } else {
        interaction.editReply({ content: null, components: [], embeds: [new MessageEmbed()
            .setColor("#77b255")
            .setDescription(`✅ Added <@${user.id}> as a ${eventRole.replace(/(tank|healer)s/, '$1')} to [${events[eventId].title}](${eventLink})`)
        ]}); 
    }

    saveEvents();
    updateEventEmbeds(events[eventId]);
});