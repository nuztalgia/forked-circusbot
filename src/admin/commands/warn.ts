import { Message, MessageEmbed, Permissions } from 'discord.js';
import { bot } from '../../bot';
import { EMBED_ERROR_COLOR, getFormattedDate, makeError, startTyping } from '../../utils';

import { loadPersistentData, savePersistentData } from '../../utils';

bot.registerCommand('warn', [], async message => {
    const [_user, warnReason] = bot.parseCommand(message, /(<.*?> )(.*)/);
    const warnedUser = message.mentions.users.first();

    await startTyping(message.channel);

    if (!(message instanceof Message) || !message.guild) {
        return;
    }

    const warnings = loadPersistentData('warnings', {});
    const member = await message.guild.members.fetch(message.author.id)

    if (!member.permissions.has(Permissions.FLAGS.KICK_MEMBERS)) {
        bot.replyTo(message, EMBED_ERROR_COLOR, makeError("Sorry, but you don't have permission to do that"));
        return;
    }

    if (!warnings.hasOwnProperty(message.guildId)) {
        warnings[message.guildId] = {};
    }

    if (!warnings[message.guildId].hasOwnProperty(warnedUser.id)) {
        warnings[message.guildId][warnedUser.id] = [];
    }

    warnings[message.guildId][warnedUser.id].push({
        warnedBy: message.author.id,
        warnedByTag: message.author.tag,
        reason: warnReason,
        createdAt: getFormattedDate(new Date()),
        channel: message.channelId,
        channelName: message.channel.name,
        warnCommandId: message.id,
        warnedMessageId: message.reference?.messageId,
    });

    savePersistentData('warnings', warnings);

    const embed = new MessageEmbed()
        .setColor(EMBED_ERROR_COLOR)
        .setAuthor({
            iconURL: warnedUser.displayAvatarURL() || '',
            name: `${warnedUser?.tag} has been warned`
        })
        .setDescription(`**Reason:** ${warnReason}`);

    await message.channel.send({ embeds: [embed] });
});
