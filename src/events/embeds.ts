import { DiscordAPIError, Message, MessageEmbed } from 'discord.js';
import { client } from '../client';
import { EMBED_INFO_COLOR, log } from '../utils';
import { events, saveEvents } from './persistence';
import { EMOJI_DPS, EMOJI_DPS_SUB, EMOJI_HEAL, EMOJI_HEAL_SUB, EMOJI_TANK, EMOJI_TANK_SUB } from './reactions';

const PUB_SIDE_ICON_URL = 'https://cdn.discordapp.com/emojis/740147910435405864.webp?size=96&quality=lossless';
const IMP_SIDE_ICON_URL = 'https://cdn.discordapp.com/emojis/740147893289091122.webp?size=96&quality=lossless';
const SHARED_SIDE_ICON_URL = 'https://cdn.discordapp.com/emojis/933190190376288256.webp?size=96&quality=lossless';

let lastUpdates = {};
let queuedUpdates = {};

/**
 * Queue event updates to avoid making too many message edits in a short period of time (which will
 * get us rate limited and can cause cascading delays as people re-toggle their reaction when they
 * don't see their names appear)
 * @param event The event to queue an update for
 * @returns Promise<void>
 */
export async function queueEventUpdate(event: CircusEvent) {
    // Was last update within 2s?
    if (lastUpdates.hasOwnProperty(event.id) && (performance.now() - lastUpdates[event.id]) < 1000) {
        if (!queuedUpdates.hasOwnProperty(event.id)) {
            queuedUpdates[event.id] = new Promise((resolve, _reject) => {
                setTimeout(async () => {
                    await updateEventEmbeds(event);
                    delete queuedUpdates[event.id];
                    resolve(event);
                }, performance.now() - lastUpdates[event.id]);
            });
        }
    }

    // If there is an update in the queue, return it's promise instead
    if (queuedUpdates.hasOwnProperty(event.id)) {
        return await queuedUpdates[event.id]; 
    }

    return await updateEventEmbeds(event);
}

export async function updateEventEmbeds(event: CircusEvent) {
    event = events[event.id];
    lastUpdates[event.id] = performance.now();

    const embed = createEventEmbed(event);
    const channels = Object.entries(event.published_channels).reverse();

    for (const [channelId, messageId] of channels) {
        const channel = await client.channels.fetch(channelId);

        if (channel?.isText()) {
            let msg: Message<boolean>;

            try {
                const startTime = performance.now()
                msg = await channel.messages.fetch(messageId);
                await msg.edit({ embeds: [embed] });
                const editTime = Math.floor(performance.now() - startTime);

                if (editTime > 1500) {
                    log('debug', `Finished editing event embed for event ${event.id} (${event.title}) in ${editTime}ms (message id: ${msg.id})`);
                }
            } catch (err) {
                if (err instanceof DiscordAPIError) {
                    log('error', `Failed to edit message for event ${event.id} (DiscordAPIError): ${err.message}`);
                    
                    if (err.message === 'Unknown Message') {
                        delete event.published_channels[channelId];
                        saveEvents();
                        continue;
                    }
                }

                log('error', `Failed to edit message for event ${event.id}: ${err}`);
                return;
            }

            if (event.signup_status === 'open' && !(msg.reactions.cache.get(EMOJI_DPS_SUB)?.count || 0 > 0)) {
                log('debug', `Event ${event.id} is open to sign-ups, adding sign-up reactions (message: ${msg.id})`);
                await msg.react(EMOJI_TANK);
                await msg.react(EMOJI_HEAL);
                await msg.react(EMOJI_DPS);
                await msg.react(EMOJI_TANK_SUB);
                await msg.react(EMOJI_HEAL_SUB);
                await msg.react(EMOJI_DPS_SUB);
            } else if (event.signup_status === 'closed' && (msg.reactions.cache.get(EMOJI_DPS_SUB)?.count || 0) > 0) {
                log('debug', `Event ${event.id} is closed to sign-ups, removing sign-up reactions (message: ${msg.id})`);
                await msg.reactions.removeAll();
            }
        } else {
            log('error', 'An event channel wasn\'t a text channel, wtf?');
        }
    }
}

