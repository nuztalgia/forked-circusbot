import { CommandInteraction, Message, TextBasedChannel, TextChannel, User } from 'discord.js';
import config from '../../config.json';
import { sendReply } from './replies';
import { log } from './logging';
import { EMBED_ERROR_COLOR } from '.';

const commands: { [command: string]: (message: Message<boolean> | CommandInteraction, user: User) => any } = {};
const aliases: { [command: string]: string } = {};

function getCommand(message: string) {
    const cmd = message.toLowerCase().replace(config.BOT_PREFIX, '').split(' ')[0];

    if (aliases.hasOwnProperty(cmd)) {
        return aliases[cmd];
    } else {
        return cmd;
    }
}

function getChannelName(message: Message<boolean> | CommandInteraction) {
    if (message.channel === null) {
        return 'INTERACTION (NO CHANNEL)';
    } else if (message.guild) {
        return message.guild.channels.cache.get(message.channel.id)?.name || message.channel.id;
    } else {
        return message.channel.id;
    }
}

export function registerCommand(command: string, cmdAliases: string[], callback: (message: Message<boolean> | CommandInteraction, user: User) => any) {
    commands[command] = callback;

    for (const alias of cmdAliases) {
        aliases[alias] = command;
    }

    return true;
}

export function isValidCommand(message: string) {
    if (!message.toLowerCase().startsWith(config.BOT_PREFIX)) {
        return false;
    }

    const cmd = getCommand(message);

    return commands.hasOwnProperty(cmd);
}

export function runCommand(message: Message<boolean>) {
    const cmd = getCommand(message.content);
    execCommand(cmd, message);
}

/**
 * Execute a command's registered handler with the given message or interaction.
 * @param {string} cmd The command name to execute (should NOT be an alias) 
 * @param {Message<boolean>} message The message or command interaction that triggered execution of this command
 */
export function execCommand(cmd: string, interaction: Message<boolean> | CommandInteraction) {
    const author = interaction instanceof Message ? interaction.author : interaction.user;
    const command = interaction instanceof Message ? interaction.content : `/${interaction.commandName} ${interaction.options.getSubcommand()}`;

    if (!(interaction.channel instanceof TextChannel)) {
        log('warn', `execCommand called from an invalid channel`);
    } else if (!checkPermissions(cmd, interaction.channel)) {
        log('warn', `User ${author.tag} tried to run !${cmd} in #${getChannelName(interaction)} but channel is not in the whitelist`);
        sendReply(interaction, EMBED_ERROR_COLOR, "Sorry, but I can only run this command in whitelisted channels.");
    } else if (commands.hasOwnProperty(cmd)) {
        log('info', `User ${author.tag} ran a command in #${getChannelName(interaction)}: ${command}`);
        commands[cmd](interaction, author);
    } else {
        log('warn', `execCommand called with an invalid command: ${cmd}`);
    }
}

export function checkPermissions(command: string, channel: TextBasedChannel | null) {
    const channelId = channel?.id || 'NULL';

    return (config.PERMISSIONS.hasOwnProperty(channelId) && (config.PERMISSIONS[channelId].includes("*") || config.PERMISSIONS[channelId].includes(command)))
      || (config.PERMISSIONS.hasOwnProperty('*') && (config.PERMISSIONS['*'].includes("*") || config.PERMISSIONS['*'].includes(command)));
}

export function parseCommand(message: Message<boolean>, regex: RegExp) {
    const cmd = config.BOT_PREFIX + message.content.replace(config.BOT_PREFIX, '').split(' ')[0] + ' ';
    let msg = (message.content + ' ').replace(cmd, '').trim();

    if (msg.match(regex)) {
        return msg.match(regex)?.slice(1) || [];
    } else {
        return [];
    }
}