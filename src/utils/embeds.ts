import { MessageEmbed, TextBasedChannel } from "discord.js";

export function sendMessage(channel: TextBasedChannel, message: string) {
    const embed = new MessageEmbed()
        .setColor("#0099ff")
        .setDescription(message)

    channel.send({ embeds: [embed] });

    return null;
}

export function sendError(channel: TextBasedChannel, title: string, message: string) {
    const embed = new MessageEmbed()
        .setColor("#ff0000")
        .setDescription("<:error:935248898086273045> " + message)
    
    channel.send({ embeds: [embed] });

    return null;
}