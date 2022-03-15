import { TextChannel } from 'discord.js';
import { SlashCommandSubcommandBuilder } from '@discordjs/builders';
import { client } from '../../client';
import { bot } from '../../bot';

export const data = (builder: SlashCommandSubcommandBuilder) => builder
	.setName('help')
	.setDescription('Show the available event commands and how to use them');

client.on('interactionCreate', async interaction => {
    if (!(interaction.isCommand() && interaction.commandName === 'event' && interaction.options.getSubcommand() === 'help')) {
        return;
    } else if (!(interaction.channel instanceof TextChannel)) {
        return;
    }

   bot.execCommand('event_help', interaction as any);
});