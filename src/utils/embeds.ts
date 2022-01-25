import { MessageEmbed, TextBasedChannel } from 'discord.js';

export function sendMessage(channel: TextBasedChannel, message: string) {
    const embed = new MessageEmbed()
        .setColor('#77b255')
        .setDescription(message)

    channel.send({ embeds: [embed] });

    return null;
}

export function sendError(channel: TextBasedChannel, message: string) {
    const embed = new MessageEmbed()
        .setColor('#e14f5e')
        .setDescription('<:error:935248898086273045> ' + message)
    
    channel.send({ embeds: [embed] });

    return null;
}