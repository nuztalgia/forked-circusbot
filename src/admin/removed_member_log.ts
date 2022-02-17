import { GuildTextBasedChannel, MessageEmbed } from "discord.js";
import { client } from "../client";
import { EMBED_ERROR_COLOR, getFormattedDate, log } from "../utils";

client.on('guildMemberAdd', async member => {
    log('info', `${member.user.tag} has just joined ${member.guild.name}`);
});

client.on('guildMemberRemove', async member => {
    let channel: GuildTextBasedChannel, goodbye: string, message: string;

    log('info', `${member.user.tag} has just left ${member.guild.name}`);

    // TODO: Replace with configuration
    if (member.guild.id === '621354743972888602') { // Sandbox
        channel = await client.channels.fetch('814616443919532062') as GuildTextBasedChannel;
    } else if (member.guild.id === '722929163291328653') { // Clowns
        channel = await client.channels.fetch('943953689704554588') as GuildTextBasedChannel;
    } else {
        return;
    }

	// Grab the most recent MEMBER_KICK audit event to see if this user was kicked or left on their own
	const fetchedLogs = await member.guild.fetchAuditLogs({ limit: 1, type: 'MEMBER_KICK' });
	const kickLog = fetchedLogs.entries.first();
    
    if (kickLog && kickLog.target.id === member.id) {
        message = 'just got kicked from the server!'
        goodbye = `Good riddance! Thanks <@${kickLog.executor.id}> for taking out the trash <:pepetrash:740924034493055038>`
    } else {
        message = 'just left the server!';
        goodbye = `Sad! Let's just hope that they enjoyed their stay <:sadge:786846456769544253>`;
    }

    let roles = member.roles.cache.mapValues(x => x.name).filter(x => x !== '@everyone');
    let roleText = roles.size > 0 ? `Their roles were:\n\n${roles.map(x => `- ${x}`).join('\n')}` : `They had no roles (maybe they were new)`;
    const embed = new MessageEmbed()
        .setColor(EMBED_ERROR_COLOR)
        .setAuthor({
            iconURL: member.user.displayAvatarURL() || '',
            name: `${member.user.tag} ${message}`
        })
        .setDescription(`${goodbye}\n\nThey initially joined the server on ${getFormattedDate(member.joinedAt)}. ${roleText}`)

    channel.send({ embeds: [embed] });
});