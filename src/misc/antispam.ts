import { DiscordAPIError, Message } from 'discord.js';
import { log, sendMessage } from '../utils';

export async function antispamHandler(message: Message<boolean>) {
    if (message.content.includes('https://discord.gift/')) {
        log('warn', `Discord Nitro gift link detected in ${message.channel.name} (posted by ${message.author.tag}), deleting it`);
        message.channel.sendTyping();
        await message.delete();
        sendMessage(message.channel, `A Discord nitro gift link has been automatically deleted (posted by <@${message.author.id}>) - Please send nitro gift links via DM so they don't get claimed by the wrong person`);
        return;
    }

    if (message.content.includes('disocrds.gift') || message.content.match(/https?:\/\/[a-z]+\.gift/i)) {
        log('warn', `Discord Nitro scam link detected in ${message.channel.name} (posted by ${message.author.tag}), deleting it`);
        message.channel.sendTyping();
        await message.delete();
        sendMessage(message.channel, `A Discord Nitro scam link has been detected and automatically deleted <:pepetrash:740924034493055038> (posted by <@${message.author.id}>).\n\nPlease remember that Discord Nitro links are always \`discord.gift\`, make sure to double check the spelling before you click!`)
        return;
    }
}