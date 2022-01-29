import { client } from '../../client';
import { registerCommand } from '../../utils/commands';
import { EMBED_SUCCESS_COLOR, sendError, sendMessage, sendReply } from '../../utils/embeds';
import { log } from '../../utils/logging';
import { updateEventEmbeds } from '../embeds';
import { events, saveEvents } from '../persistence';

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
    }, Date.parse(event.open_signups_at + ' EST') - Date.now());
}

registerCommand('open_event', ['event_open', 'oe', 'eo'], message => {
    const messageContent = message.content.replace(/  +/g, ' ');
    const event_id = messageContent.split(' ')[1];
    let scheduled_time = messageContent.match('(.*?) (.*?) (.*)') ? messageContent.match('(.*?) (.*?) (.*)')[3].trim() : null;

    if (!events.hasOwnProperty(event_id)) {
        sendError(message.channel, "Unable to open event, no such event ID was found");
        return;
    }

    const event = events[event_id];

    if (scheduled_time) {
        scheduled_time = scheduled_time.replace(/ *(AM|PM)/, " $1");

        if (scheduled_time.match(/^[0-9]{1,2}:[0-9]{2} (AM|PM)/i)) {
            let d = new Date();
            scheduled_time = d.getFullYear() + "-" + ('0' + (d.getMonth() + 1)).slice(-2) + "-" + ('0' + d.getDate()).slice(-2) + ' ' + scheduled_time;
        }

        let openAt = Date.parse(scheduled_time + ' EST');

        if (!openAt) {
            message.react("👎");
            sendError(message.channel, "Unable to parse date/time format, please use YYYY-MM-DD HH:mm:ss AM|PM");
            return;
        }

        event.open_signups_at = scheduled_time;
        saveEvents();
        scheduleEventOpen(event);
        
        sendReply(message, EMBED_SUCCESS_COLOR, `✅ I will open sign-ups for [${event.title}](${message.url.replace(message.id, event.id)}) in ${Math.floor((openAt - Date.now()) / (60*60*1000))} hours ${Math.floor(((openAt - Date.now()) / (60*1000)) % 60)} minutes`);
    } else {
        events[event_id].signup_status = 'open';
        saveEvents();
        updateEventEmbeds(events[event_id]);
        sendReply(message, EMBED_SUCCESS_COLOR, `✅  [${events[event_id].title}](${message.url.replace(message.id, event_id)}) is now open for sign-ups (it may take several seconds to add reactions)`);
    }
});
