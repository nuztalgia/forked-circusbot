import { ColorResolvable, Message, MessageEmbed, TextBasedChannel } from 'discord.js';

export const EMBED_SUCCESS_COLOR = '#77b255';
export const EMBED_ERROR_COLOR = '#e14f5e';
export const EMBED_INFO_COLOR = '#0099ff';

export function sendReply(message: Message<boolean>, color: ColorResolvable, reply: string) {
    const embed = new MessageEmbed()
        .setColor(color)
        .setDescription(reply)

    message.reply({ embeds: [embed] });

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
        .setDescription('<:error:935248898086273045> ' + message)
    
    channel.send({ embeds: [embed] });

    return null;
}