export function createEventEmbed(event: CircusEvent) {
    const tank_signups = (Object.values(event.signups.tanks).length > 0 ? "<:tank:933048000727629835> " : "") + (Object.values(event.signups.tanks).map(x => x.substring(0, 21)).join("\n<:tank:933048000727629835> ") || '\u200b');
    const healer_signups = (Object.values(event.signups.healers).length > 0 ? "<:heal:933048000740229140> " : "") + Object.values(event.signups.healers).map(x => x.substring(0, 21)).join("\n<:heal:933048000740229140> ") || '\u200b';
    const dps_signups = (Object.values(event.signups.dps).length > 0 ? "<:dps:933048000866033774> " : "") + (Object.values(event.signups.dps).map(x => x.substring(0, 21)).join("\n<:dps:933048000866033774> ") || '\u200b') + '\u200b\n'.repeat(event.role_limits.dps - Math.max(0, Object.values(event.signups.dps).length - 1));
    const tank_subs = (Object.values(event.signups.tank_subs).length > 0 ? "💙 " : "") + Object.values(event.signups.tank_subs).map(x => x.substring(0, 20)).join("\n💙 ") || '\u200b'
    const healer_subs = (Object.values(event.signups.healer_subs).length > 0 ? "💚 " : "") + Object.values(event.signups.healer_subs).map(x => x.substring(0, 20)).join("\n💚 ") || '\u200b';
    const dps_subs = (Object.values(event.signups.dps_subs).length > 0 ? "❤️ " : "") + Object.values(event.signups.dps_subs).map(x => x.substring(0, 20)).join("\n❤️ ") || '\u200b';

    if (!event.time?.match(/ [A-Z]{3}$/)) {
        event.time += ' EST';
    }

    const description = `:calendar_spiral: ${event.date}⠀⠀⠀⠀:alarm_clock: ${event.time}\n\n` + 
        (event.description ? event.description + "\n\n" : "") +
        `**Requirements:**\n` + 
        `${EMOJI_TANK}  ${event.role_requirements.tank}\n` +
        `${EMOJI_HEAL}  ${event.role_requirements.healer}\n` +
        `${EMOJI_DPS}  ${event.role_requirements.dps}\n\n` +
        `You may select up to one main role and up to three sub roles by using the reactions below. ` + 
        `Clicking the same reaction a second time will cancel your sign-up for that role. ` + 
        `**It may take up to 20 seconds to update the post after you sign-up, so please be patient.** ` + 
        `Please make sure you meet the requirements for your role before signing up!\n⠀\n`;

    const embed = new MessageEmbed()
        .setColor(EMBED_INFO_COLOR)
        .setDescription(description)
        .addFields(
            { name: `${EMOJI_TANK} Tanks (${Object.values(event.signups.tanks).length}/${event.role_limits.tank})`, value: tank_signups, inline: true },
            { name: `${EMOJI_HEAL} Healers (${Object.values(event.signups.healers).length}/${event.role_limits.healer})`, value: healer_signups, inline: true },
            { name: `${EMOJI_DPS} DPS (${Object.values(event.signups.dps).length}/${event.role_limits.dps})`, value: dps_signups, inline: true },
            { name: `${EMOJI_TANK_SUB} Tank Subs (${Object.values(event.signups.tank_subs).length})`, value: tank_subs, inline: true },
            { name: `${EMOJI_HEAL_SUB} Healer Subs (${Object.values(event.signups.healer_subs).length})`, value: healer_subs, inline: true },
            { name: `${EMOJI_DPS_SUB} DPS Subs (${Object.values(event.signups.dps_subs).length})`, value: dps_subs, inline: true }
        )
        .setFooter({ text: `${event.signup_status == 'open' ? '📖' : '🙈'} Sign-ups are ${event.signup_status}  •  Event ID: ${event.id}`});

    if (event.title.match(/Pub/)) {
        embed.setAuthor({ name: event.title, iconURL: PUB_SIDE_ICON_URL });
    } else if (event.title?.match(/(Imp|Empire)/)) {
        embed.setAuthor({ name: event.title, iconURL: IMP_SIDE_ICON_URL });
    } else {
        embed.setAuthor({ name: event.title, iconURL: SHARED_SIDE_ICON_URL });
    }

    return embed;

}