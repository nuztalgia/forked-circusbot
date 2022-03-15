import { Message, TextChannel } from 'discord.js';
import { createWelcomeChannel } from '../../admin/welcome_channel';
import { bot } from '../../bot';
import { findMembers, makeTable, sendReply, EMBED_ERROR_COLOR, EMBED_INFO_COLOR, log } from '../../utils';

bot.registerCommand('debug', [], async message => {
    let [subCommand, params] = bot.parseCommand(message, /(.*?) (.*)/);
    
    if (!message.guild) {
        message.reply('Sorry, this command can only be used in a Server');
        return;
    }

    if (subCommand === 'usersearch') {
        let members = await findMembers(message.guild, params);

        if (members.length === 0) {
            bot.sendReply(message, EMBED_ERROR_COLOR, 'No users were found that matched your search parameter');
            return;
        } else if (members.length === 1) {
            bot.sendReply(message, EMBED_INFO_COLOR, `One user was found that match your search parameters: <@${members[0]?.user.id}>`);
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
    } else if (subCommand === 'archivethread' && message instanceof Message) {
        const channel = message.mentions.channels.first() as TextChannel;
        const existingThread = channel.threads.cache.find(x => x.id === params.split(' ')[1]);
        
        if (existingThread) {
            log('info', `Archiving thread ${existingThread.id} (${existingThread.name})`);
            await existingThread.setLocked(true);
            await existingThread.setArchived(true);
            log('info', `  Archived thread should now be archived`);
            message.react('👍');
        } else {
            message.react('👎');
        }
    }
});
