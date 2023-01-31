import { Message, TextChannel } from 'discord.js';
import { createWelcomeChannel } from '../../admin/welcome_channel';
import { bot } from '../../bot';
import { client } from '../../client';
import { CLOWNS_GUILD_ID } from '../../constants';
import { findMembers, makeTable, sendReply, EMBED_ERROR_COLOR, EMBED_INFO_COLOR, log } from '../../utils';

bot.registerCommand('debug', [], async message => {
    let [subCommand, params] = bot.parseCommand(message, /(.*?) (.*)/);
    
    if (!message.guild) {
        message.reply('Sorry, this command can only be used in a Server');
        return;
    } else if (message.author.id !== '200716538729201664') {
        message.reply('Sorry, this command can only be used by Cad');
        return;
    }

    if (subCommand === 'usersearch') {
        let members = await findMembers(message.guild, params);

        if (members.length === 0) {
            bot.replyTo(message, EMBED_ERROR_COLOR, 'No users were found that matched your search parameter');
            return;
        } else if (members.length === 1) {
            bot.replyTo(message, EMBED_INFO_COLOR, `One user was found that match your search parameters: <@${members[0]?.user.id}>`);
            return;
        }

        const fields: string[][] = [];

        for (let member of members) {
            fields.push([ member.user.id, member.user.tag, member.displayName ])
        }

        const embed = makeTable(['User ID', 'User Tag', 'Display Name'], fields)
            .setColor("#0099ff")
            .setDescription(`Multiple users were found that matched your query, please try again using their ID or Tag:`);
        message.channel.send({ embeds: [embed] });
        return;
    } else if (subCommand === 'welcome' && message instanceof Message) {
        createWelcomeChannel(message.mentions.members?.first(), false);
    } else if (subCommand === 'unarchivethread' && message instanceof Message) {
        const channel = message.mentions.channels.first() as TextChannel;
        const archivedThreads = await channel.threads.fetchArchived();
        const existingThread = archivedThreads.threads.find(x => x.id === params.split(' ')[1]);
        
        if (existingThread) {
            log('info', `Unarchiving thread ${existingThread.id} (${existingThread.name})`);
            await existingThread.setArchived(false);
            await existingThread.setLocked(false);
            log('info', `  The thread should now be reopened`);
            message.react('👍');
        } else {
            message.react('👎');
        }
    } else if (subCommand === 'archivethread' && message instanceof Message) {
        const channel = message.mentions.channels.first() as TextChannel;
        const existingThread = channel.threads.cache.find(x => x.id === params.split(' ')[1]);
        
        if (existingThread) {
            log('info', `Archiving thread ${existingThread.id} (${existingThread.name})`);
            await existingThread.setLocked(true);
            await existingThread.setArchived(true);
            log('info', `  The thread should now be archived`);
            message.react('👍');
        } else {
            message.react('👎');
        }
    } else if (subCommand === 'deletemessage') {
        // https://discord.com/channels/722929163291328653/758161334847143957/1069971437227606046
        const parts = params.match(/channels\/([0-9]+)\/([0-9]+)\/([0-9]+)/i);
        const guild = client.guilds.cache.get(parts[1]);
        const channel = await guild?.channels.fetch(parts[2]) as TextChannel;
        const msg = await channel.messages.fetch(parts[3])
        
        if (msg) {
            await msg.delete();
            message.react('👍');
        } else {
            message.react('👎');
        }
    } else if (subCommand === 'getroles') {
        const guild = client.guilds.cache.get(params);
        const roles = await guild?.roles.fetch();
        
        if (roles) {
            let roleList = `Here are the roles in ${guild.name}\n\n`;
            for (let [_id, role] of roles) {
                roleList += `${role.name} (${role.id})\n`;
            }
            message.channel.send(roleList);
        } else {
            message.react('👎');
        }
    }
});
