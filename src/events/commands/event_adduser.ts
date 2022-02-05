import { MessageEmbed } from 'discord.js';
import { parseCommand, registerCommand, sendError, sendReply, EMBED_SUCCESS_COLOR } from '../../utils';
import { client } from '../../client';
import { updateEventEmbeds } from '../embeds';
import { findEvent, saveEvents } from '../persistence';

registerCommand('event_adduser', ['event_addusers', 'event_add_user', 'eau'], async message => {
    let [eventId, eventRole, eventUser, userNotes] = parseCommand(message, /(.*?) (.*?) (.*?)(?: |$)(.*)?/);

    if (!eventId || !eventRole || !eventUser) {
        sendError(message.channel, 'Invalid syntax. The correct syntax is:\n\n`!event_adduser <EVENT_ID> <eventRole> <USER> <NOTES>`');
        return;
    }

    let user = message.mentions.users.first();
    let smartMatch = false;
    let updated = false;

    if (eventRole === 'heal' || eventRole === 'healer' || eventRole === 'heals') {
        eventRole = 'healers';
    } else if (eventRole === 'tank') {
        eventRole = 'tanks';
    }

    if (!user) {
        smartMatch = true;

        if (eventUser.match(/^@?(.*?#[0-9]{4})$/)) {
            const userTag = eventUser.replace(/^@/, '');

            // Fetch any members with similar names
            await message.guild?.members.fetch({ query: userTag.split('#')[0] });
            user = client.users.cache.find(u => u.tag === userTag);
        } else {
            // Fetch any members with similar names
            let query = await message.guild?.members.fetch({ query: eventUser, limit: 20 });

            if (!query || query.size === 0) {
                sendError(message.channel, "No users matched your search criteria, please use a tag (e.g. @Cad#1234) or mention");
                return;
            } else if (query.size === 1) {
                user = query.last()?.user;
            } else {
                const fields: string[][] = [];

                for (let [_id, member] of query) {
                    fields.push([ member.user.id, member.user.tag, member.displayName ])
                }

                const embed = new MessageEmbed()
                    .setColor("#0099ff")
                    .setDescription(`Multiple users were found that matched your query, please try again using their ID or Tag:`)
                    .addFields([ 
                        { name: 'User ID', value: fields.map(x => x[0]).join('\n'), inline: true },
                        { name: 'User Tag', value: fields.map(x => x[1]).join('\n'), inline: true },
                        { name: 'Display Name', value: fields.map(x => x[2]).join('\n'), inline: true },
                    ]);
                message.channel.send({ embeds: [embed] });
                return;
            }
        }
    }

    const event = findEvent(eventId);

    if (!event) {
        sendError(message.channel, "Unable to add user to event, no such event ID was found");
        return;
    } else if (!user) {
        sendError(message.channel, "Please mention the user in your message. Notes can be provided after the mention.");
        return;
    } else if (!event.signups.hasOwnProperty(eventRole)) {
        sendError(message.channel, "Invalid role, role should be one of `tank`, `healer`, `dps`, `tank_subs`, `healer_subs`, or `dps_subs`");
        return;
    }

    updated = event.signups[eventRole].hasOwnProperty(user.id);
    event.signups[eventRole][user.id] = ((await message.guild?.members.fetch(user.id)).displayName || user.tag);

    if (userNotes) {
        if ((event.signups[eventRole][user.id] + userNotes).length > 20) {
            event.signups[eventRole][user.id]  = event.signups[eventRole][user.id].substring(0, 20 - userNotes.length) + ' ' + userNotes;
        } else {
            event.signups[eventRole][user.id] += ' ' + userNotes;
        }
    }

    if (updated) {
        sendReply(message, EMBED_SUCCESS_COLOR, `✅ Updated <@${user.id}> for [${event.title}](${message.url.replace(message.id, event.id)})`);
    } else if (smartMatch) {
        sendReply(message, EMBED_SUCCESS_COLOR, `✅ Added <@${user.id}> as a ${eventRole.replace(/(tank|healer)s/, '$1')} to [${event.title}](${message.url.replace(message.id, event.id)})`);
    } else {
        message.react('👍');
    }

    saveEvents();
    updateEventEmbeds(event);
});
