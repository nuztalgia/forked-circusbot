import { Message, MessageEmbed, Permissions, TextChannel } from 'discord.js';
import { bot } from '../../bot';
import { getFormattedDate, makeError, loadPersistentData, savePersistentData } from '../../utils';

bot.registerCommand('warn', [], async message => {
    const [_user, warnReason] = bot.parseCommand(message, /(<.*?> )(.*)/);
    const warnedUser = message.mentions.users.first();
    const warnings = loadPersistentData('warnings', {});
    const member = await message.guild?.members.fetch(message.author.id)

    await bot.startTyping(message.channel);

    if (!(message instanceof Message) || !message.guild || !(message.channel instanceof TextChannel)) {
        return;
    } else if (!warnedUser) {
        return bot.replyTo(message, bot.COLORS.ERROR, makeError("Please specify a user to warn"));
    } else if (!member?.permissions.has(Permissions.FLAGS.KICK_MEMBERS)) {
        bot.replyTo(message, bot.COLORS.ERROR, makeError("Sorry, but you don't have permission to do that"));
        return;
    }

    if (!warnings.hasOwnProperty(message.guildId)) {
        warnings[message.guild.id] = {};
    }

    if (!warnings[message.guild.id].hasOwnProperty(warnedUser.id)) {
        warnings[message.guild.id][warnedUser.id] = [];
    }

    warnings[message.guild.id][warnedUser.id].push({
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
        .setColor(bot.COLORS.ERROR)
        .setAuthor({
            iconURL: warnedUser.displayAvatarURL() || '',
            name: `${warnedUser?.tag} has been warned`
        })
        .setDescription(`**Reason:** ${warnReason}`);

    await message.channel.send({ embeds: [embed] });
});
