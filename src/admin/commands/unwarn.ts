import { Message, MessageEmbed, Permissions } from 'discord.js';
import { bot } from '../../bot';
import { EMBED_ERROR_COLOR, EMBED_SUCCESS_COLOR, getFormattedDate, makeError, startTyping } from '../../utils';

import { loadPersistentData, savePersistentData } from '../../utils';

bot.registerCommand('unwarn', [], async message => {
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

    for (let warning of warnings[message.guildId][warnedUser.id]) {
        warning.cleared = true;
        warning.clearReason = warnReason;
    }

    savePersistentData('warnings', warnings);

    const embed = new MessageEmbed()
        .setColor(EMBED_SUCCESS_COLOR)
        .setAuthor({
            iconURL: warnedUser.displayAvatarURL() || '',
            name: `${warnedUser?.tag}'s warnings have been cleared`
        })
        .setDescription(`**Reason:** ${warnReason}`);

    await message.channel.send({ embeds: [embed] });
});
