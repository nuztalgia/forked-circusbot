import { Message } from 'discord.js';
import { client } from '../client';
import { EMBED_ERROR_COLOR, log, sendMessage, sendReply } from '../utils';
const unhomoglyph = require('unhomoglyph');

const SCAM_TEXT = unhomoglyph("You've been gifted a subscription!");
let deletedNitroLinks: { [key: string]: string[] } = {};

client.on('messageUpdate', async (_oldMessage, newMessage) => {
    if (newMessage.partial) {
        newMessage = await newMessage.fetch();   
    }

    antispamHandler(newMessage);
});

export async function antispamHandler(message: Message<boolean>) {
    if (message.content.includes('https://discord.gift/')) {
        const guildId = message.guildId || '*';

        if (!deletedNitroLinks.hasOwnProperty(guildId)) {
            deletedNitroLinks[guildId] = [];
        } else if (deletedNitroLinks[guildId].includes(message.author.id)) {
            return;
        }

        log('warn', `Discord Nitro gift link detected in ${message.channel.name} (posted by ${message.author.tag}), deleting it`);
        deletedNitroLinks[guildId].push(message.author.id);
        setTimeout(() => {
            const index = deletedNitroLinks[guildId].indexOf(message.author.id);
            deletedNitroLinks[guildId].splice(index, 1);
        }, 1000 * 60 * 60);

        message.channel.sendTyping();
        await message.delete();
        sendMessage(message.channel, `A Discord nitro gift link has been automatically deleted (posted by <@${message.author.id}>) - Please send nitro gift links via DM so they don't get claimed by the wrong person\n\nIf you meant to send Discord Nitro in this channel, please post it again, and it will not be deleted.`);
        
        return;
    }

    if (message.content.includes('disocrds.gift') || message.content.match(/https?:\/\/[a-z]+\.gift/i) || message.embeds.find(x => unhomoglyph(x.title || '') === SCAM_TEXT)) {
        log('warn', `Discord Nitro scam link detected in ${message.channel.name} (posted by ${message.author.tag}), deleting it`);
        message.channel.sendTyping();
        await message.delete();
        sendMessage(message.channel, `A Discord Nitro scam link has been detected and automatically deleted <:pepetrash:740924034493055038> (posted by <@${message.author.id}>).\n\nPlease remember that Discord Nitro links are always \`discord.gift\`, make sure to double check the spelling before you click!`)
        return;
    }

    if (message.content.match(/(https?:\/\/(dis[a-z]{3,6}\.gg))/i) && !message.content.includes('discord.gg')) {
        const link = message.content.match(/(https?:\/\/(dis[a-z]{3,6}\.gg))/i)[1];

        if (link.includes('c') && link.includes('o')) {
            log('warn', `Possible Discord scam link detected in ${message.channel.name} (posted by ${message.author.tag}): ${link}`);
            message.channel.sendTyping();
            sendReply(message, EMBED_ERROR_COLOR, `This may be a scam link, please double check it. It is NOT an official Discord link (discord links are from \`https://discord.gg\`)`);
            return; 
        }
    }
}