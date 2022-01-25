import { MessageEmbed } from 'discord.js';
import { client } from '../../client';
import { registerCommand } from '../../utils/commands';
import { sendError } from '../../utils/embeds';
import { updateEventEmbeds } from '../embeds';
import { events, saveEvents } from '../persistence';

registerCommand('event_adduser', ['event_addusers', 'event_add_user', 'eau'], async message => {
    const messageContent = message.content.replace(/  +/g, ' ');

    if (messageContent.split(' ').length < 4) {
        sendError(message.channel, 'Invalid syntax. The correct syntax is:\n\n`!event_adduser <EVENT_ID> <EVENT_ROLE> <USER> <NOTES>`');
        return;
    }

    const event_id = messageContent.split(' ')[1].trim();
    const event_value = messageContent.match('(.*?) (.*?) (.*?) (.*?) (.*)');
    let user = message.mentions.users.first();
    let event_role = messageContent.split(' ')[2].trim();
    let smartMatch = false;
    let updated = false;

    if (event_role === 'heal' || event_role === 'healer' || event_role === 'heals') {
        event_role = 'healers';
    } else if (event_role === 'tank') {
        event_role = 'tanks';
    }

    if (!user) {
        smartMatch = true;

        if (messageContent.match(/(.*?) (.*?) (.*?) @?(.*?#[0-9]{4})/)) {
            const user_tag = messageContent.match(/(.*?) (.*?) (.*?) @?(.*?#[0-9]{4})/)[4];

            // Fetch any members with similar names
            await message.guild?.members.fetch({ query: user_tag.split('#')[0] });
            user = client.users.cache.find(u => u.tag === user_tag);
        } else if (messageContent.match(/(.*?) (.*?) (.*?) ([\S]+)/)) {
            const user_name = messageContent.match(/(.*?) (.*?) (.*?) ([\S]+)/)[4];

            // Fetch any members with similar names
            let query = await message.guild?.members.fetch({ query: user_name, limit: 20 });

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

    if (!events.hasOwnProperty(event_id)) {
        sendError(message.channel, "Unable to add user to event, no such event ID was found");
        return;
    } else if (!user) {
        sendError(message.channel, "Please mention the user in your message. Notes can be provided after the mention.");
        return;
    } else if (!events[event_id].signups.hasOwnProperty(event_role)) {
        sendError(message.channel, "Invalid role, role should be one of `tank`, `healer`, `dps`, `tank_subs`, `healer_subs`, or `dps_subs`");
        return;
    }

    updated = events[event_id].signups[event_role].hasOwnProperty(user.id);
    events[event_id].signups[event_role][user.id] = ((await message.guild?.members.fetch(user.id)).displayName || user.tag);

    if (event_value && event_value.length === 6) {
        if ((events[event_id].signups[event_role][user.id] + event_value[5]).length > 20) {
            events[event_id].signups[event_role][user.id]  = events[event_id].signups[event_role][user.id].substring(0, 20 - event_value[5].length) + ' ' + event_value[5];
        } else {
            events[event_id].signups[event_role][user.id] += ' ' + event_value[5];
        }
    }

    if (updated) {
        message.channel.send({ embeds: [new MessageEmbed()
            .setColor("#77b255")
            .setDescription(`✅ Updated <@${user.id}> for [${events[event_id].title}](${message.url.replace(message.id, events[event_id].id)})`)
        ]});
    } else if (smartMatch) {
        message.channel.send({ embeds: [new MessageEmbed()
            .setColor("#77b255")
            .setDescription(`✅ Added <@${user.id}> as a ${event_role.replace(/(tank|healer)s/, '$1')} to [${events[event_id].title}](${message.url.replace(message.id, events[event_id].id)})`)
        ]});
    } else {
        message.react('👍');
    }

    saveEvents();
    updateEventEmbeds(events[event_id]);
});
