import { ColorResolvable, Message, MessageEmbed, PartialUser, TextBasedChannel, User } from 'discord.js';

export const EMBED_SUCCESS_COLOR = '#77b255';
export const EMBED_ERROR_COLOR = '#e14f5e';
export const EMBED_INFO_COLOR = '#0099ff';
export const EMBED_DMM_COLOR = '#9c59b6';

export const EMOJI_ERROR = '<:error:935248898086273045>';

export function messageUser(user: User | PartialUser, reply: string, title: string | null = null) {
    const embed = new MessageEmbed()
        .setColor(EMBED_DMM_COLOR)
        .setDescription(reply)

    if (title) {
        embed.setTitle(title);
    }

    user.send({ embeds: [embed] });

    return null;
}

export function sendReply(message: Message<boolean>, color: ColorResolvable, reply: string) {
    const embed = new MessageEmbed()
        .setColor(color)
        .setDescription(reply)

    message.reply({ allowedMentions: { repliedUser: false }, embeds: [embed] });

    return null;
}

export function sendMessage(channel: TextBasedChannel, message: string) {
    const embed = new MessageEmbed()
        .setColor(EMBED_SUCCESS_COLOR)
        .setDescription(message)

    channel.send({ embeds: [embed] });

    return null;
}

export function sendError(channel: TextBasedChannel, message: string) {
    const embed = new MessageEmbed()
        .setColor(EMBED_ERROR_COLOR)
        .setDescription(EMOJI_ERROR + ' ' + message)
    
    channel.send({ embeds: [embed] });

    return null;
}