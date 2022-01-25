import { MessageEmbed, TextBasedChannel } from 'discord.js';
import { beginEventCreation, registerEventCreator } from './events/creator';
import { events, saveEvents } from './events/persistence';
import { createEventEmbed, updateEventEmbeds } from './events/embeds';
import { registerEventReactions } from './events/reaction_signups';
import { sendError, sendMessage } from './utils/embeds';
import { client } from './client';
import config from '../config.json';
import { log } from './utils/logging';

client.on('ready', () => {
  log('info', `Logged in as ${client?.user?.tag}!`);

  for (const event of Object.values(events)) {
      if (event.open_signups_at) {
        log('debug', `Rescheduled event open for event ${event.id} (${event.title})`);

        setTimeout(function() {
            log('info', `Opening event ${event.id} (${event.title}) for sign-ups via scheduled !event_open`);
            event.signup_status = 'open';
            event.open_signups_at = null;
            saveEvents();
            updateEventEmbeds(event);
        }, Date.parse(event.open_signups_at) - Date.now());
      }
  }
});

client.on('messageCreate', async (message) => {
    if (message.author.bot) return;

    const messageContent = message.content.replace(/  +/g, ' ');
    const cmd = messageContent.toLowerCase().split(' ')[0];

    // console.log('Message received: ' + message + ', cmd: ' + cmd);

    // Only allow prefixed commands from here
    if (!cmd.startsWith(config.BOT_PREFIX)) return;

    if (cmd === '!create_event' || cmd === '!ce') {
        // Administrative functions can only be run in the whitelisted channels
        if (!check_permissions('create_event', message.channel)) return;

        beginEventCreation(message, false);
    } else if (cmd === '!quick_create' || cmd === '!qc') {
        // Administrative functions can only be run in the whitelisted channels
        if (!check_permissions('create_event', message.channel)) return;

        beginEventCreation(message, true);
    } else if (cmd === '!edit_event' || cmd === '!ee') {
        // Administrative functions can only be run in the whitelisted channels
        if (!check_permissions('edit_event', message.channel)) return;

        if (!messageContent.match('(.*?) (.*?) (.*?) (.*)')) {
            sendError(message.channel, "Unknown Field", "Incorrect syntax to edit event event. Correct usage:\n\n" +
                "`!edit_event <EVENT_ID> <FIELD_NAME> <NEW VALUE>`\n\n" +
                "Example:\n\n" +
                "`!edit_event 123456789 tank_requirements Previous tank clear in 8m required`\n\n" +
                "Valid fields:\n\n" +
                " - title\n" + 
                " - description\n" +
                " - date\n" +
                " - time\n" +
                " - tank_requirements\n" +
                " - healer_requirements\n" + 
                " - dps_requirements\n" + 
                " - tank_limit\n" +
                " - healer_limit\n" + 
                " - dps_limit");
            message.react('👎');
            return;
        }

        const event_id = messageContent.split(' ')[1]?.trim();
        const event_field = messageContent.split(' ')[2]?.trim();
        const event_value = messageContent.match('(.*?) (.*?) (.*?) (.*)')[4].trim();

        if (!events.hasOwnProperty(event_id)) {
            sendError(message.channel, "Invalid Event", "Unable to edit event, no such event ID was found");
            return;
        }

        if (event_field === 'tank_requirements' || event_field === 'tank_reqs') {
            events[event_id].role_requirements.tank = event_value;
        } else if (event_field === 'heal_requirements' || event_field === 'healer_requirements' || event_field === 'healer_reqs') {
            events[event_id].role_requirements.healer = event_value;
        } else if (event_field === 'dps_requirements' || event_field === 'dps_reqs') {
            events[event_id].role_requirements.dps = event_value;
        } else if (event_field === 'tank_limit') {
            events[event_id].role_limits.tank = parseInt(event_value);
        } else if (event_field === 'heal_limit' || event_field === 'healer_limit') {
            events[event_id].role_limits.healer = parseInt(event_value);
        } else if (event_field === 'dps_limit') {
            events[event_id].role_limits.dps = parseInt(event_value);
        } else if (events[event_id].hasOwnProperty(event_field)) {
            events[event_id][event_field] = event_value;
        } else {
            sendError(message.channel, "Unknown Field", "Unable to edit event, field was not recognized. Valid fields:\n\n" +
                " - title\n" + 
                " - description\n" +
                " - date\n" +
                " - time\n" +
                " - tank_requirements\n" +
                " - healer_requirements\n" + 
                " - dps_requirements\n" + 
                " - tank_limit\n" +
                " - healer_limit\n" + 
                " - dps_limit");
            message.react('👎');
            return;
        }

        saveEvents();
        updateEventEmbeds(events[event_id]);
        message.react('👍');
    } else if (cmd === '!open_event' || cmd === '!oe') {
        // Administrative functions can only be run in the whitelisted channels
        if (!check_permissions('open_event', message.channel)) return;

        const event_id = messageContent.split(' ')[1];
        let scheduled_time = messageContent.match('(.*?) (.*?) (.*)') ? messageContent.match('(.*?) (.*?) (.*)')[3].trim() : null;

        if (!events.hasOwnProperty(event_id)) {
            sendError(message.channel, "Invalid Event", "Unable to open event, no such event ID was found");
            return;
        }

        if (scheduled_time) {
            scheduled_time = scheduled_time.replace(/ *(AM|PM)/, " $1");

            if (scheduled_time.match(/^[0-9]{1,2}:[0-9]{2} (AM|PM)/i)) {
                let d = new Date();
                scheduled_time = d.getFullYear() + "-" + ('0' + (d.getMonth() + 1)).slice(-2) + "-" + ('0' + d.getDate()).slice(-2) + ' ' + scheduled_time;
            }

            let openAt = Date.parse(scheduled_time);

            if (!openAt) {
                message.react("👎");
                sendError(message.channel, "Invalid Date/Time", "Unable to parse date/time format, please use YYYY-MM-DD HH:mm:ss AM|PM");
                return;
            }

            setTimeout(function() {
                log('info', `Opening event ${events[event_id].id} (${events[event_id].title}) for sign-ups via scheduled !event_open`);
                events[event_id].signup_status = 'open';
                events[event_id].open_signups_at = null;
                saveEvents();
                updateEventEmbeds(events[event_id]);
            }, openAt - Date.now());

            events[event_id].open_signups_at = scheduled_time;
            sendMessage(message.channel, `✅ I will open sign-ups for ${messageContent.split(' ')[1]} in ${Math.floor((openAt - Date.now()) / (60*60*1000))} hours ${Math.floor(((openAt - Date.now()) / (60*1000)) % 60)} minutes`);
            saveEvents();
        } else {
            events[event_id].signup_status = 'open';
            saveEvents();
            updateEventEmbeds(events[event_id]);
            sendMessage(message.channel, `✅ Event ${messageContent.split(' ')[1]} is now open for sign-ups!`);
        }

        message.react('👍');
    } else if (cmd === '!close_event' || cmd === '!ce') {
        // Administrative functions can only be run in the whitelisted channels
        if (!check_permissions('close_event', message.channel)) return;

        const event_id = messageContent.split(' ')[1];

        if (!events.hasOwnProperty(event_id)) {
            sendError(message.channel, "Invalid Event", "Unable to close event, no such event ID was found");
            return;
        }

        events[event_id].signup_status = 'closed';
        saveEvents();
        updateEventEmbeds(events[event_id]);

        sendMessage(message.channel, `✅ Event ${messageContent.split(' ')[1]} is now closed for sign-ups!`);
        message.react('👍');
    } else if (cmd === '!list_events' || cmd === '!le' || cmd === '!list_event') {
        if (!check_permissions('list_events', message.channel)) return;

        let fields = [];
        const showAll = messageContent.match(/(-a|-A|all)/);

        for (const event of Object.values(events)) {
            if (!event.published_channels.hasOwnProperty(message.channel.id)) continue;
            if (Date.parse((event.date + ' ' + event.time) || '') <= Date.now() && !showAll) continue;

            fields.push([ `[${event.id}](${message.url.replace(message.id, event.id || '')})`, event.date + ' ' + event.time, event.title ])
        }

        const embed = new MessageEmbed()
            .setColor("#0099ff");

        if (fields.length === 0) {
            embed.setDescription(`There are no upcoming events in this channel. You can create an event using the \`!create_event\` command.`);
        } else {
            embed.setDescription(`${showAll ? 'All' : 'Upcoming'} events in this channel:`)
                .addFields([ 
                    { name: 'Event ID', value: fields.map(x => x[0]).join('\n'), inline: true },
                    { name: 'Date', value: fields.map(x => x[1]).join('\n'), inline: true },
                    { name: 'Title', value: fields.map(x => x[2]).join('\n'), inline: true },
                ]);
        }

        message.channel.send({ embeds: [embed] });
    } else if (cmd === '!refresh_event' || cmd === '!re') {
        // Administrative functions can only be run in the whitelisted channels
        if (!check_permissions('refresh_event', message.channel)) return;

        updateEventEmbeds(events[messageContent.split(' ')[1]]);

        sendMessage(message.channel, `✅ Event ${messageContent.split(' ')[1]} has been rebuilt across all channels`);
        message.react('👍');
    } else if (cmd === '!event_adduser' || cmd === '!eau' || cmd === '!event_addusers') {
        // Administrative functions can only be run in the whitelisted channels
        if (!check_permissions('event_adduser', message.channel)) return;

        const event_id = messageContent.split(' ')[1].trim();
        const event_value = messageContent.match('(.*?) (.*?) (.*?) (.*?) (.*)');
        let user = message.mentions.users.first();
        let event_role = messageContent.split(' ')[2].trim();
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
                    sendError(message.channel, "Invalid User", "No users matched your search criteria, please use a tag (e.g. @Cad#1234) or mention");
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
            sendError(message.channel, "Invalid Event", "Unable to add user to event, no such event ID was found");
            return;
        } else if (!user) {
            sendError(message.channel, "Invalid User", "Please mention the user in your message. Notes can be provided after the mention.");
            return;
        } else if (!events[event_id].signups.hasOwnProperty(event_role)) {
            sendError(message.channel, "Invalid Role", "Invalid role, role should be one of `tank`, `healer`, `dps`, `tank_subs`, `healer_subs`, or `dps_subs`");
            return;
        }

        events[event_id].signups[event_role][user.id] = ((await message.guild?.members.fetch(user.id)).displayName || user.tag);

        if (event_value && event_value.length === 6) {
            if ((events[event_id].signups[event_role][user.id] + event_value[5]).length > 20) {
                events[event_id].signups[event_role][user.id]  = events[event_id].signups[event_role][user.id].substring(0, 20 - event_value[5].length) + ' ' + event_value[5];
            } else {
                events[event_id].signups[event_role][user.id] += ' ' + event_value[5];
            }
        }

        if (smartMatch) {
            message.channel.send({ embeds: [new MessageEmbed()
                .setColor("#0099ff")
                .setDescription(`Added <@${user.id}> as a ${event_role} to the event ${events[event_id].title} (${events[event_id].id})`)
            ]});
        }

        saveEvents();
        updateEventEmbeds(events[event_id]);
        message.react('👍');
    } else if (cmd === '!event_removeuser' || cmd === '!eru') {
        // Administrative functions can only be run in the whitelisted channels
        if (!check_permissions('event_removeuser', message.channel)) return;

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
                    sendError(message.channel, "Invalid User", "No users matched your search criteria, please use a tag (e.g. @Cad#1234) or mention");
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
            sendError(message.channel, "Invalid Event", "Unable to remove user from event, no such event ID was found");
            return;
        } else if (!user) {
            sendError(message.channel, "Invalid User", "Please mention the user in your message. Notes can be provided after the mention.");
            return;
        } else if (!events[event_id].signups.hasOwnProperty(event_role)) {
            sendError(message.channel, "Invalid Role", "Invalid role, role should be one of `tank`, `healer`, `dps`, `tank_subs`, `healer_subs`, or `dps_subs`");
            return;
        }

        delete events[event_id].signups[event_role][user.id];
        saveEvents();
        updateEventEmbeds(events[event_id]);
        message.react('👍');

        if (smartMatch) {
            message.channel.send({ embeds: [new MessageEmbed()
                .setColor("#0099ff")
                .setDescription(`Removed <@${user.id}> as a ${event_role} from the event ${events[event_id].title} (${events[event_id].id})`)
            ]});
        }
    } else if (cmd === '!publish_event' || cmd === '!pe') {
        // Administrative functions can only be run in the whitelisted channels
        if (!check_permissions('publish_event', message.channel)) return;

        const event_id = messageContent.split(' ')[1];
        const target_channel = message.mentions.channels.first();

        if (!events.hasOwnProperty(event_id)) {
            sendError(message.channel, "Invalid Event", "Unable to publish event, no such event ID was found");
            return;
        }
        
        if (!target_channel) {
            sendError(message.channel, "Invalid Channel", "Please mention the channel in your message");
            return;
        }
        
        const embed = createEventEmbed(events[event_id]);

        try {
            let msg = await target_channel.send({ embeds: [embed] });
            events[event_id].published_channels[target_channel.id] = msg.id;
            saveEvents();
            updateEventEmbeds(events[event_id]);
            message.react('👍');
        } catch (error) {
            sendError(message.channel, 'Publish Failed', error.toString());
            message.react('👎');
        }
    } else if (cmd === '!ping_event' || cmd === '!event_ping') {
        // Administrative functions can only be run in the whitelisted channels
        if (!check_permissions('ping_event', message.channel)) return;

        const event_id = messageContent.split(' ')[1].trim();
        const target_channel = message.mentions.channels.first();
        const ping_msg = messageContent.match('(.*?) (.*?) (.*?) (.*)')[4].trim();

        if (!events.hasOwnProperty(event_id)) {
            sendError(message.channel, "Invalid Event", "Unable to ping event, no such event ID was found");
            return;
        } else if (!target_channel) {
            sendError(message.channel, "Invalid Channel", "Please mention the channel in your message");
            return;
        } else if (!ping_msg) {
            sendError(message.channel, "Invalid Message", "Please provide a message for the ping");
            return;
        }

        let allUsers = Object.keys(events[event_id].signups.tanks);
        allUsers = allUsers.concat(Object.keys(events[event_id].signups.healers));
        allUsers = allUsers.concat(Object.keys(events[event_id].signups.dps));

        target_channel.send(allUsers.map(x => `<@${x}>`).join(' ') + ' ' + ping_msg);
    } else if (cmd === '!export_event') {
        // Administrative functions can only be run in the whitelisted channels
        if (!check_permissions('export_event', message.channel)) return;

        const event_id = messageContent.split(' ')[1].trim();

        if (!events.hasOwnProperty(event_id)) {
            sendError(message.channel, "Invalid Event", "Unable to export event, no such event ID was found");
            return;
        }

        const dmLogEmbed = new MessageEmbed()
            .setColor("#0099ff")
            .setDescription(`\`\`\`\n${JSON.stringify(events[event_id], null, 2)}\n\`\`\``);

        message.channel.send({ embeds: [dmLogEmbed] });
    } else if (cmd === '!help' || cmd === '!eventhelp' || cmd === '!event_help') {
        if (!check_permissions('event_help', message.channel)) return;

        let helpMsg = '';

        if (check_permissions('create_event', message.channel, false)) {
            helpMsg += "🗓️ `create_event`\nBegin creating a new event. Only one event may be created at a time.\n**Example:** `!create_event`\n\n";
        }
        if (check_permissions('create_event', message.channel, false)) {
            helpMsg += "⏲️ `quick_create`\nBegin creating a new event (using streamlined defaults). Only one event may be created at a time.\n**Example:** `!quick_create`\n\n";
        }
        if (check_permissions('edit_event', message.channel, false)) {
            helpMsg += "📝 `edit_event <EVENT_ID> <EVENT_FIELD> <NEW_VALUE>`\nEdit a field/option for an existing event. Only one field can be edited at a time.\n**Example:** `!edit_event 123456789 tank_requirements Previous tank clear required`\n\n";
        }
        if (check_permissions('export_event', message.channel, false)) {
            helpMsg += "📧 `export_event <EVENT_ID>`\nExport the JSON for an event (useful for troubleshooting or recreating an event)\n**Example:** `!export_event 123456789`\n\n";
        }
        if (check_permissions('open_event', message.channel, false)) {
            helpMsg += "🔓 `open_event <EVENT_ID> <TIME*>`\nOpen an event to allow sign-ups (reaction emojis will be added to the post - it may take a few seconds to update all published posts). Optionally specify a time to schedule when to open the event for sign-ups.\n**Example:** `!open_event 123456789 7:30 PM`\n\n";
        }
        if (check_permissions('close_event', message.channel, false)) {
            helpMsg += "🔒 `close_event <EVENT_ID>`\nClose an event to prevent sign-ups (reaction emojis will be removed from the post)\n**Example:** `!close_event 123456789`\n\n";
        }
        if (check_permissions('event_adduser', message.channel, false)) {
            helpMsg += "🏃 `event_adduser <EVENT_ID> <ROLE> <USER> <NOTES>`\nAdd a user to the sign-ups (roles are tank/healers/dps). Notes appear next to the username. The USER must be a MENTION.\n**Example:** `!event_adduser 123456789 tank @Cad#1234 (Titax)`\n\n";
        }
        if (check_permissions('event_removeuser', message.channel, false)) {
            helpMsg += "🚪 `event_removeuser <EVENT_ID> <ROLE> <USER>`\nRemove a user from the sign-ups (roles are tank/healers/dps). The USER must be a mention.\n**Example:** `!event_removeuser 123456789 tank @Cad#1234`\n\n";
        }
        if (check_permissions('ping_event', message.channel, false)) {
            helpMsg += "🔔 `ping_event <EVENT_ID> <TARGET_CHANNEL> <MESSAGE>`\nPing all signed up users (non-subs) with a custom message (e.g. to inform them you are forming up). The channel should be a channel mention not regular text.\n**Example:** `!ping_event 123456789 #lfg-groupfinder Now forming up pubside, please whisper Cadriel or x in allies`\n\n";
        }
        if (check_permissions('publish_event', message.channel, false)) {
            helpMsg += "🌎 `publish_event <EVENT_ID> <TARGET_CHANNEL>`\nPublish the event to the specified channel. All published events are sychronized. The channel must be a mention.\n**Example:** `!publish_event 123456789 #event-signups`\n\n";
        }
        if (check_permissions('list_events', message.channel, false)) {
            helpMsg += "📆 `list_events`\nList all upcoming events in the current channel.\n**Example:** `!list_events`\n\n";
        }

        if (!helpMsg) {
            sendMessage(message.channel, "There are no commands whitelisted for this channel");
        }

        sendMessage(message.channel, helpMsg);
    }
});

registerEventCreator(client);
registerEventReactions(client);

function check_permissions(command: string, channel: TextBasedChannel, showError = true) {
    if (config.PERMISSIONS.hasOwnProperty(channel.id) && (config.PERMISSIONS[channel.id].includes("*") || config.PERMISSIONS[channel.id].includes(command))) return true;

    if (showError) {
        sendError(channel, "Permission Denied", "Sorry, but I can only run this command in whitelisted channels.");
    }

    return false;
}

process.on('unhandledRejection', error => {
    console.error('Unhandled rejection: ', error);
});

client.login(config.BOT_TOKEN);
