import { Message, MessageEmbed } from 'discord.js';
import { EMBED_ERROR_COLOR, EMBED_INFO_COLOR, log, sendReply, loadPersistentData, savePersistentData } from "../utils";

let cannedReplies = loadPersistentData('cannedreplies', {});

export function cannedReplyHandler(message: Message<boolean>) {
    if (!message.content.startsWith('=') || !message.guildId) {
        return;
    } else if (!cannedReplies.hasOwnProperty(message.guildId)) {
        cannedReplies[message.guildId] = {};
    }

    let content = message.content.substring(1);

    // Assign a message
    if (content.includes('=')) {
        let name = content.split('=')[0].toLowerCase();
        let value = content.substring(name.length).trim().substring(1).trim().replace(/(^"|"$)/g, '');

        if (name === 'help') {
            sendReply(message, EMBED_ERROR_COLOR, 'Invalid canned reply name, that name is reserved for system use');
            return;
        } else if (name.match(/^p[o0][o0]pd[0o]gs?$/i)) {
            message.react('<:no:740146335197691945>');
            return;
        }

        if (value.startsWith('https://cdn.discordapp.com/') || value.startsWith('https://media.discordapp.net/')) {
            cannedReplies[message.guildId][name] = { value: '', url: value.split(' ')[0], author: message.author.tag };
        } else if (message.attachments.size > 0) {
            cannedReplies[message.guildId][name] = { value, url: message.attachments.first()?.url, author: message.author.tag };
        } else {
            cannedReplies[message.guildId][name] = { value, author: message.author.tag };
        }

        message.react('👍');
        log('info', `New canned reply added by ${message.author.tag}: ${name}`);
        savePersistentData('cannedreplies', cannedReplies);
    } else if (cannedReplies[message.guildId].hasOwnProperty(content.toLowerCase())) {
        const reply = cannedReplies[message.guildId][content.toLowerCase()];

        if (reply.hasOwnProperty('url')) {
            sendReply(message, EMBED_INFO_COLOR, new MessageEmbed().setDescription(reply.value || '').setImage(reply.url));
        } else {
            sendReply(message, EMBED_INFO_COLOR, reply.value);
        }
    } else {
        sendReply(message, EMBED_ERROR_COLOR, 'Unknown canned message. To create a new canned message, please use the following syntax (anyone can create canned messages):\n\n`=name=Your custom text here`\n\nThen you can print the content of the canned reply using `=name` in any channel with this bot in it.');
    }
}