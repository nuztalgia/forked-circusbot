import { MessageEmbed, TextChannel } from "discord.js";
import { client } from "../client";
import { diffDate, EMBED_INFO_COLOR, findMembers, getFormattedDate } from "../utils";
import { getConfig } from "./configuration";

client.on('messageDelete', async message => {
	// Ignore direct messages
	if (!message.guild) return;

    // Is the deletion log feature enabled?
    const config = getConfig(message.guild.id, 'admin', { deletion_log_channel: null });
    if (!config.deletion_log_channel) return;
    const logChannel = await client.channels.fetch(config.deletion_log_channel) as TextChannel;

    // Grab the most recent MEMBER_KICK audit event to see if this user was kicked or left on their own
    const fetchedDeletes = await message.guild?.fetchAuditLogs({ limit: 1, type: 'MESSAGE_DELETE' });
    const deletionLog = fetchedDeletes.entries.first();
    
	// Perform a coherence check to make sure that there's *something*
	if (!deletionLog) {
        return console.log(`A message by ${message.author?.tag} in #${message.channel.name} was deleted, but no relevant audit logs were found.`);
    }

    console.log(deletionLog);

    if (deletionLog.target.id === message.author?.id && deletionLog.extra.channel.id === message.channelId && diffDate(deletionLog.createdAt, new Date()) < 60) {
		console.log(`A message by ${message.author.tag} in #${message.channel.name} was deleted by ${deletionLog.executor?.tag}.`);
        let content = message.content?.split("\n").join("\n> ");

        // Send the message in the designated channel
        const embed = new MessageEmbed()
        .setColor(EMBED_INFO_COLOR)
        .setAuthor({
            iconURL: message.author.displayAvatarURL() || '',
            name: `${deletionLog.executor?.tag} deleted a message from ${message.author.tag}`
        })
        .setFooter({ text: `Audit log recorded at ${getFormattedDate(deletionLog.createdAt)} • Audit ID #${deletionLog.id}` })
        .setDescription(`<@${deletionLog.executor?.id}> deleted a message in <#${message.channel.id}> from <@${message.author.id}>. Message content:\n\n> ${content}`);

        await logChannel.send({ embeds: [embed] });
    } else if (!message.author && deletionLog.extra.channel.id === message.channelId && diffDate(deletionLog.createdAt, new Date()) < 60) {
        // attempt to find the user
        let members = await findMembers(message.guild, `<@${deletionLog.target.id}>`);
        let author = `<@${deletionLog.target.id}>`;

        if (members.length === 1) {
            author = members[0]?.user.tag || '';
        }

		console.log(`A message by ${author} in #${message.channel.name} was deleted by ${deletionLog.executor?.tag}.`);

        // Send the message in the designated channel
        const embed = new MessageEmbed()
        .setColor(EMBED_INFO_COLOR)
        .setAuthor({
            iconURL: members[0]?.displayAvatarURL() || '',
            name: `${deletionLog.executor?.tag} deleted a message from ${author}`
        })
        .setFooter({ text: `Audit log recorded at ${getFormattedDate(deletionLog.createdAt)} • Audit ID #${deletionLog.id}` })
        .setDescription(`<@${deletionLog.executor?.id}> deleted a message in <#${message.channel.id}> from <@${deletionLog.target.id}>. No message content available (bot cache does not contain the deleted message)`);

        await logChannel.send({ embeds: [embed] });
    } else {
        console.log(`A message by ${message.author?.tag} in #${message.channel.name} was deleted (no corresponding audit log detected - user probably deleted their own message`);
    }
});

client.on('messageDeleteBulk', async messages => {

});