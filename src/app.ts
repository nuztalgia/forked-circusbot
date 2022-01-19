import { MessageEmbed, TextBasedChannel } from 'discord.js';
import { beginEventCreation, registerEventCreator } from './events/creator';
import { events, saveEvents } from './events/persistence';
import { createEventEmbed, updateEventEmbeds } from './events/embeds';
import { registerEventReactions } from './events/reaction_signups';
import { sendError, sendMessage } from './utils/embeds';
import { client } from './client';
import config from '../config.json';

client.on('ready', () => {
  console.log(`Logged in as ${client?.user?.tag}!`);
});

client.on('messageCreate', async (message) => {
    if (message.author.bot) return;

    let cmd = message.content.toLowerCase().split(' ')[0];

    // console.log('Message received: ' + message + ', cmd: ' + cmd);

    // Only allow prefixed commands from here
    if (!cmd.startsWith(config.BOT_PREFIX)) return;

    if (cmd === '!create_event' || cmd === '!ce') {
        // Administrative functions can only be run in the whitelisted channels
        if (!is_channel_whitelisted(message.channel)) return;

        beginEventCreation(message);
    } else if (cmd === '!edit_event' || cmd === '!ee') {
        // Administrative functions can only be run in the whitelisted channels
        if (!is_channel_whitelisted(message.channel)) return;

        const event_id = message.content.split(' ')[1].trim();
        const event_field = message.content.split(' ')[2].trim();
        const event_value = message.content.match('(.*?) (.*?) (.*?) (.*)')[4].trim();

        if (!events.hasOwnProperty(event_id)) {
            sendError(message.channel, "Invalid Event", "Unable to edit event, no such event ID was found");
            return;
        }

        if (event_field === 'tank_requirements') {
            events[event_id].role_requirements.tank = event_value;
        } else if (event_field === 'heal_requirements' || event_field === 'healer_requirements') {
            events[event_id].role_requirements.healer = event_value;
        } else if (event_field === 'dps_requirements') {
            events[event_id].role_requirements.dps = event_value;
        } else if (event_field === 'tank_limits') {
            events[event_id].role_limits.tank = parseInt(event_value);
        } else if (event_field === 'heal_limits' || event_field === 'healer_limits') {
            events[event_id].role_limits.healer = parseInt(event_value);
        } else if (event_field === 'dps_limits') {
            events[event_id].role_limits.dps = parseInt(event_value);
        } else if (events[event_id].hasOwnProperty(event_field)) {
            events[event_id][event_field] = event_value;
        } else {
            sendError(message.channel, "Unknown Field", "Unable to evdit event, field was not recognized. Valid fields:\n\n" +
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
        if (!is_channel_whitelisted(message.channel)) return;

        const event_id = message.content.split(' ')[1];

        if (!events.hasOwnProperty(event_id)) {
            sendError(message.channel, "Invalid Event", "Unable to open event, no such event ID was found");
            return;
        }

        events[event_id].signup_status = 'open';
        saveEvents();
        updateEventEmbeds(events[event_id]);

        sendMessage(message.channel, `✅ Event ${message.content.split(' ')[1]} is now open for sign-ups!`);
        message.react('👍');
    } else if (cmd === '!close_event' || cmd === '!ce') {
        // Administrative functions can only be run in the whitelisted channels
        if (!is_channel_whitelisted(message.channel)) return;

        const event_id = message.content.split(' ')[1];

        if (!events.hasOwnProperty(event_id)) {
            sendError(message.channel, "Invalid Event", "Unable to close event, no such event ID was found");
            return;
        }

        events[event_id].signup_status = 'closed';
        saveEvents();
        updateEventEmbeds(events[event_id]);

        sendMessage(message.channel, `✅ Event ${message.content.split(' ')[1]} is now closed for sign-ups!`);
        message.react('👍');
    } else if (cmd === '!refresh_event' || cmd === '!re') {
        // Administrative functions can only be run in the whitelisted channels
        if (!is_channel_whitelisted(message.channel)) return;

        updateEventEmbeds(events[message.content.split(' ')[1]]);

        sendMessage(message.channel, `✅ Event ${message.content.split(' ')[1]} has been rebuilt across all channels`);
        message.react('👍');
    } else if (cmd === '!event_adduser' || cmd === '!eau' || cmd === '!event_addusers') {
        // Administrative functions can only be run in the whitelisted channels
        if (!is_channel_whitelisted(message.channel)) return;

        const event_id = message.content.split(' ')[1].trim();
        let event_role = message.content.split(' ')[2].trim();
        const event_value = message.content.match('(.*?) (.*?) (.*?) (.*?) (.*)');

        if (event_role === 'heal' || event_role === 'healer' || event_role === 'heals') {
            event_role = 'healers';
        } else if (event_role === 'tank') {
            event_role = 'tanks';
        }

        if (!events.hasOwnProperty(event_id)) {
            sendError(message.channel, "Invalid Event", "Unable to add user to event, no such event ID was found");
            return;
        }
        
        let user = message.mentions.users.first();

        if (!user) {
            sendError(message.channel, "Invalid User", "Please mention the user in your message. Notes can be provided after the mention.");
            return;
        }

        events[event_id].signups[event_role][user.id] = ((await message.guild?.members.fetch(user.id)).displayName || user.tag);

        if (event_value && event_value.length === 6) {
            events[event_id].signups[event_role][user.id] += ' ' + event_value[5];
        }

        saveEvents();
        updateEventEmbeds(events[event_id]);
        message.react('👍');
    } else if (cmd === '!event_removeuser' || cmd === '!eru') {
        // Administrative functions can only be run in the whitelisted channels
        if (!is_channel_whitelisted(message.channel)) return;

        const event_id = message.content.split(' ')[1].trim();
        let event_role = message.content.split(' ')[2].trim();

        if (event_role === 'heal' || event_role === 'healer' || event_role === 'heals') {
            event_role = 'healers';
        } else if (event_role === 'tank') {
            event_role = 'tanks';
        }

        if (!events.hasOwnProperty(event_id)) {
            sendError(message.channel, "Invalid Event", "Unable to remove user from event, no such event ID was found");
            return;
        }
        
        let user = message.mentions.users.first();

        if (!user) {
            sendError(message.channel, "Invalid User", "Please mention the user in your message");
            return;
        }

        delete events[event_id].signups[event_role][user.id];
        saveEvents();
        updateEventEmbeds(events[event_id]);
        message.react('👍');
    } else if (cmd === '!publish_event' || cmd === '!pe') {
        // Administrative functions can only be run in the whitelisted channels
        if (!is_channel_whitelisted(message.channel)) return;

        const event_id = message.content.split(' ')[1];
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
        if (!is_channel_whitelisted(message.channel)) return;

        const event_id = message.content.split(' ')[1].trim();
        const ping_msg = message.content.match('(.*?) (.*?) (.*)')[3].trim();

        if (!events.hasOwnProperty(event_id)) {
            sendError(message.channel, "Invalid Event", "Unable to ping event, no such event ID was found");
            return;
        }

        if (!ping_msg) {
            sendError(message.channel, "Invalid Message", "Please provide a custom message for the ping");
            return;
        }

        let allUsers = Object.keys(events[event_id].signups.tanks);
        allUsers = allUsers.concat(Object.keys(events[event_id].signups.healers));
        allUsers = allUsers.concat(Object.keys(events[event_id].signups.dps));

        message.channel.send(allUsers.map(x => `<@${x}>`).join(' ') + ' ' + ping_msg);
    } else if (cmd === '!export_event') {
        // Administrative functions can only be run in the whitelisted channels
        if (!is_channel_whitelisted(message.channel)) return;

        const event_id = message.content.split(' ')[1].trim();

        if (!events.hasOwnProperty(event_id)) {
            sendError(message.channel, "Invalid Event", "Unable to export event, no such event ID was found");
            return;
        }

        const dmLogEmbed = new MessageEmbed()
            .setColor("#0099ff")
            .setDescription(`\`\`\`\n${JSON.stringify(events[event_id], null, 2)}\n\`\`\``);

        message.channel.send({ embeds: [dmLogEmbed] });
    } else if (cmd === '!help' || cmd === '!eventhelp' || cmd === '!event_help') {
        if (!is_channel_whitelisted(message.channel)) return;

        sendMessage(message.channel, "🗓️ `create_event`\nBegin creating a new event. Only one event may be created at a time.\n**Example:** `!create_event`\n\n" + 
            "📝 `edit_event <EVENT_ID> <EVENT_FIELD> <NEW_VALUE>`\nEdit a field/option for an existing event. Only one field can be edited at a time.\n**Example:** `!edit_event 123456789 tank_requirements Previous tank clear required`\n\n" + 
            "📧 `export_event <EVENT_ID>`\nExport the JSON for an event (useful for troubleshooting or recreating an event)\n**Example:** `!export_event 123456789`\n\n" +
            "🔓 `open_event <EVENT_ID>`\nOpen an event to allow sign-ups (reaction emojis will be added to the post - it may take a few seconds to update all published posts).\n**Example:** `!open_event 123456789`\n\n" + 
            "🔒 `close_event <EVENT_ID>`\nClose an event to prevent sign-ups (reaction emojis will be removed from the post)\n**Example:** `!close_event 123456789`\n\n" + 
            "🏃 `event_adduser <EVENT_ID> <ROLE> <USER> <NOTES>`\nAdd a user to the sign-ups (roles are tank/healers/dps). Notes appear next to the username. The USER must be a MENTION.\n**Example:** `!event_adduser 123456789 tank @Cad#1234 (Titax)`\n\n" + 
            "🚪 `event_removeuser <EVENT_ID> <ROLE> <USER>`\nRemove a user from the sign-ups (roles are tank/healers/dps). The USER must be a mention.\n**Example:** `!event_removeuser 123456789 tank @Cad#1234`\n\n" + 
            "🔔 `ping_event <EVENT_ID> <MESSAGE>`\nPing all signed up users (non-subs) with a custom message (e.g. to inform them you are forming up).\n**Example:** `!ping_event 123456789 Now forming up pubside, please whisper Cadriel or x in allies`\n\n" + 
            "🌎 `publish_event <EVENT_ID> <TARGET_CHANNEL>`\nPublish the event to the specified channel. All published events are sychronized. The channel must be a mention.\n**Example:** `!publish_event 123456789 #event-signups`\n\n");
    }
});

registerEventCreator(client);
registerEventReactions(client);

function is_channel_whitelisted(channel: TextBasedChannel) {
    if (config.WHITELISTED_CHANNELS.includes(channel.id)) return true;

    sendError(channel, "Permission Denied", "Sorry, but I can only run this command in whitelisted channels.");

    return false;
}

process.on('unhandledRejection', error => {
    console.error('Unhandled rejection: ', error);
});

client.login(config.BOT_TOKEN);