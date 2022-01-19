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
        .setThumbnail('https://media.discordapp.net/attachments/814616443919532062/933036449052381234/299045_sign_error_icon.png?width=48&height=48')
        .setTitle(title)
        .setDescription(message)
    
    channel.send({ embeds: [embed] });

    return null;
}