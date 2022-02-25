import { GuildTextBasedChannel, MessageEmbed } from "discord.js";
import { client } from "../client";
import { arrayRandom, diffDate, EMBED_ERROR_COLOR, getFormattedDate, log } from "../utils";

const memberLeftMessages = [
    `Sad! Let's just hope that they enjoyed their stay <:sadge:786846456769544253>`,
    `Awww man, hopefully they enjoyed their stay <:sadge:786846456769544253>`,
    `Oh no, another one bites the dust! Hopefully they enjoyed their stay <:sadge:786846456769544253>`,
    `That's disappointing! Let's just hope they enjoyed their stay <:sadge:786846456769544253>`,
];

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
    const fetchedBans = await member.guild.fetchAuditLogs({ limit: 1, type: 'MEMBER_BAN_ADD' });
	const fetchedLogs = await member.guild.fetchAuditLogs({ limit: 1, type: 'MEMBER_KICK' });
    const banLog = fetchedBans.entries.first();
	const kickLog = fetchedLogs.entries.first();
    
    // Custom messages for kicked users versus those who left on their own
    if (banLog && banLog.target?.id === member.id && diffDate(banLog.createdAt, new Date()) < 300) {
        message = 'just got banned from the server!'
        goodbye = `And don't EVER come back <:pepeGun:821569090304999424>! Thanks <@${banLog.executor?.id}> for taking care of that. Reason: ${banLog.reason?.trim()}`
    } else if (kickLog && kickLog.target?.id === member.id && diffDate(kickLog.createdAt, new Date()) < 300) {
        message = 'just got kicked from the server!'
        goodbye = `Good riddance! Thanks <@${kickLog.executor?.id}> for taking out the trash <:pepetrash:740924034493055038>. Reason: ${kickLog.reason?.trim()}`
    } else if (diffDate(member.joinedAt, new Date()) < 60 * 60 * 4) {
        message = 'just left the server!';
        goodbye = `Aww man, they didn't even get to know us yet <:sadge:786846456769544253>`;
    } else {
        message = 'just left the server!';
        goodbye = arrayRandom(memberLeftMessages);
    }

    // Include their roles so they can be restored easier if the user accidentally left or comes back later
    let roles = member.roles.cache.filter(x => x.name !== '@everyone');
    let roleText = roles.size > 0 ? `Their roles were:\n\n${roles.map(x => `- <@&${x.id}>`).join('\n')}` : `They had no roles (maybe they were new)`;
    let nickname = member.nickname ? `. Their nickname was ${member.nickname}` : '';

    // Send the message in the designated channel
    const embed = new MessageEmbed()
        .setColor(EMBED_ERROR_COLOR)
        .setAuthor({
            iconURL: member.user.displayAvatarURL() || '',
            name: `${member.user.tag} ${message}`
        })
        .setDescription(`${goodbye}\n\nThey initially joined the server on ${getFormattedDate(member.joinedAt)}${nickname}. ${roleText}`)

    channel.send({ embeds: [embed] });
});