import { MessageEmbed } from 'discord.js';
import { bot } from '../../bot';
import { client } from '../../client';
import { findMembers } from '../../utils';
import { EMBED_ERROR_COLOR, makeTable, sendError, sendReply } from '../../utils/replies';
import { updateEventEmbeds } from '../embeds';
import { events, saveEvents } from '../persistence';

bot.registerCommand('event_removeuser', ['event_removeusers', 'event_remove_user', 'eru'], async message => {
    let [eventId, eventRole, eventUser] = bot.parseCommand(message, /(.*?) (.*?) (.*)/);

    if (!eventId || !eventRole || !eventUser) {
        sendError(message.channel, 'Invalid syntax. The correct syntax is:\n\n`!event_removeuser <EVENT_ID> <EVENT_ROLE> <USER>`');
        return;
    }

    let user = message.mentions.users.first();
    let smartMatch = false;

    if (eventRole === 'heal' || eventRole === 'healer' || eventRole === 'heals') {
        eventRole = 'healers';
    } else if (eventRole === 'tank') {
        eventRole = 'tanks';
    }

    if (!user && message.guild) {
        smartMatch = true;
        let users = await findMembers(message.guild, eventUser);

        if (users.length === 0) {
            bot.replyTo(message, EMBED_ERROR_COLOR, "No users matched your search criteria, please use a tag (e.g. @Cad#1234) or mention");
            return;
        } else if (users.length === 1) {
            user = users[0]?.user;
        } else {
            const fields: string[][] = [];

            for (let member of users) {
                fields.push([ member.user.id, member.user.tag, member.displayName ])
            }

            const embed = makeTable(['User Id', 'User Tag', 'Display Name'], fields)
                .setDescription(`Multiple users were found that matched your query, please try again using their ID or Tag:`);
            message.reply({ embeds: [embed] });
            return;
        }
    }

    if (!events.hasOwnProperty(eventId)) {
        sendError(message.channel, "Unable to remove user from event, no such event ID was found");
        return;
    } else if (!user) {
        sendError(message.channel, "Please mention the user in your message. Notes can be provided after the mention.");
        return;
    } else if (!events[eventId].signups.hasOwnProperty(eventRole)) {
        sendError(message.channel, "Invalid role, role should be one of `tank`, `healer`, `dps`, `tank_subs`, `healer_subs`, or `dps_subs`");
        return;
    }

    delete events[eventId].signups[eventRole][user.id];
    saveEvents();
    updateEventEmbeds(events[eventId]);

    if (smartMatch) {
        message.channel.send({ embeds: [new MessageEmbed()
            .setColor("#0099ff")
            .setDescription(`✅ Removed <@${user.id}> as a ${eventRole.replace(/(tank|healer)s/, '$1')} from [${events[eventId].title}](${message.url.replace(message.id, events[eventId].id)})`)
        ]});
    } else {
        message.react('👍');
    }
});
