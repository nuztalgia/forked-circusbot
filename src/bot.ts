import { ColorResolvable, CommandInteraction, Message, MessageEmbed, TextBasedChannel, TextChannel, User } from 'discord.js';
import { log, EMBED_ERROR_COLOR, sendReply } from './utils';
import config from '../config.json';

const commands: { [command: string]: (message: Message<boolean>, user: User) => any } = {};
const aliases: { [command: string]: string } = {};

class Bot {
    get COLORS() {
        return {
            ERROR: '#e14f5e' as ColorResolvable,
            INFO: '#0099ff' as ColorResolvable,
            DM: '#9c59b6' as ColorResolvable,
            SUCCESS: '#77b255' as ColorResolvable,
        };
    }

    get config() {
        return config;
    }

    public async sendReply(message: Message<boolean>, color: ColorResolvable, reply: string | MessageEmbed) {
        return bot.sendReply(message, color, reply);
    }

    public checkPermissions(command: string, channel: TextBasedChannel | null) {
        const channelId = channel?.id || 'NULL';
    
        return (config.PERMISSIONS.hasOwnProperty(channelId) && (config.PERMISSIONS[channelId].includes("*") || config.PERMISSIONS[channelId].includes(command)))
          || (config.PERMISSIONS.hasOwnProperty('*') && (config.PERMISSIONS['*'].includes("*") || config.PERMISSIONS['*'].includes(command)));
    }

    public parseCommand(message: Message<boolean>, regex: RegExp) {
        const cmd = config.BOT_PREFIX + message.content.replace(config.BOT_PREFIX, '').split(' ')[0] + ' ';
        let msg = (message.content + ' ').replace(cmd, '').trim();

        if (msg.match(regex)) {
            return msg.match(regex)?.slice(1) || [];
        } else {
            return [];
        }
    }

    public registerCommand(command: string, cmdAliases: string[], callback: (message: Message<boolean>, user: User) => any) {
        commands[command] = callback;
    
        for (const alias of cmdAliases) {
            aliases[alias] = command;
        }
    
        return true;
    }
    
    public isValidCommand(message: string) {
        if (!message.toLowerCase().startsWith(config.BOT_PREFIX)) {
            return false;
        }
    
        const cmd = this.getCommand(message);
    
        return commands.hasOwnProperty(cmd);
    }
    
    public runCommand(message: Message<boolean>) {
        const cmd = this.getCommand(message.content);
        this.execCommand(cmd, message);
    }
    
    /**
     * Execute a command's registered handler with the given message or interaction.
     * @param {string} cmd The command name to execute (should NOT be an alias) 
     * @param {Message<boolean>} message The message or command interaction that triggered execution of this command
     */
    public execCommand(cmd: string, interaction: Message<boolean> | CommandInteraction) {
        const author = interaction instanceof Message ? interaction.author : interaction.user;
        const command = interaction instanceof Message ? interaction.content : `/${interaction.commandName} ${interaction.options.getSubcommand()}`;
    
        if (!(interaction.channel instanceof TextChannel)) {
            log('warn', `execCommand called from an invalid channel`);
        } else if (!this.checkPermissions(cmd, interaction.channel)) {
            log('warn', `User ${author.tag} tried to run !${cmd} in #${this.getChannelName(interaction)} but channel is not in the whitelist`);
            bot.sendReply(interaction, EMBED_ERROR_COLOR, "Sorry, but I can only run this command in whitelisted channels.");
        } else if (commands.hasOwnProperty(cmd)) {
            log('info', `User ${author.tag} ran a command in #${this.getChannelName(interaction)}: ${command}`);
            commands[cmd](interaction, author);
        } else {
            log('warn', `execCommand called with an invalid command: ${cmd}`);
        }
    }

    private getCommand(message: string) {
        const cmd = message.toLowerCase().replace(config.BOT_PREFIX, '').split(' ')[0];
    
        if (aliases.hasOwnProperty(cmd)) {
            return aliases[cmd];
        } else {
            return cmd;
        }
    }
    
    private getChannelName(message: Message<boolean> | CommandInteraction) {
        if (message.channel === null) {
            return 'INTERACTION (NO CHANNEL)';
        } else if (message.guild) {
            return message.guild.channels.cache.get(message.channel.id)?.name || message.channel.id;
        } else {
            return message.channel.id;
        }
    }

}

export const bot = new Bot();
