import { Message, MessageEmbed } from 'discord.js';
import { EMBED_ERROR_COLOR, EMBED_INFO_COLOR, log, sendReply, loadPersistentData, savePersistentData, checkPermissions } from "../utils";

export const cannedReplies = loadPersistentData('cannedreplies', {});

/**
 * Only load images/embeds from trusted domains for security reasons. Don't want spammers to
 * abuse this feature.
 */
const WHITELISTED_DOMAINS = [
    'https://media.tenor.com/',
    'https://cdn.discordapp.com/',
    'https://media.discordapp.net/',
    'https://images-ext-1.discordapp.net/',
    'https://tenor.com/',
    'https://c.tenor.com/',
];

/**
 * Don't use an embed if a canned reply matches any of the regular expressions here. Generally the
 * Embed we use can only render static images, so gifs and videos shouldn't use an embed. This list
 * only gets checked if the url already matches WHITELISTED_DOMAINS, so it should be safe to just 
 * use a "naked" message, which Discord will handle appropriately (e.g. embedding the video).
 */
const NO_EMBED_WHITELIST = [
    /\.mp4$/i,
    /https:\/\/tenor\.com\//i,
]

export function saveCannedReplies() {
    savePersistentData('cannedreplies', cannedReplies);
}

/**
 * Return a MessageEmbed or text reply for the contents of the Canned Message. If the message contains
 * a URL, it will be embedded correct and can be used with sendReply.
 * 
 * @param reply The canned reply
 * @returns MessageEmbed | string
 */
export function renderCannedReply(reply: any) {
    if (!reply) {
        return new MessageEmbed()
            .setTitle('Well, this is embarassing')
            .setDescription('<a:confusedPsyduck:861432384318996510> Hmmm, for some reason, there is nothing here.');
    } else if (reply.hasOwnProperty('url') && NO_EMBED_WHITELIST.some(x => reply.url.match(x))) {
        return 'noembed:' + reply.url;
    } else if (reply.hasOwnProperty('url')) {
        return new MessageEmbed().setDescription(reply.value || '').setImage(reply.url);
    } else if (reply.value.trim().match(/^<:.*?:([0-9]+)>$/)) {
        const emoji = reply.value.trim().match(/^<:.*?:([0-9]+)>$/);
        return new MessageEmbed().setThumbnail(`https://cdn.discordapp.com/emojis/${emoji[1]}.png?size=96&quality=lossless`);
    } else if (reply.value.trim().match(/^<a:.*?:([0-9]+)>$/)) {
        const emoji = reply.value.trim().match(/^<a:.*?:([0-9]+)>$/);
        return new MessageEmbed().setThumbnail(`https://cdn.discordapp.com/emojis/${emoji[1]}.gif?size=96&quality=lossless`);
    } else {
        return new MessageEmbed().setDescription(reply.value || '⠀');
    }
}

export function cannedReplyHandler(message: Message<boolean>) {
    if (!message.content.startsWith('=') || !message.guildId) {
        return;
    } else if (!cannedReplies.hasOwnProperty(message.guildId)) {
        cannedReplies[message.guildId] = { '__auto_update__': {} };
    }

    const content = message.content.substring(1);
    const name = content.split('=')[0].toLowerCase().replace(/\\/g, '').trim();
    const reply = cannedReplies[message.guildId][name];

    // Assign a message
    if (content.includes('=')) {
        if (name === '') {
            sendReply(message, EMBED_ERROR_COLOR, 'Invalid canned reply name. Names must not be blank or contain the prefix character (=) or Discord escape character.');
            return;
        } else if (reply?.locked && !checkPermissions('crlock', message.channel)) {
            sendReply(message, EMBED_ERROR_COLOR, 'This canned reply is locked and can only be edited in command channels');
            return;
        }

        let value = content.substring(name.length).trim().substring(1).trim().replace(/(^"|"$)/g, '');

        if (name === 'help' || name.startsWith('__')) {
            sendReply(message, EMBED_ERROR_COLOR, 'Invalid canned reply name, that name is reserved for system use');
            return;
        } else if (name.match(/^p[o0][o0]pd[0o]gs?$/i)) {
            message.react('<:no:740146335197691945>');
            return;
        }

        if (WHITELISTED_DOMAINS.some(x => value.startsWith(x))) {
            cannedReplies[message.guildId][name] = { locked: reply?.locked || false, value: '', url: value.split(' ')[0], author: message.author.tag };
        } else if (message.attachments.size > 0) {
            cannedReplies[message.guildId][name] = { locked: reply?.locked || false, value, url: message.attachments.first()?.url, author: message.author.tag };
        } else if (value === '') {
            delete cannedReplies[message.guildId][name];
        } else {
            cannedReplies[message.guildId][name] = { locked: reply?.locked || false, value, author: message.author.tag };
        }

        message.react('👍');
        log('info', `New canned reply added by ${message.author.tag}: ${name}`);
        saveCannedReplies();
    } else if (name === 'help' || !name) {
        sendReply(message, EMBED_INFO_COLOR, new MessageEmbed().setTitle('Canned Replies').setDescription(
            'Canned replies are a feature that allow you to save a message/attachment/link with a name, and then ' +
            'whenever that name is posted in a channel with CirqueBot, the contents will be posted as a reply. For ' +
            'example, you could create a command that contains your guild\'s StarParse info:\n\n' +
            '```\n=parse=**StarParse Group:** CirqueBot/Cirquebot\n```\n' + 
            'Then, anytime a user needs the parse or asks for it, instead of trying to dig thru your pinned messages to ' + 
            'find it, you can simply use the `=parse` command and CirqueBot will post your saved messages.\n\n' + 
            'Canned replies are meant to be a collaborate feature, so anyone can create, edit, or use them. If you want to ' +
            'lock down a certain reply, admins can use the `!crlock` command' 
        ));
    } else if (reply) {
        sendReply(message, EMBED_INFO_COLOR, renderCannedReply(reply.value.startsWith('@') ? cannedReplies[message.guildId][reply.value.substring(1)] : reply));
    } else {
        sendReply(message, EMBED_ERROR_COLOR, 'Unknown canned message. To create a new canned message, please use the following syntax (anyone can create canned messages):\n\n`=name=Your custom text here`\n\nThen you can print the content of the canned reply using `=name` in any channel with this bot in it.');
    }
}