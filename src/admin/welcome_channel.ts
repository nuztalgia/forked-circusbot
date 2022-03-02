import { Guild, GuildMember, OverwriteResolvable, TextChannel } from "discord.js";
import { client } from "../client";
import { CLOWNS_GUILD_ID, SANDBOX_GUILD_ID } from "../constants";
import { findMember, getFormattedDate, loadPersistentData, log, randomStr, savePersistentData } from "../utils";
import { getConfig } from "./configuration";

const userWelcomeChannels = loadPersistentData('welcome', {});

// Cleanup any welcome channels that should have been deleted by event handlers, but
// maybe the bot wasn't running.
client.on('ready', async () => {
  client.guilds.cache.forEach(async guild => {
    userWelcomeChannels[guild.id] ||= {};

    const config = getConfig(guild.id, 'welcome', { enabled: false });
    if (!config.enabled) return;

    await guild.channels.fetch();

    guild.channels.cache.forEach(async channel => {
        if (!channel.name.startsWith(config.prefix) || !(channel instanceof TextChannel) || !channel.topic) {
            return;
        }

        const username = (channel.topic?.match(/, (.*)\!/i) || [])[1];
        const memberId = Object.keys(userWelcomeChannels[guild.id]).find(key => userWelcomeChannels[guild.id][key] === channel.id);

        if (!memberId || !username) {
            return;
        }

        const member = await findMember(channel.guild, username);

        if (member === null) {
            archiveWelcomeChannel(memberId, username, guild, `${username} has left the server`);
        } else if (member.roles.cache.size > 1) {
            archiveWelcomeChannel(memberId, username, guild, `${username} was given a role`);
        }
    })
  });
});

client.on('guildMemberAdd', async member => {
    log('info', `${member.user.tag} has just joined ${member.guild.name}`);

    const config = getConfig(member.guild.id, 'welcome', { enabled: false });
    if (!config.enabled) return;

    createWelcomeChannel(member, true);
});

// When a guild member is updated, check if its a member who has no roles, receiving a
// role (e.g. a new user receiving the Piglet role).
client.on('guildMemberUpdate', async (oldMember, newMember) => {
    if (oldMember.roles.cache.size === 1 && newMember.roles.cache.size > 1 && userWelcomeChannels[newMember.guild.id].hasOwnProperty(newMember.id)) {
        archiveWelcomeChannel(newMember.id, newMember.user.tag, newMember.guild, `${newMember.user.tag} was given a role`);
    }
});

// When a guild member is removed/leaves the server, delete their welcome channel if they
// have one.
client.on('guildMemberRemove', async member => {
    if (userWelcomeChannels[member.guild.id].hasOwnProperty(member.id)) {
        archiveWelcomeChannel(member.id, member.user.tag, member.guild, `${member.user.tag} has left the server`);
    }
});

/**
 * Create a welcome channel for the specified member. Can optionally ping/not ping the member,
 * e.g. if this feature is being enabled on a server that didn't previously use it.
 * @param member The GuildMember to create a welcome channel for
 * @param ping Whether or not to ping the user in the welcome message
 */
export async function createWelcomeChannel(member: GuildMember, ping: boolean) {
    const config = getConfig(member.guild.id, 'welcome', {});
    const name = randomStr(6);

    const channel = await member.guild.channels.create(`${config.prefix}${name}`, {
        type: 'GUILD_TEXT',
        position: 0,
        reason: `${member.user.tag} has just joined ${member.guild.name}`,
        topic: `Welcome to ${member.guild.name}, ${member.user.tag}!`,
        permissionOverwrites: [
            {
                // Start with an explicit deny for @everyone
                id: member.guild.id,
                deny: ['VIEW_CHANNEL'],
            },
        ].concat(config.admin_roles.concat(client.user?.id, member.id).map(x => {
            return {
                id: x,
                allow: ['VIEW_CHANNEL', 'SEND_MESSAGES', 'READ_MESSAGE_HISTORY'],
            };
        })) as OverwriteResolvable[],
      });

    userWelcomeChannels[member.guild.id][member.id] = channel.id;
    savePersistentData('welcome', userWelcomeChannels);

    channel.send({ 
        allowedMentions: ping ? {} : { parse: [] },
        content: config.greeting.replace(/<user>/i, `<@${member.id}>`).replace(/<server>/i, member.guild.name)
    });
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