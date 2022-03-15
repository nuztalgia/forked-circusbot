import { MessageEmbed } from 'discord.js';
import { bot } from '../../bot';
import { EMBED_INFO_COLOR, getDisplayName, sendError } from '../../utils';
import { findEvent } from '../persistence';

bot.registerCommand('ping_event', ['event_ping'], async message => {
    const [eventId, _, pingMsg] = bot.parseCommand(message, /([0-9]+) +([\S]+) +(.*)/);
    const targetChannel = message.mentions.channels.first();
    const event = findEvent(eventId);

    if (!event) {
        sendError(message.channel, "Unable to ping event, invalid event ID provided");
        return;
    } else if (!targetChannel) {
        sendError(message.channel, "Please mention the channel in your message. Correct usage:\n\n`!ping_event 123456789 #event-signups Now forming up, please x in guild`");
        return;
    } else if (!pingMsg) {
        sendError(message.channel, "Please provide a message for the ping. Correct usage:\n\n`!ping_event 123456789 #event-signups Now forming up, please x in guild`");
        return;
    }

    let allUsers = Object.keys(event.signups.tanks);
    allUsers = allUsers.concat(Object.keys(event.signups.healers));
    allUsers = allUsers.concat(Object.keys(event.signups.dps));

    const embed = new MessageEmbed()
        .setColor(EMBED_INFO_COLOR)
        .setAuthor({ iconURL: message.author.avatarURL() || '', name: await getDisplayName(message.author, message.guild) })
        .setFooter({ text: `Ping sent for the event '${event.title}'` })
        .setDescription(pingMsg)

    targetChannel.send({ content: allUsers.map(x => `<@${x}>`).join(' '), embeds: [embed] });
});
