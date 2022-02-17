import { Message } from 'discord.js';
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
        cannedReplies[message.guildId][name] = { value, author: message.author.tag };
        message.react('👍');
        log('info', `New canned reply added by ${message.author.tag}: ${name}`);
        savePersistentData('cannedreplies', cannedReplies);
    } else if (cannedReplies[message.guildId].hasOwnProperty(content.toLowerCase())) {
        sendReply(message, EMBED_INFO_COLOR, cannedReplies[message.guildId][content.toLowerCase()].value);
    } else {
        sendReply(message, EMBED_ERROR_COLOR, 'Unknown canned message. To create a new canned message, please use the following syntax (anyone can create canned messages):\n\n`=name=Your custom text here`\n\nThen you can print the content of the canned reply using `=name` in any channel with this bot in it.');
    }
}