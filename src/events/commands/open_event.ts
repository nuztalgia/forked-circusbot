import { client } from '../../client';
import { parseCommand, registerCommand } from '../../utils/commands';
import { EMBED_ERROR_COLOR, EMBED_SUCCESS_COLOR, EMOJI_ERROR, sendError, sendMessage, sendReply } from '../../utils/embeds';
import { log } from '../../utils/logging';
import { updateEventEmbeds } from '../embeds';
import { events, findEvent, saveEvents } from '../persistence';

const eventOpens = {};

for (const event of Object.values(events)) {
    if (event.open_signups_at) {
        scheduleEventOpen(event);
    }
}

function scheduleEventOpen(event: CircusEvent) {
    if (eventOpens[event.id]) {
        log('debug', `Cancelling event open for event ${event.id} (${event.title})`);
        clearTimeout(eventOpens[event.id]);
    }

    log('debug', `Scheduling event open for event ${event.id} (${event.title}) at ${event.open_signups_at}`);

    if (!event.open_signups_at?.match(/ [A-Z]{3}$/)) {
        event.open_signups_at += ' EST';
    }

    eventOpens[event.id] = setTimeout(async function() {
        const channel = await client.channels.fetch(Object.keys(event.published_channels)[0]);
        
        if (channel?.isText()) {
            const eventLink = `https://discord.com/channels/${event.serverId}/${channel.id}/${event.id}`;
            sendMessage(channel, `✅ Now opening sign-ups for [${event.title}](${eventLink})`);
        }

        log('info', `Opening event ${event.id} (${event.title}) for sign-ups via scheduled !event_open`);
        event.signup_status = 'open';
        event.open_signups_at = null;
        saveEvents();
        updateEventEmbeds(event);
    }, Date.parse(event.open_signups_at || '') - Date.now());
}

registerCommand('open_event', ['event_open', 'oe', 'eo'], message => {
    let [eventId, scheduledTime] = parseCommand(message, /([0-9]+)( .*)?/);
    const event = findEvent(eventId);

    if (!event) {
        sendReply(message, EMBED_ERROR_COLOR, `${EMOJI_ERROR} Unable to open event, invalid event ID provided`);
        return;
    }

    if (scheduledTime) {
        scheduledTime = scheduledTime.replace(/ *(AM|PM)/, " $1").trim();

        if (scheduledTime.match(/^([0-2]?[0-9]:[0-9]{2}) ?(AM|PM)( [A-Z]{3})?$/i)) {
            let d = new Date();
            scheduledTime = d.getFullYear() + "-" + ('0' + (d.getMonth() + 1)).slice(-2) + "-" + ('0' + d.getDate()).slice(-2) + ' ' + scheduledTime;
        }

        let openAt;

        if (!scheduledTime.match(/ [A-Z]{3}$/)) {
            openAt = Date.parse(scheduledTime + ' EST');
        } else {
            openAt = Date.parse(scheduledTime);
        }

        if (!openAt) {
            sendReply(message, EMBED_ERROR_COLOR, `${EMOJI_ERROR} Unable to parse date/time format, please use YYYY-MM-DD HH:mm:ss AM|PM`);
            return;
        }

        event.open_signups_at = scheduledTime;
        saveEvents();
        scheduleEventOpen(event);
        
        sendReply(message, EMBED_SUCCESS_COLOR, `✅ I will open sign-ups for [${event.title}](${message.url.replace(message.id, event.id)}) in ${Math.floor((openAt - Date.now()) / (60*60*1000))} hours ${Math.floor(((openAt - Date.now()) / (60*1000)) % 60)} minutes`);
    } else {
        event.signup_status = 'open';
        saveEvents();
        updateEventEmbeds(event);
        sendReply(message, EMBED_SUCCESS_COLOR, `✅  [${event.title}](${message.url.replace(message.id, eventId)}) is now open for sign-ups (it may take several seconds to add reactions)`);
    }
});
