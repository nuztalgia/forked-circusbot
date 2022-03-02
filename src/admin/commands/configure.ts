import { Message, MessageEmbed } from 'discord.js';
import { EMBED_ERROR_COLOR, EMBED_INFO_COLOR, EMBED_SUCCESS_COLOR, makeError, parseCommand, registerCommand, savePersistentData, sendReply } from '../../utils';
import { getConfig, saveConfig } from '../configuration';

/**
 * !configure welcome 
 * !configure cannedreplies.enabled [true|false]
 */
registerCommand('configure', ['conf'], message => {
    const [namespace, option, value] = parseCommand(message, /^(.*?)(?:\.(.*?) ([\s\S]*))?$/m);

    console.log(namespace, option, value);

    if (!(message instanceof Message) || !message.guildId) {
        return;
    }

    if (namespace === 'welcome') {
        const config = getConfig(message.guildId, 'welcome', { enabled: false, admin_roles: ' ', prefix: '🎪welcome-', greeting: 'Hello <user>! Welcome to **<server>**! 😄' });
        const adminRoles = message.guild?.roles.cache.filter(x => config.admin_roles.includes(x.id));

        if (option === 'enabled') {
            config.enabled = value.toLocaleLowerCase() === 'true' || value.toLocaleLowerCase() === 'yes';
        } else if (option === 'prefix') {
            config.prefix = value.replace(/^#/, ''); 
        }  else if (option === 'greeting') {
            config.greeting = value; 
        } else if (option === 'admin_roles' || option === 'roles') {
            const newRoles = value.split(/[ ,]/).map(x => x.replace(/^@/, ''));
            config.admin_roles = message.guild?.roles.cache.filter(x => newRoles.includes(x.name)).concat(message.mentions.roles).map(x => x.id);
        } else if (option) {
            sendReply(message, EMBED_ERROR_COLOR, makeError('Invalid option'));
            return;
        }

        if (option) {
            saveConfig(message.guildId, 'welcome', config);
            message.react('👍');
            return;
        }

        const embed = new MessageEmbed()
            .setAuthor({ iconURL: message.guild?.iconURL() || '', name: `Welcome Configuration for "${message.guild?.name}"` })
            .setDescription(
                '🎪 `!configure welcome.enabled`\n' + 
                'Whether or not the welcome module is enabled. If enabled, a unique welcome channel will be created each time a new user ' + 
                'joins the server, and will be archived when they leave or are given a role.\n' + 
                'Current Configuration:\n' + 
                '```\n' + (config.enabled ? 'true' : 'false') + '\n```\n\n' + 

                '🎪 `!configure welcome.prefix`\n' + 
                'The channel prefix for welcome channels (a random id will be added after the prefix to ensure uniqueness).\n' + 
                'Current Configuration:\n' + 
                '```\n#' + (config.prefix) + '\n```\n\n' + 

                '🎪 `!configure welcome.admin_roles`\n' + 
                'A list of roles that will be added to the welcome channel when one is created.\n' + 
                'Current Configuration:\n' + 
                '```\n' + (adminRoles?.map(x => `@` + x.name).join(' ') || '-') + '\n```\n\n' + 

                '📢 `!configure welcome.greeting`\n' + 
                'The greeting message for CirqueBot to send to a user once their welcome channel has been created.\n\n' + 
                'Some helpful tips:\n' + 
                '- You may use <user> in your message to mention/ping the new member.\n' + 
                '- You may use <server> in your message to display this server\'s name.\n' + 
                '- You may use Markdown formatting (e.g. **bold text**) in your message.\n\n' + 
                'Current Configuration:\n' + 
                '```\n' + (config.greeting) + '\n```\n\n' + 
                '');
        sendReply(message, EMBED_INFO_COLOR, embed);
    } else if (namespace === 'cannedreplies') {

    } else {
        sendReply(message, EMBED_ERROR_COLOR, makeError('Unknown configuration option'));
    }
});
