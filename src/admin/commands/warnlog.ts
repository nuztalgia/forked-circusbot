import { Message, MessageEmbed, Permissions } from 'discord.js';
import { bot } from '../../bot';
import { EMBED_ERROR_COLOR, EMBED_INFO_COLOR, makeError, makeTable, loadPersistentData } from '../../utils';

bot.registerCommand('warnlog', [], async message => {
    const warnedUser = message.mentions.users.first();
    await bot.startTyping(message.channel);

    if (!(message instanceof Message) || !message.guild) {
        return;
    } else if (!warnedUser) {
        return bot.execCommand('warnhistory', message);
    }

    const member = await message.guild.members.fetch(message.author.id);
    const warnings = loadPersistentData('warnings', {});
    let userWarnings = [];

    if (!member.permissions.has(Permissions.FLAGS.KICK_MEMBERS) && member.id !== warnedUser.id) {
        bot.replyTo(message, EMBED_ERROR_COLOR, makeError("Sorry, but you don't have permission to do that"));
        return;
    }

    if (!warnings.hasOwnProperty(message.guildId)) {
        userWarnings = [];
    } else if (!warnings[message.guildId].hasOwnProperty(warnedUser.id)) {
        userWarnings = [];
    } else {
        userWarnings = warnings[message.guildId][warnedUser.id].filter(x => x.cleared !== true);
    }
    
    let embed;

    if (userWarnings.length === 0) {
        embed = new MessageEmbed()
            .setColor(EMBED_INFO_COLOR)
            .setDescription(`<@${warnedUser.id}> has no warnings`);
    } else {
        embed = makeTable(['Warn Date', 'Link', 'Reason'], userWarnings.map(warning => { 
            return [
                warning.createdAt,
                `[Jump](https://discord.com/channels/${message.guildId}/${warning.channel}/${warning.warnCommandId})`,
                (warning.reason || '').length > 42 ? warning.reason.substring(0, 39) + '...' : warning.reason,
            ] 
        }));
    }

    embed = embed.setAuthor({
        iconURL: warnedUser.displayAvatarURL() || '',
        name: `${warnedUser?.tag}'s warnings`
    });

    await message.channel.send({ embeds: [embed] });
});
