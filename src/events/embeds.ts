import { DiscordAPIError, Message, MessageEmbed } from "discord.js";
import { client } from '../client';
import { log } from "../utils/logging";
import { saveEvents } from "./persistence";

export async function updateEventEmbeds(event: CircusEvent) {
    const embed = createEventEmbed(event);
    const channels = Object.entries(event.published_channels);

    for (const [channelId, messageId] of channels) {
        const channel = await client.channels.fetch(channelId);

        if (channel?.isText()) {
            let msg: Message<boolean>;

            try {
                msg = await channel.messages.fetch(messageId);
                await msg.edit({ embeds: [embed] });
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

            if (event.signup_status === 'open' && !(msg.reactions.cache.get('❤️')?.count || 0 > 0)) {
                log('debug', `Event ${event.id} is open to sign-ups, adding sign-up reactions (message: ${msg.id})`);
                await msg.react('<:tank:933048000727629835>');
                await msg.react('<:heal:933048000740229140>');
                await msg.react('<:dps:933048000866033774');
                await msg.react('💙');
                await msg.react('💚');
                await msg.react('❤️');
            } else if (event.signup_status === 'closed' && (msg.reactions.cache.get('❤️')?.count || 0) > 0) {
                log('debug', `Event ${event.id} is closed to sign-ups, removing sign-up reactions (message: ${msg.id})`);
                await msg.reactions.removeAll();
            }
        } else {
            console.error("An event channel wasn't a text channel, wtf?");
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
        `<:tank:933048000727629835>  ${event.role_requirements.tank}\n` +
        `<:heal:933048000740229140>  ${event.role_requirements.healer}\n` +
        `<:dps:933048000866033774>  ${event.role_requirements.dps}\n\n` +
        `You may select up to one main role and up to three sub roles by using the reactions below. ` + 
        `Clicking the same reaction a second time will cancel your sign-up for that role. ` + 
        `Please make sure you meet the requirements for your role before signing up!\n⠀\n`;

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
        .setFooter({ text: `${event.signup_status == 'open' ? '📖' : '🙈'} Sign-ups are currently ${event.signup_status}  •  Event ID: ${event.id}`});

    if (event.title.match(/Pub/)) {
        embed.setAuthor({ name: event.title || 'Untitled Event', iconURL: 'https://cdn.discordapp.com/emojis/740147910435405864.webp?size=96&quality=lossless' });
    } else if (event.title?.match(/(Imp|Empire)/)) {
        embed.setAuthor({ name: event.title || 'Untitled Event', iconURL: 'https://cdn.discordapp.com/emojis/740147893289091122.webp?size=96&quality=lossless' });
    } else {
        embed.setAuthor({ name: event.title || 'Untitled Event', iconURL: 'https://cdn.discordapp.com/emojis/933190190376288256.webp?size=96&quality=lossless' });
    }

    return embed;

}