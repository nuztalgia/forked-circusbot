
const fs = require('fs');
import { TextBasedChannel } from 'discord.js';
import { createEventEmbed, updateEventEmbeds } from './embeds';

export let events: { [eventId: string]: CircusEvent } = {};

if (fs.existsSync('data/events.json')) {
    const eventData = fs.readFileSync('data/events.json');
    events = JSON.parse(eventData);
}

export function saveEvents() {
    if (!fs.existsSync('data')) {
        fs.mkdirSync('data');
    }

    fs.writeFileSync('data/events.json', JSON.stringify(events, null, 2));
}

export async function createEvent(channel: TextBasedChannel, event: CircusEvent) {
    const embed = createEventEmbed(event);
    let msg = await channel.send({ embeds: [embed] });

    console.log(`Event has been created by ${event.author} - Event ID is ${msg.id}`);
    event.id = msg.id;
    event.published_channels = { [channel.id]: msg.id };
    await updateEventEmbeds(event);
    events[event.id] = JSON.parse(JSON.stringify(event));
    saveEvents();

    return null;
}