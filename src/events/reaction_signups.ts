import { Client, MessageReaction, PartialMessageReaction, PartialUser, User } from 'discord.js';
import { messageUser } from '../utils/embeds';
import { log } from '../utils/logging';
import { updateEventEmbeds } from './embeds';
import { events, saveEvents } from './persistence';

export function registerEventReactions(client: Client) {
    client.on('messageReactionAdd', async (reaction, user) => {
        if (user.bot) {
            return;
        }

        if (reaction.partial) {
            await reaction.fetch();
        }

        const event = Object.values(events).find(x => x.id === reaction.message.id || Object.values(x.published_channels).includes(reaction.message.id));

        if (!event) return;

        reaction.users.remove(user.id);

        if (event.signup_status === 'closed') {
            log('debug', `Received reaction from ${user.tag} on closed event ${event.id} (${event.title})`);
            return;
        }
        
        // console.log(`REACTION ON EVENT ${reaction.message.id} : '${reaction.emoji.toString()}'`);

        if (reaction.emoji.toString() === '<:tank:933048000727629835>') {
            if (event.signups.tanks.hasOwnProperty(user.id)) {
                log('info', `User ${user.tag} has removed themself as a Tank for event ${event.id} (${event.title})`);
                delete event.signups.tanks[user.id];
                updateEventEmbeds(event);
                saveEvents();
                return;
            } else if (Object.values(event.signups.tanks).length >= event.role_limits.tank) {
                log('info', `  Unable to sign-up user ${user.tag} as a Tank for event ${event.id} - Tank spots are full`);
                messageUser(user, `<:error:935248898086273045> Sorry, tank sign-ups for ${event.title} are currently full. Please consider signing up for another role, or as a sub instead`);
                return;
            }

            if (event.signups.dps.hasOwnProperty(user.id)) {
                log('info', `User ${user.tag} has removed themself as a DPS for event ${event.id} (${event.title})`);
                delete event.signups.dps[user.id];
            } else if (event.signups.healers.hasOwnProperty(user.id)) {
                log('info', `User ${user.tag} has removed themself as a Healer for event ${event.id} (${event.title})`);
                delete event.signups.healers[user.id];
            } 

            log('info', `User ${user.tag} has added themself as a Tank for event ${event.id} (${event.title})`);
            event.signups.tanks[user.id] = await getDisplayName(reaction, user);
        } else if (reaction.emoji.toString() === '<:dps:933048000866033774>') {
            if (event.signups.dps.hasOwnProperty(user.id)) {
                log('info', `User ${user.tag} has removed themself as a DPS for event ${event.id} (${event.title})`);
                delete event.signups.dps[user.id];
                updateEventEmbeds(event);
                saveEvents();
                return;
            } else if (Object.values(event.signups.dps).length >= event.role_limits.dps) {
                log('info', `  Unable to sign-up user ${user.tag} as a DPS for event ${event.id} - DPS spots are full`);
                messageUser(user, `<:error:935248898086273045> Sorry, DPS sign-ups for ${event.title} are currently full. Please consider signing up for another role, or as a sub instead`);
                return;
            }

            if (event.signups.tanks.hasOwnProperty(user.id)) {
                log('info', `User ${user.tag} has removed themself as a Tank for event ${event.id} (${event.title})`);
                delete event.signups.tanks[user.id];
            } else if (event.signups.healers.hasOwnProperty(user.id)) {
                log('info', `User ${user.tag} has removed themself as a Healer for event ${event.id} (${event.title})`);
                delete event.signups.healers[user.id];
            } 

            log('info', `User ${user.tag} has added themself as a DPS for event ${event.id} (${event.title})`);
            event.signups.dps[user.id] = await getDisplayName(reaction, user);
        } else if (reaction.emoji.toString() === '<:heal:933048000740229140>') {
            if (event.signups.healers.hasOwnProperty(user.id)) {
                log('info', `User ${user.tag} has removed themself as a Healer for event ${event.id} (${event.title})`);
                delete event.signups.healers[user.id];
                updateEventEmbeds(event);
                saveEvents();
                return;
            } else if (Object.values(event.signups.healers).length >= event.role_limits.healer) {
                log('info', `  Unable to sign-up user ${user.tag} as a Healer for event ${event.id} - Healer spots are full`);
                messageUser(user, `<:error:935248898086273045> Sorry, healer sign-ups for ${event.title} are currently full. Please consider signing up for another role, or as a sub instead`);
                return;
            }

            if (event.signups.tanks.hasOwnProperty(user.id)) {
                log('info', `User ${user.tag} has removed themself as a Tank for event ${event.id} (${event.title})`);
                delete event.signups.tanks[user.id];
            } else if (event.signups.dps.hasOwnProperty(user.id)) {
                log('info', `User ${user.tag} has removed themself as a DPS for event ${event.id} (${event.title})`);
                delete event.signups.dps[user.id];
            } 

            log('info', `User ${user.tag} has added themself as a Healer for event ${event.id} (${event.title})`);
            event.signups.healers[user.id] = await getDisplayName(reaction, user);
        } else if (reaction.emoji.toString() === '💙') {
            if (event.signups.tank_subs.hasOwnProperty(user.id)) {
                log('info', `User ${user.tag} has removed themself as a Tank Sub for event ${event.id} (${event.title})`);
                delete event.signups.tank_subs[user.id];
            } else {
                log('info', `User ${user.tag} has added themself as a Tank Sub for event ${event.id} (${event.title})`);
                event.signups.tank_subs[user.id] = await getDisplayName(reaction, user);
            }
        } else if (reaction.emoji.toString() === '💚') {
            if (event.signups.healer_subs.hasOwnProperty(user.id)) {
                log('info', `User ${user.tag} has removed themself as a Healer Sub for event ${event.id} (${event.title})`);
                delete event.signups.healer_subs[user.id];
            } else {
                log('info', `User ${user.tag} has added themself as a Healer Sub for event ${event.id} (${event.title})`);
                event.signups.healer_subs[user.id] = await getDisplayName(reaction, user);
            }
        } else if (reaction.emoji.toString() === '❤️') {
            if (event.signups.dps_subs.hasOwnProperty(user.id)) {
                log('info', `User ${user.tag} has removed themself as a DPS Sub for event ${event.id} (${event.title})`);
                delete event.signups.dps_subs[user.id];
            } else {
                log('info', `User ${user.tag} has added themself as a DPS Sub for event ${event.id} (${event.title})`);
                event.signups.dps_subs[user.id] = await getDisplayName(reaction, user);
            }
        }

        updateEventEmbeds(event);
        saveEvents();
    });
}

async function getDisplayName(reaction: MessageReaction | PartialMessageReaction, user: User | PartialUser) {
    if (!reaction.message.guild) {
        return user.tag || user.id;
    }

    return (await reaction.message.guild?.members.fetch(user.id)).displayName || user.tag || user.id;
}