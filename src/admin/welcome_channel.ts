import { Guild, GuildMember, TextChannel } from "discord.js";
import { client } from "../client";
import { CLOWNS_GUILD_ID, SANDBOX_GUILD_ID } from "../constants";
import { findMembers, getFormattedDate, loadPersistentData, log, randomStr, savePersistentData } from "../utils";

const userWelcomeChannels = loadPersistentData('welcome', {});

client.on('ready', async () => {
  client.guilds.cache.forEach(async guild => {
    userWelcomeChannels[guild.id] ||= {};

    await guild.channels.fetch();

    guild.channels.cache.forEach(async channel => {
        if (!channel.name.startsWith('🎪welcome') || channel.id === '729373949607149628' || !(channel instanceof TextChannel)) {
            return;
        }

        let username = channel.topic?.match(/, (.*)\!/i)[1] || '';

        if (!username) {
            return;
        }

        let member = await findMembers(channel.guild, username);

        if (!member || member.length === 0) {
            const memberId = Object.keys(userWelcomeChannels[guild.id]).find(key => userWelcomeChannels[guild.id][key] === channel.id);
            archiveWelcomeChannel(memberId, username, guild, `${username} has left the server`);
        } else if (member && member.length === 1 && member[0]?.roles.cache.size > 1) {
            const memberId = Object.keys(userWelcomeChannels[guild.id]).find(key => userWelcomeChannels[guild.id][key] === channel.id);
            archiveWelcomeChannel(memberId, username, guild, `${username} was given a role`);
        }
    })
  });
});

client.on('guildMemberAdd', async member => {
    log('info', `${member.user.tag} has just joined ${member.guild.name}`);

    // CLOWNS_GUILD_ID, 
    if (![CLOWNS_GUILD_ID, SANDBOX_GUILD_ID].includes(member.guild.id)) {
        return;
    }

    createWelcomeChannel(member);
});

client.on('guildMemberUpdate', async (oldMember, newMember) => {
    if (oldMember.roles.cache.size === 1 && newMember.roles.cache.size > 1 && userWelcomeChannels[newMember.guild.id].hasOwnProperty(newMember.id)) {
        archiveWelcomeChannel(newMember.id, newMember.user.tag, newMember.guild, `${newMember.user.tag} was given a role`);
    }
});

client.on('guildMemberRemove', async member => {
    if (userWelcomeChannels[member.guild.id].hasOwnProperty(member.id)) {
        archiveWelcomeChannel(member.id, member.user.tag, member.guild, `${member.user.tag} has left the server`);
    }
});

export async function createWelcomeChannel(member: GuildMember, ping: boolean) {
    const adminRole = member.guild.id === SANDBOX_GUILD_ID ? '943583538068983919' : '930859147925291018';
    let name = randomStr(6);

    let channel = await member.guild.channels.create(`🎪welcome-${name}`, {
        type: 'GUILD_TEXT',
        position: 0,
        reason: `${member.user.tag} has just joined ${member.guild.name}`,
        topic: `Welcome to the Cirque, ${member.user.tag}!`,
        permissionOverwrites: [
            {
                // Start with an explicit deny for @everyone
                id: member.guild.id,
                deny: ['VIEW_CHANNEL'],
            },
            {
                // Allow CirqueBot to view the new channel
                id: client.user.id,
                allow: ['VIEW_CHANNEL', 'SEND_MESSAGES', 'READ_MESSAGE_HISTORY'],
            },
            {
                // Allow the Clowncil role to see the new channel
                id: adminRole,
                allow: ['VIEW_CHANNEL', 'SEND_MESSAGES', 'READ_MESSAGE_HISTORY'],
            },
            {
                // Allow the newly joined member to see the channel
                id: member.id,
                allow: ['VIEW_CHANNEL', 'SEND_MESSAGES', 'READ_MESSAGE_HISTORY'],
		    }
        ],
      });

    userWelcomeChannels[member.guild.id][member.id] = channel.id;
    savePersistentData('welcome', userWelcomeChannels);

    let allowedMentions = ping ? {} : { parse: [] };
    
    channel.send({ allowedMentions, content: `Welcome to the Cirque, <@${member.id}>! <a:clownHonk1:859282161605410846><a:clownHonk2:859282176494272522><a:clownHonk3:859282188708479016>\nPlease wait while an admin sets you up with the proper role to view our server.` });
}

async function archiveWelcomeChannel(memberId: string, userTag: string, guild: Guild, reason: string) {
    const channel = await client.channels.fetch(userWelcomeChannels[guild.id][memberId]);

    if (!channel || !(channel instanceof TextChannel)) {
        log('warn', `Unable to archive welcome channel for ${userTag} in ${guild.name}: Could not find channel`);
        return;
    }

    const messages = await channel.messages.fetch();

    log('info', `Deleting welcome channel for ${userTag} in ${guild.name} (${reason})`);

    let messageLog = '';

    messages.reverse().forEach(message => {
        messageLog += `[${getFormattedDate(message.createdAt)}] ${message.author.tag}: ${message.content}\n`;
    });

    guild.systemChannel?.send(`The welcome channel for <@${memberId}> has been archived (${reason}). Transcript:\n\n\`\`\`\n${messageLog}\`\`\``);

    channel?.delete(reason);
    delete userWelcomeChannels[guild.id][memberId];
    savePersistentData('welcome', userWelcomeChannels);
}