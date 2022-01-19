import { Client, Intents, MessageEmbed, TextBasedChannel } from 'discord.js';
const fs = require('fs');
import config from '../config.json';
import { makeEmptyEvent } from './events/default_event';

const client = new Client({ 
    intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES, Intents.FLAGS.GUILD_MESSAGE_REACTIONS], 
	partials: ['MESSAGE', 'CHANNEL', 'REACTION'],
});

let creatingEventSession: any = null;
let eventSession = makeEmptyEvent();
let events: { [eventId: string]: CircusEvent } = {};
let lastEventId = null;

if (fs.existsSync('data/events.json')) {
    const eventData = fs.readFileSync('data/events.json');
    events = JSON.parse(eventData);
}

function saveEventData() {
    if (!fs.existsSync('data')) {
        fs.mkdirSync('data');
    }

    fs.writeFileSync('data/events.json', JSON.stringify(events, null, 2));
}

client.on('ready', () => {
  console.log(`Logged in as ${client?.user?.tag}!`);
});

client.on('messageReactionAdd', async (reaction, user) => {
    if (user.bot) {
        return;
    }

	if (reaction.partial) {
        await reaction.fetch();
    }

    let event: CircusEvent = (Object.values(events) as any).find(x => x.id === reaction.message.id || Object.values(x.published_channels).includes(reaction.message.id));

    if (!event) return;

    reaction.users.remove(user.id);
    
    // console.log(`REACTION ON EVENT ${reaction.message.id} : '${reaction.emoji.toString()}'`);

    if (reaction.emoji.toString() === '<:tank:933048000727629835>') {
        if (event.signups.tanks.hasOwnProperty(user.id)) {
            console.warn(`  User ${user.tag} has removed themself as a Tank for event ${event.id}`);
            delete event.signups.tanks[user.id];
            update_event(event);
            saveEventData();
            return;
        } else if (Object.values(event.signups.tanks).length === event.tank_limit) {
            console.warn(`  Unable to sign-up user ${user.tag} as a Tank for event ${event.id} - Tank spots are full`);
            return;
        }

        if (event.signups.dps.hasOwnProperty(user.id)) {
            console.warn(`  User ${user.tag} has removed themself as a DPS for event ${event.id}`);
            delete event.signups.dps[user.id];
        } else if (event.signups.healers.hasOwnProperty(user.id)) {
            console.warn(`  User ${user.tag} has removed themself as a Healer for event ${event.id}`);
            delete event.signups.healers[user.id];
        } 

        console.warn(`  User ${user.tag} has added themself as a Tank for event ${event.id}`);
        event.signups.tanks[user.id] = (await reaction.message.guild?.members.fetch(user.id)).displayName || user.tag;
    } else if (reaction.emoji.toString() === '<:dps:933048000866033774>') {
        if (event.signups.dps.hasOwnProperty(user.id)) {
            console.warn(`  User ${user.tag} has removed themself as a DPS for event ${event.id}`);
            delete event.signups.dps[user.id];
            update_event(event);
            saveEventData();
            return;
        } else if (Object.values(event.signups.dps).length === event.signups.dps_limit) {
            console.warn(`  Unable to sign-up user ${user.tag} as a DPS for event ${event.id} - DPS spots are full`);
            return;
        }

        if (event.signups.tanks.hasOwnProperty(user.id)) {
            console.warn(`  User ${user.tag} has removed themself as a Tank for event ${event.id}`);
            delete event.signups.tanks[user.id];
        } else if (event.signups.healers.hasOwnProperty(user.id)) {
            console.warn(`  User ${user.tag} has removed themself as a Healer for event ${event.id}`);
            delete event.signups.healers[user.id];
        } 

        console.warn(`  User ${user.tag} has added themself as a DPS for event ${event.id}`);
        event.signups.dps[user.id] = (await reaction.message.guild?.members.fetch(user.id)).displayName || user.tag;
    } else if (reaction.emoji.toString() === '<:heal:933048000740229140>') {
        if (event.signups.healers.hasOwnProperty(user.id)) {
            console.warn(`  User ${user.tag} has removed themself as a Healer for event ${event.id}`);
            delete event.signups.healers[user.id];
            update_event(event);
            saveEventData();
            return;
        } else if (Object.values(event.signups.healers).length === event.signups.healer_limit) {
            console.warn(`  Unable to sign-up user ${user.tag} as a Healer for event ${event.id} - Healer spots are full`);
            return;
        }

        if (event.signups.tanks.hasOwnProperty(user.id)) {
            console.warn(`  User ${user.tag} has removed themself as a Tank for event ${event.id}`);
            delete event.signups.tanks[user.id];
        } else if (event.signups.dps.hasOwnProperty(user.id)) {
            console.warn(`  User ${user.tag} has removed themself as a DPS for event ${event.id}`);
            delete event.signups.dps[user.id];
        } 

        console.warn(`  User ${user.tag} has added themself as a Healer for event ${event.id}`);
        event.signups.healers[user.id] = (await reaction.message.guild?.members.fetch(user.id)).displayName || user.tag;
    } else if (reaction.emoji.toString() === '💙') {
        if (event.signups.tank_subs.hasOwnProperty(user.id)) {
            console.warn(`  User ${user.tag} has removed themself as a Tank Sub for event ${event.id}`);
            delete event.signups.tank_subs[user.id];
        } else {
            console.warn(`  User ${user.tag} has added themself as a Tank Sub for event ${event.id}`);
            event.signups.tank_subs[user.id] = (await reaction.message.guild?.members.fetch(user.id)).displayName || user.tag;
        }
    } else if (reaction.emoji.toString() === '💚') {
        if (event.signups.healer_subs.hasOwnProperty(user.id)) {
            console.warn(`  User ${user.tag} has removed themself as a Healer Sub for event ${event.id}`);
            delete event.signups.healer_subs[user.id];
        } else {
            console.warn(`  User ${user.tag} has added themself as a Healer Sub for event ${event.id}`);
            event.signups.healer_subs[user.id] = (await reaction.message.guild?.members.fetch(user.id)).displayName || user.tag;
        }
    } else if (reaction.emoji.toString() === '❤️') {
        if (event.signups.dps_subs.hasOwnProperty(user.id)) {
            console.warn(`  User ${user.tag} has removed themself as a DPS Sub for event ${event.id}`);
            delete event.signups.dps_subs[user.id];
        } else {
            console.warn(`  User ${user.tag} has added themself as a DPS Sub for event ${event.id}`);
            event.signups.dps_subs[user.id] = (await reaction.message.guild?.members.fetch(user.id)).displayName || user.tag;
        }
    }

    update_event(event);
    saveEventData();
});

