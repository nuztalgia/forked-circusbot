import { REST } from '@discordjs/rest';
import { Routes } from 'discord-api-types/rest/v9';
import { registerCommand } from '../../utils/commands';
import { data as addUser } from '../slashcommands/event_adduser';
import config from '../../../config.json';

import { SlashCommandBuilder } from '@discordjs/builders';

registerCommand('register_slash_commands', [], message => {
    let builder = new SlashCommandBuilder()
        .setName('event')
        .setDescription('Raid event sign-ups')
        .addSubcommand(addUser);

    const rest = new REST({ version: '9' }).setToken(config.BOT_TOKEN);

    (async () => {
        try {
            console.log('Started refreshing application (/) commands.');

            await rest.put(
                Routes.applicationGuildCommands(config.BOT_CLIENT_ID, message.guildId),
                { body: [builder.toJSON()] },
            );

            console.log('Successfully reloaded application (/) commands.');
            message.react('✅');
        } catch (error) {
            console.error(error);
        }
    })();
});
