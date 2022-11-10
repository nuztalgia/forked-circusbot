import { Message, MessageEmbed, Permissions } from 'discord.js';
import { bot } from '../../bot';
import { makeError, makeTable, loadPersistentData } from '../../utils';

bot.registerCommand('warnhistory', [], async message => {
    await bot.startTyping(message.channel);

    if (!(message instanceof Message) || !message.guild) {
        return;
    }

    const member = await message.guild.members.fetch(message.author.id);
    const warnings = loadPersistentData('warnings', {});
    let userWarnings = [];

    if (!member.permissions.has(Permissions.FLAGS.KICK_MEMBERS)) {
        bot.replyTo(message, bot.COLORS.ERROR, makeError("Sorry, but you don't have permission to do that"));
        return;
    }

    if (warnings.hasOwnProperty(message.guildId)) {
        for (let [user, userWarns] of Object.entries(warnings[message.guildId])) {
            for (let warning of userWarns) {
                userWarnings.push({ ...warning, warnedUserId: user });
            }
        }
    }

    userWarnings = userWarnings.filter(x => x.cleared !== true).sort((a, b) => new Date(b.date) - new Date(a.date)).reverse();

    let embed;

    if (userWarnings.length === 0) {
        embed = new MessageEmbed()
            .setColor(bot.COLORS.INFO)
            .setDescription(`The warning history for this server is empty. You can issue a warning with the \`!warn\` command`);
    } else {
        embed = makeTable(['User', 'Link', 'Reason'], userWarnings.slice(0, 24).map(warning => { 
            return [
                `<@${warning.warnedUserId}>`,
                `[Jump](https://discord.com/channels/${message.guildId}/${warning.channel}/${warning.warnCommandId})`,
                (warning.reason || '').length > 42 ? warning.reason.substring(0, 39) + '...' : (warning.reason || 'No reason given'),
            ] 
        }));
    }

    embed = embed.setAuthor({
        iconURL: '',
        name: `Recent Warn History`
    });

    await message.channel.send({ embeds: [embed] });
});
