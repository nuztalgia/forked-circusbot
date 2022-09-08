import { ComponentType } from 'discord-api-types';
import { MessageActionRow, MessageSelectMenu } from 'discord.js';
import { bot } from '../../bot';
import { sendError, sendReply, EMBED_SUCCESS_COLOR, findMembers, EMBED_ERROR_COLOR, makeTable } from '../../utils';
import { updateEventEmbeds } from '../embeds';
import { findEvent, saveEvents } from '../persistence';

bot.registerCommand('event_adduser', ['event_addusers', 'event_add_user', 'eau'], async message => {
    let [eventId, eventRole, eventUser, userNotes] = bot.parseCommand(message, /(.*?) (.*?) (.*?)(?: |$)(.*)?/);

    if (!eventId || !eventRole || !eventUser) {
        sendError(message.channel, 'Invalid syntax. The correct syntax is:\n\n`!event_adduser <EVENT_ID> <ROLE> <USER> <NOTES>`');
        return;
    }

    let user = message.mentions.users.first();
    let smartMatch = false;
    let updated = false;

    if (eventRole === 'heal' || eventRole === 'healer' || eventRole === 'heals') {
        eventRole = 'healers';
    } else if (eventRole === 'tank') {
        eventRole = 'tanks';
    } else if (eventRole === 'heal_sub' || eventRole === 'healer_sub' || eventRole === 'healsub' || eventRole === 'healersub') {
        eventRole = 'healer_subs ';
    } else if (eventRole === 'dps_sub' || eventRole === 'dpssub') {
        eventRole = 'dps_subs ';
    }else if (eventRole === 'tank_sub' || eventRole === 'tanksub') {
        eventRole = 'tank_subs ';
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
            const fields: any = [];

            for (let member of users) {
                if (!member) continue;
                fields.push({ description: member.user.tag, label: member.displayName, value: member.id })
            }

            const row = new MessageActionRow()
                .addComponents(
                    new MessageSelectMenu()
                        .setCustomId('event_adduser_select')
                        .setPlaceholder('Select the correct user')
                        .addOptions(...fields),
                );

            const filter = i => {
                i.deferUpdate();
                return i.user.id === message.author.id;
            };
        
            await message.reply({ content: `Multiple users were found that matched your query, please select the correct user to add:`, components: [row] });
            
            let interaction = await message.channel.awaitMessageComponent({ filter, componentType: 'SELECT_MENU', time: 120000 });

            user = users.find(u => u?.id == interaction.values[0])?.user;
            setTimeout(() => interaction.deleteReply(), 150);
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
        sendError(message.channel, "Invalid role, role should be one of `tank`, `healer`, `dps`, `tank_subs`, `healer_subs`, `dps_subs`, `group1`, `group2`, `group3`, `tentative`, or `notgoing`");
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
        bot.replyTo(message, EMBED_SUCCESS_COLOR, `✅ Updated <@${user.id}> for [${event.title}](${message.url.replace(message.id, event.id)})`);
    } else if (smartMatch) {
        bot.replyTo(message, EMBED_SUCCESS_COLOR, `✅ Added <@${user.id}> as a ${eventRole.replace(/(tank|healer)s/, '$1')} to [${event.title}](${message.url.replace(message.id, event.id)})`);
    } else {
        message.react('👍');
    }

    saveEvents();
    updateEventEmbeds(event);
});
