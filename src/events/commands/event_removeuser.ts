import { MessageEmbed } from 'discord.js';
import { client } from '../../client';
import { registerCommand } from '../../utils/commands';
import { sendError } from '../../utils/embeds';
import { updateEventEmbeds } from '../embeds';
import { events, saveEvents } from '../persistence';

registerCommand('event_removeuser', ['event_removeusers', 'event_remove_user', 'eru'], async message => {
    const messageContent = message.content.replace(/  +/g, ' ');
    const event_id = messageContent.split(' ')[1].trim();
    let event_role = messageContent.split(' ')[2].trim();
    let user = message.mentions.users.first();
    let smartMatch = false;

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
                const fields = [];

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
        sendError(message.channel, "Unable to remove user from event, no such event ID was found");
        return;
    } else if (!user) {
        sendError(message.channel, "Please mention the user in your message. Notes can be provided after the mention.");
        return;
    } else if (!events[event_id].signups.hasOwnProperty(event_role)) {
        sendError(message.channel, "Invalid role, role should be one of `tank`, `healer`, `dps`, `tank_subs`, `healer_subs`, or `dps_subs`");
        return;
    }

    delete events[event_id].signups[event_role][user.id];
    saveEvents();
    updateEventEmbeds(events[event_id]);

    if (smartMatch) {
        message.channel.send({ embeds: [new MessageEmbed()
            .setColor("#0099ff")
            .setDescription(`✅ Removed <@${user.id}> as a ${event_role.replace(/(tank|healer)s/, '$1')} from [${events[event_id].title}](${message.url.replace(message.id, events[event_id].id)})`)
        ]});
    } else {
        message.react('👍');
    }
});