client.on('messageCreate', async (message) => {
    if (message.author.bot) return;

    if (creatingEventSession === message.author.id) {
        if (message.content === 'cancel') {
            creatingEventSession = null;
            return;
        } else if (message.content === 'debug') {
            send_message(message.channel, '```\n' + JSON.stringify(event, null, 2) + '\n```');
            return;
        }

        switch (eventSession.step) {
            case 'json':
                eventSession = JSON.parse(message.content);
                eventSession.authorId = message.author.id;
                eventSession.author = `${message.author.tag} {${message.author.id}}`;
                creatingEventSession = null;
                create_event(message.channel, eventSession);
                break;
            case 'title':
                eventSession.title = message.content;
                eventSession.step = 'description';
                send_message(message.channel, "Please enter a **Description** for the event (or type '**next**' to skip):");
                break;
            case 'description':
                eventSession.description = message.content === 'next' ? null : message.content;
                eventSession.step = 'date';
                send_message(message.channel, "Please enter the date for the event (using the format DD-MMM-YYYY, e.g. 03-Jan-2022):");
                break;
            case 'date':
                if (!message.content.match(/^[0-9]{1,2}-(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)-202[2-9]$/)) {
                    send_error(message.channel, 'Invalid Date Format', 'Invalid date or date format was given, please try again');
                    message.react('👎');
                    return;
                }

                eventSession.date = message.content;
                eventSession.step = 'time';
                send_message(message.channel, "Please enter the time for the event (e.g. 6:00 PM):");
                break;
            case 'time':
                if (!message.content.match(/^[0-2]?[0-9]:[0-9]{2} ?(AM|PM)$/i)) {
                    send_error(message.channel, 'Invalid Time Format', 'Invalid time or time format was given, please try again');
                    message.react('👎');
                    return;
                }

                eventSession.time = message.content;
                eventSession.step = 'tank_requirements';
                send_message(message.channel, "Please enter the requirements for Tanks to sign-up for this event:");
                break;
            case 'tank_requirements':
                eventSession.role_requirements.tank = message.content;
                eventSession.step = 'heal_requirements';
                send_message(message.channel, "Please enter the requirements for Healers to sign-up for this event:");
                break;
            case 'heal_requirements':
                eventSession.role_requirements.healer = message.content;
                eventSession.step = 'dps_requirements';
                send_message(message.channel, "Please enter the requirements for DPS to sign-up for this event:");
                break;
            case 'dps_requirements':
                eventSession.role_requirements.dps = message.content;
                eventSession.step = 'tank_limit';
                send_message(message.channel, "Please enter the number of Tanks spots for this event:");
                break;
            case 'tank_limit':
                if (!message.content.match(/^[0-9]+$/i)) {
                    send_error(message.channel, 'Invalid Format', 'Invalid format, the entered value **must** be a number');
                    message.react('👎');
                    return;
                }

                eventSession.role_limits.tank = parseInt(message.content);
                eventSession.step = 'healer_limit';
                send_message(message.channel, "Please enter the number of Healer spots for this event:");
                break;
            case 'healer_limit':
                if (!message.content.match(/^[0-9]+$/i)) {
                    send_error(message.channel, 'Invalid Format', 'Invalid format, the entered value **must** be a number');
                    message.react('👎');
                    return;
                }

                eventSession.role_limits.healer = parseInt(message.content);
                eventSession.step = 'dps_limit';
                send_message(message.channel, "Please enter the number of DPS spots for this event:");
                break;
            case 'dps_limit':
                if (!message.content.match(/^[0-9]+$/i)) {
                    send_error(message.channel, 'Invalid Format', 'Invalid format, the entered value **must** be a number');
                    message.react('👎');
                    return;
                }

                eventSession.role_limits.dps = parseInt(message.content);
                eventSession.step = 'none';
                creatingEventSession = null;
                create_event(message.channel, eventSession);
                break;
        }
        return;
    }

    let cmd = message.content.toLowerCase().split(' ')[0];

    // console.log('Message received: ' + message + ', cmd: ' + cmd);

    // Only allow prefixed commands from here
    if (!cmd.startsWith(config.BOT_PREFIX)) return;
    
    // Administrative functions can only be run in the whitelisted channels
    if (!is_channel_whitelisted(message.channel)) return;

    if (cmd === '!create_event' || cmd === '!ce') {
        if (creatingEventSession) {
            send_error(message.channel, "In Progress", "Another user is already in the process of creating an event. Please wait for them to finish.");
            return;
        }

        creatingEventSession = message.author.id;
        eventSession = makeEmptyEvent();
        eventSession.authorId = message.author.id;
        eventSession.author = `${message.author.tag} {${message.author.id}}`;
        console.info(`  User ${message.author.tag} {${message.author.id}} is now creating an event`);

        if (message.content.includes('json')) {
            eventSession.step = 'json';
            send_message(message.channel, "Creating new event (Advanced Mode). Please enter the JSON for the event:");
        } else {
            eventSession.step = 'title';
            send_message(message.channel, "Creating new event. Please enter a **Title** for the event (e.g. \"16p HM Revan (Pub Side)\"):");
        }
    } else if (cmd === '!edit_event' || cmd === '!ee') {
        const event_id = message.content.split(' ')[1].trim();
        const event_field = message.content.split(' ')[2].trim();
        const event_value = message.content.match('(.*?) (.*?) (.*?) (.*)')[4].trim();

        if (!events.hasOwnProperty(event_id)) {
            send_error(message.channel, "Invalid Event", "Unable to edit event, no such event ID was found");
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
            send_error(message.channel, "Unknown Field", "Unable to evdit event, field was not recognized. Valid fields:\n\n" +
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

        saveEventData();
        update_event(events[event_id]);
        message.react('👍');
    } else if (cmd === '!open_event' || cmd === '!oe') {
        const event_id = message.content.split(' ')[1];

        if (!events.hasOwnProperty(event_id)) {
            send_error(message.channel, "Invalid Event", "Unable to open event, no such event ID was found");
            return;
        }

        events[event_id].signup_status = 'open';
        saveEventData();
        update_event(events[event_id]);

        send_message(message.channel, `✅ Event ${message.content.split(' ')[1]} is now open for sign-ups!`);
        message.react('👍');
    } else if (cmd === '!close_event' || cmd === '!ce') {
        const event_id = message.content.split(' ')[1];

        if (!events.hasOwnProperty(event_id)) {
            send_error(message.channel, "Invalid Event", "Unable to close event, no such event ID was found");
            return;
        }

        events[event_id].signup_status = 'closed';
        saveEventData();
        update_event(events[event_id]);

        send_message(message.channel, `✅ Event ${message.content.split(' ')[1]} is now closed for sign-ups!`);
        message.react('👍');
    } else if (cmd === '!refresh_event' || cmd === '!re') {
        update_event(events[message.content.split(' ')[1]]);

        send_message(message.channel, `✅ Event ${message.content.split(' ')[1]} has been rebuilt across all channels`);
        message.react('👍');
    } else if (cmd === '!event_adduser' || cmd === '!eau' || cmd === '!event_addusers') {
        const event_id = message.content.split(' ')[1].trim();
        let event_role = message.content.split(' ')[2].trim();
        const event_value = message.content.match('(.*?) (.*?) (.*?) (.*?) (.*)');

        if (event_role === 'heal' || event_role === 'healer' || event_role === 'heals') {
            event_role = 'healers';
        } else if (event_role === 'tank') {
            event_role = 'tanks';
        }

        if (!events.hasOwnProperty(event_id)) {
            send_error(message.channel, "Invalid Event", "Unable to add user to event, no such event ID was found");
            return;
        }
        
        let user = message.mentions.users.first();

        if (!user) {
            send_error(message.channel, "Invalid User", "Please mention the user in your message. Notes can be provided after the mention.");
            return;
        }

        events[event_id].signups[event_role][user.id] = ((await message.guild?.members.fetch(user.id)).displayName || user.tag);

        if (event_value && event_value.length === 6) {
            events[event_id].signups[event_role][user.id] += ' ' + event_value[5];
        }

        saveEventData();
        update_event(events[event_id]);
        message.react('👍');
    } else if (cmd === '!event_removeuser' || cmd === '!eru') {
        const event_id = message.content.split(' ')[1].trim();
        let event_role = message.content.split(' ')[2].trim();

        if (event_role === 'heal' || event_role === 'healer' || event_role === 'heals') {
            event_role = 'healers';
        } else if (event_role === 'tank') {
            event_role = 'tanks';
        }

        if (!events.hasOwnProperty(event_id)) {
            send_error(message.channel, "Invalid Event", "Unable to remove user from event, no such event ID was found");
            return;
        }
        
        let user = message.mentions.users.first();

        if (!user) {
            send_error(message.channel, "Invalid User", "Please mention the user in your message");
            return;
        }

        delete events[event_id].signups[event_role][user.id];
        saveEventData();
        update_event(events[event_id]);
        message.react('👍');
    } else if (cmd === '!publish_event' || cmd === '!pe') {
        const event_id = message.content.split(' ')[1];
        const target_channel = message.mentions.channels.first();

        if (!events.hasOwnProperty(event_id)) {
            send_error(message.channel, "Invalid Event", "Unable to publish event, no such event ID was found");
            return;
        }
        
        if (!target_channel) {
            send_error(message.channel, "Invalid Channel", "Please mention the channel in your message");
            return;
        }
        
        const embed = create_event_embed(events[event_id]);

        try {
            let msg = await target_channel.send({ embeds: [embed] });
            events[event_id].published_channels[target_channel.id] = msg.id;
            saveEventData();
            update_event(events[event_id]);
            message.react('👍');
        } catch (error) {
            send_error(message.channel, 'Publish Failed', error.toString());
            message.react('👎');
        }
    } else if (cmd === '!ping_event' || cmd === '!event_ping') {
        const event_id = message.content.split(' ')[1].trim();
        const ping_msg = message.content.match('(.*?) (.*?) (.*)')[3].trim();

        if (!events.hasOwnProperty(event_id)) {
            send_error(message.channel, "Invalid Event", "Unable to ping event, no such event ID was found");
            return;
        }

        if (!ping_msg) {
            send_error(message.channel, "Invalid Message", "Please provide a custom message for the ping");
            return;
        }

        let allUsers = Object.keys(events[event_id].signups.tanks);
        allUsers = allUsers.concat(Object.keys(events[event_id].signups.healers));
        allUsers = allUsers.concat(Object.keys(events[event_id].signups.dps));

        message.channel.send(allUsers.map(x => `<@${x}>`).join(' ') + ' ' + ping_msg);
    } else if (cmd === '!export_event') {
        const event_id = message.content.split(' ')[1].trim();

        if (!events.hasOwnProperty(event_id)) {
            send_error(message.channel, "Invalid Event", "Unable to export event, no such event ID was found");
            return;
        }

        const dmLogEmbed = new MessageEmbed()
            .setColor("#0099ff")
            .setDescription(`\`\`\`\n${JSON.stringify(events[event_id], null, 2)}\n\`\`\``);

        message.channel.send({ embeds: [dmLogEmbed] });
    } else if (cmd === '!help' || cmd === '!eventhelp' || cmd === '!event_help') {
        if (!is_channel_whitelisted(message.channel)) return;

        send_message(message.channel, "🗓️ `create_event`\nBegin creating a new event. Only one event may be created at a time.\n**Example:** `!create_event`\n\n" + 
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

async function create_event(channel: TextBasedChannel, event: any) {
    const embed = create_event_embed(event);
    let msg = await channel.send({ embeds: [embed] });

    console.log(`Event has been created by ${event.author} - Event ID is ${msg.id}`);
    event.id = msg.id;
    event.published_channels = { [channel.id]: msg.id };
    await update_event(event);
    events[event.id] = JSON.parse(JSON.stringify(event));
    saveEventData();

    return null;
}

async function update_event(event: CircusEvent) {
    const embed = create_event_embed(event);
    const channels = Object.entries(event.published_channels);

    for (const [channelId, messageId] of channels) {
        const channel = await client.channels.fetch(channelId);

        if (channel?.isText()) {
            const msg = await channel.messages.fetch(messageId);
            await msg.edit({ embeds: [embed] });

            if (event.signup_status === 'open' && !(msg.reactions.cache.get('❤️')?.count || 0 > 0)) {
                console.log('adding emojis');
                await msg.react('<:tank:933048000727629835>');
                await msg.react('<:heal:933048000740229140>');
                await msg.react('<:dps:933048000866033774');
                await msg.react('💙');
                await msg.react('💚');
                await msg.react('❤️');
            } else if (event.signup_status === 'closed') {
                console.log('removing reactions for event');
                await msg.reactions.removeAll();
            }
        } else {
            console.error("An event channel wasn't a text channel, wtf?");
        }
    }
}

function create_event_embed(event: CircusEvent) {
    const tank_signups = (Object.values(event.signups.tanks).length > 0 ? "<:tank:933048000727629835> " : "") + (Object.values(event.signups.tanks).join("\n<:tank:933048000727629835> ") || '\u200b') + '\u200b\n'.repeat(event.role_limits.dps - Math.max(0, Object.values(event.signups.tanks).length - 1));
    const healer_signups = (Object.values(event.signups.healers).length > 0 ? "<:heal:933048000740229140> " : "") + Object.values(event.signups.healers).join("\n<:heal:933048000740229140> ") || '\u200b';
    const dps_signups = (Object.values(event.signups.dps).length > 0 ? "<:dps:933048000866033774> " : "") + Object.values(event.signups.dps).join("\n<:dps:933048000866033774> ") || '\u200b';
    const tank_subs = (Object.values(event.signups.tank_subs).length > 0 ? "💙 " : "") + Object.values(event.signups.tank_subs).join("\n💙 ") || '\u200b'
    const healer_subs = (Object.values(event.signups.healer_subs).length > 0 ? "💚 " : "") + Object.values(event.signups.healer_subs).join("\n💚 ") || '\u200b';
    const dps_subs = (Object.values(event.signups.dps_subs).length > 0 ? "❤️ " : "") + Object.values(event.signups.dps_subs).join("\n❤️ ") || '\u200b';

    const description = `:calendar_spiral: ${event.date}⠀⠀⠀⠀:alarm_clock: ${event.time} EST\n\n` + 
        `**Requirements:**\n` + 
        `<:tank:933048000727629835>  ${event.role_requirements.tank}\n` +
        `<:heal:933048000740229140>  ${event.role_requirements.healer}\n` +
        `<:dps:933048000866033774>  ${event.role_requirements.dps}\n\n` +
        `You may select up to one main role and up to three sub roles by using the reactions below. ` + 
        `Clicking the same reaction a second time will cancel your sign-up for that role.` + 
        `Please make sure you meet the requirements for your role before signing up!\n\n`;

    const embed = new MessageEmbed()
        .setColor("#0099ff")
        .setDescription(description)
        .addFields(
            { name: `<:tank:933048000727629835> Tanks (${Object.values(event.signups.tanks).length}/${event.role_limits.tank})`, value: tank_signups, inline: true },
            { name: `<:heal:933048000740229140> Healers (${Object.values(event.signups.healers).length}/${event.role_limits.healer})`, value: healer_signups, inline: true },
            { name: `<:dps:933048000866033774> DPS (${Object.values(event.signups.dps).length}/${event.role_limits.dps})`, value: dps_signups, inline: true },
            { name: `💙 Tank Subs (${Object.values(event.signups.tank_subs).length})`, value: tank_subs, inline: true },
            { name: `💚 Healer Subs (${Object.values(event.signups.healer_subs).length})`, value: healer_subs, inline: true },
            { name: `❤️ DPS Subs (${Object.values(event.signups.dps_subs).length})`, value: dps_subs, inline: true }
        )
        .setFooter({ text: `🙈 Sign-ups are currently ${event.signup_status}  •  Event ID: ${event.id}`});

    if (event.title.match(/Pub/)) {
        embed.setAuthor({ name: event.title || 'Untitled Event', iconURL: 'https://cdn.discordapp.com/emojis/740147910435405864.webp?size=96&quality=lossless' });
    } else if (event.title?.match(/(Imp|Empire)/)) {
        embed.setAuthor({ name: event.title || 'Untitled Event', iconURL: 'https://cdn.discordapp.com/emojis/740147893289091122.webp?size=96&quality=lossless' });
    } else {
        embed.setAuthor({ name: event.title || 'Untitled Event', iconURL: 'https://cdn.discordapp.com/emojis/933190190376288256.webp?size=96&quality=lossless' });
    }

    return embed;

}

function send_message(channel: TextBasedChannel, message: string) {
    const dmLogEmbed = new MessageEmbed()
        .setColor("#0099ff")
        .setDescription(message)

    channel.send({ embeds: [dmLogEmbed] });

    return null;
}

function send_error(channel: TextBasedChannel, title: string, message: string) {
    const errEmbed = new MessageEmbed()
        .setColor("#ff0000")
        .setThumbnail('https://media.discordapp.net/attachments/814616443919532062/933036449052381234/299045_sign_error_icon.png?width=48&height=48')
        .setTitle(title)
        .setDescription(message)
    
    channel.send({ embeds: [errEmbed] });

    return null;
}

function is_channel_whitelisted(channel: TextBasedChannel) {
    if (config.WHITELISTED_CHANNELS.includes(channel.id)) return true;

    send_error(channel, "Permission Denied", "Sorry, but I can only run this command in whitelisted channels.");

    return false;
}

process.on('unhandledRejection', error => {
    console.error('Unhandled rejection: ', error);
});

client.login(config.BOT_TOKEN);