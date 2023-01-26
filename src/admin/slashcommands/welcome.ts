import { TextChannel, Permissions } from 'discord.js';
import { SlashCommandSubcommandBuilder } from '@discordjs/builders';
import { client } from '../../client';
import { bot } from '../../bot';
import { makeError, makeSuccess } from '../../utils';
import { getConfig } from '../configuration';
import { quietWelcomeChannels } from '../welcome_channel';

export const data = (builder: SlashCommandSubcommandBuilder) => builder
	.setName('welcome')
    .addStringOption(option => option.setName('role')
        .setDescription('Role')
        .setRequired(true)
        .addChoice('Piglet', 'piglet')
        .addChoice('Piglet (No Welcome)', 'piglet_quiet')
        .addChoice('Puglet (No Welcome)', 'puglet'))
	.setDescription('Give a user a role, send them a welcome message in the server, and close their welcome channel');

client.on('interactionCreate', async interaction => {
    if (!(interaction.isCommand() && interaction.commandName === 'admin' && interaction.options.getSubcommand() === 'welcome')) {
        return;
    } else if (!(interaction.channel instanceof TextChannel) || !interaction.guild) {
        return;
    }
    
    const config = getConfig(interaction.guild.id, 'welcome', { enabled: false });
    
    if (!interaction.channel.name.startsWith(config.prefix) || !interaction.channel.topic) {
        interaction.reply({ embeds: [makeError('The /welcome command can only be used in welcome channels')], ephemeral: true });
        return; 
    }

    const role = interaction.options.getString('role') || '';
    const member = interaction.channel.members.find(x => x.roles.cache.size === 1);
    const user = await interaction.guild.members.fetch(interaction.user.id);

    if (!user.permissions.has(Permissions.FLAGS.KICK_MEMBERS)) {
        interaction.reply({ embeds: [makeError('The /welcome command can only be used by administrators')], ephemeral: true });
        return; 
    } else if (role === 'piglet') {
        const role = interaction.guild?.roles.cache.find(x => x.name === 'Piglets');
        member?.roles.add(role);
        interaction.reply({ embeds: [makeSuccess('User has been given the Piglet role. This channel will now be archived. Goodbye.')], ephemeral: true });
    } else if (role === 'piglet_quiet') {
        quietWelcomeChannels[interaction.channelId] = true;
        const role = interaction.guild?.roles.cache.find(x => x.name === 'Piglets');
        member?.roles.add(role);
        interaction.reply({ embeds: [makeSuccess('User has been given the Piglet role. This channel will now be archived. Goodbye.')], ephemeral: true });
    } else if (role === 'puglet') {
        const role = interaction.guild?.roles.cache.find(x => x.name === 'Puglets');
        member?.roles.add(role);
        interaction.reply({ embeds: [makeSuccess('User has been given the Puglet role. This channel will now be archived. Goodbye.')], ephemeral: true });
    } else {
        interaction.reply({ embeds: [makeError('Invalid role selected')], ephemeral: true });
        return; 
    }
});