import { Message, MessageEmbed, Permissions } from 'discord.js';
import { bot } from '../../bot';
import { makeError, loadPersistentData, savePersistentData } from '../../utils';

bot.registerCommand('unwarn', [], async message => {
    const [_user, warnReason] = bot.parseCommand(message, /(<.*?> )(.*)/);
    const warnedUser = message.mentions.users.first();
    const warnings = loadPersistentData('warnings', {});
    const member = await message.guild?.members.fetch(message.author.id)
    
    await bot.startTyping(message.channel);

    if (!(message instanceof Message) || !message.guild) {
        return;
    } else if (!warnedUser) {
        return bot.replyTo(message, bot.COLORS.ERROR, makeError("Please specify a user to unwarn"));
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

    for (let warning of warnings[message.guild.id][warnedUser.id]) {
        warning.cleared = true;
        warning.clearReason = warnReason;
    }

    savePersistentData('warnings', warnings);

    const embed = new MessageEmbed()
        .setColor(bot.COLORS.SUCCESS)
        .setAuthor({
            iconURL: warnedUser.displayAvatarURL() || '',
            name: `${warnedUser?.tag}'s warnings have been cleared`
        })
        .setDescription(`**Reason:** ${warnReason}`);

    await message.channel.send({ embeds: [embed] });
});
