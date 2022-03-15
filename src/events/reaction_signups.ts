import { Client, MessageReaction, PartialMessageReaction, PartialUser, User } from 'discord.js';
import { messageUser } from '../utils/replies';
import { log } from '../utils/logging';
import { queueEventUpdate } from './embeds';
import { events, saveEvents } from './persistence';

let userRateLimits = { 
    'all': {},
    '<:tank:933048000727629835>': {},
    '<:heal:933048000740229140>': {},
    '<:dps:933048000866033774>': {},
    '💙': {},
    '💚': {},
    '❤️': {},
    '✅': {},
    '❓': {},
    '❌': {},
 };
 let pendingUserUpdates = { 
     '<:tank:933048000727629835>': {},
     '<:heal:933048000740229140>': {},
     '<:dps:933048000866033774>': {},
     '💙': {},
     '💚': {},
     '❤️': {},
     '✅': {},
     '❓': {},
     '❌': {},
};

export function registerEventReactions(client: Client) {
    client.on('messageReactionAdd', async (reaction, user) => {
        if (user.bot) {
            return;
        }

        if (reaction.partial) {
            reaction = await reaction.fetch();
        }
        
        const event = Object.values(events).find(x => x.id === reaction.message.id || Object.values(x.published_channels).includes(reaction.message.id));
        const emoji = reaction.emoji.toString();

        if (!event) return;

        if (pendingUserUpdates[emoji].hasOwnProperty(user.id)) {
            return;
        }
        if (!userRateLimits[emoji].hasOwnProperty(user.id)) {
            userRateLimits[emoji][user.id] = 0;
        }
        if (!userRateLimits.all.hasOwnProperty(user.id)) {
            userRateLimits.all[user.id] = 0;
        }

        if (userRateLimits[emoji][user.id] >= 3 || userRateLimits.all[user.id] >= 15) {
            log('info', `  Received reaction from rate-limited user ${user.tag} on event ${event.id} (${event.title}), ignoring`);
            return;
        }
    
        userRateLimits[emoji][user.id] += 1;
        userRateLimits.all[user.id] += 1;
        setTimeout(() => {
            userRateLimits[emoji][user.id] -= 1;
            userRateLimits.all[user.id] -= 1;

            if (userRateLimits[emoji][user.id] === 0) {
                reaction.users.remove(user.id);
            }
        }, 25000)

        pendingUserUpdates[emoji][user.id] = true;
        await handleReactionAdd(event, emoji, reaction, user);
        await handleGenericEventReactionAdd(event, emoji, reaction, user);
        await queueEventUpdate(event);
        saveEvents();
        delete pendingUserUpdates[emoji][user.id];
        reaction.users.remove(user.id);
    });
}

async function getDisplayName(reaction: MessageReaction | PartialMessageReaction, user: User | PartialUser) {
    if (!reaction.message.guild) {
        return user.tag || user.id;
    }

    return (await reaction.message.guild?.members.fetch(user.id)).displayName || user.tag || user.id;
}

async function handleGenericEventReactionAdd(event: CircusEvent, emoji: string, reaction: MessageReaction, user: User | PartialUser) {
    if (event.signup_status === 'closed') {
        reaction.users.remove(user.id);
        log('debug', `Received reaction from ${user.tag} on closed event ${event.id} (${event.title})`);
        return;
    }
    
    // console.log(`REACTION ON EVENT ${reaction.message.id} : '${reaction.emoji.toString()}'`);

    if (emoji === '✅') {
        if (event.signups.going.hasOwnProperty(user.id)) {
            log('info', `User ${user.tag} has removed themself as Going for event ${event.id} (${event.title})`);
            delete event.signups.going[user.id];
            return;
        } else if (Object.values(event.signups.going).length >= event.role_limits.going) {
            log('info', `  Unable to sign-up user ${user.tag} as Going for event ${event.id} - Going spots are full`);
            messageUser(user, `<:error:935248898086273045> Sorry, Going sign-ups for ${event.title} are currently full.`);
            return;
        }

        if (event.signups.tentative.hasOwnProperty(user.id)) {
            log('info', `User ${user.tag} has removed themself as Tentative for event ${event.id} (${event.title})`);
            delete event.signups.tentative[user.id];
        } else if (event.signups.notgoing.hasOwnProperty(user.id)) {
            log('info', `User ${user.tag} has removed themself as Not Going for event ${event.id} (${event.title})`);
            delete event.signups.notgoing[user.id];
        } 

        log('info', `User ${user.tag} has added themself as Going for event ${event.id} (${event.title})`);
        event.signups.going[user.id] = await getDisplayName(reaction, user);
    } else if (emoji === '❓') {
        if (event.signups.tentative.hasOwnProperty(user.id)) {
            log('info', `User ${user.tag} has removed themself as Tentative for event ${event.id} (${event.title})`);
            delete event.signups.tentative[user.id];
            return;
        } else if (Object.values(event.signups.tentative).length >= event.role_limits.tentative) {
            log('info', `  Unable to sign-up user ${user.tag} as Tentative for event ${event.id} - Tentative spots are full`);
            messageUser(user, `<:error:935248898086273045> Sorry, Tentative sign-ups for ${event.title} are currently full.`);
            return;
        }

        if (event.signups.going.hasOwnProperty(user.id)) {
            log('info', `User ${user.tag} has removed themself as Going for event ${event.id} (${event.title})`);
            delete event.signups.going[user.id];
        } else if (event.signups.notgoing.hasOwnProperty(user.id)) {
            log('info', `User ${user.tag} has removed themself as Not Going for event ${event.id} (${event.title})`);
            delete event.signups.notgoing[user.id];
        } 

        log('info', `User ${user.tag} has added themself as Tentative for event ${event.id} (${event.title})`);
        event.signups.tentative[user.id] = await getDisplayName(reaction, user);
    } else if (emoji === '❌') {
        if (event.signups.notgoing.hasOwnProperty(user.id)) {
            log('info', `User ${user.tag} has removed themself as Not Going for event ${event.id} (${event.title})`);
            delete event.signups.notgoing[user.id];
            return;
        } else if (Object.values(event.signups.notgoing).length >= event.role_limits.notgoing) {
            log('info', `  Unable to sign-up user ${user.tag} as Not Going for event ${event.id} - Not Going spots are full`);
            messageUser(user, `<:error:935248898086273045> Sorry, Not Going sign-ups for ${event.title} are currently full.`);
            return;
        }

        if (event.signups.tentative.hasOwnProperty(user.id)) {
            log('info', `User ${user.tag} has removed themself as Tentative for event ${event.id} (${event.title})`);
            delete event.signups.tentative[user.id];
        } else if (event.signups.going.hasOwnProperty(user.id)) {
            log('info', `User ${user.tag} has removed themself as Going for event ${event.id} (${event.title})`);
            delete event.signups.going[user.id];
        } 

        log('info', `User ${user.tag} has added themself as Not Going for event ${event.id} (${event.title})`);
        event.signups.notgoing[user.id] = await getDisplayName(reaction, user);
    }
}

async function handleReactionAdd(event: CircusEvent, emoji: string, reaction: MessageReaction, user: User | PartialUser) {
    if (event.signup_status === 'closed') {
        reaction.users.remove(user.id);
        log('debug', `Received reaction from ${user.tag} on closed event ${event.id} (${event.title})`);
        return;
    }
    
    // console.log(`REACTION ON EVENT ${reaction.message.id} : '${reaction.emoji.toString()}'`);

    if (emoji === '<:tank:933048000727629835>') {
        if (event.signups.tanks.hasOwnProperty(user.id)) {
            log('info', `User ${user.tag} has removed themself as a Tank for event ${event.id} (${event.title})`);
            delete event.signups.tanks[user.id];
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
    } else if (emoji === '<:dps:933048000866033774>') {
        if (event.signups.dps.hasOwnProperty(user.id)) {
            log('info', `User ${user.tag} has removed themself as a DPS for event ${event.id} (${event.title})`);
            delete event.signups.dps[user.id];
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
    } else if (emoji === '<:heal:933048000740229140>') {
        if (event.signups.healers.hasOwnProperty(user.id)) {
            log('info', `User ${user.tag} has removed themself as a Healer for event ${event.id} (${event.title})`);
            delete event.signups.healers[user.id];
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
    } else if (emoji === '💙') {
        if (event.signups.tank_subs.hasOwnProperty(user.id)) {
            log('info', `User ${user.tag} has removed themself as a Tank Sub for event ${event.id} (${event.title})`);
            delete event.signups.tank_subs[user.id];
        } else {
            log('info', `User ${user.tag} has added themself as a Tank Sub for event ${event.id} (${event.title})`);
            event.signups.tank_subs[user.id] = await getDisplayName(reaction, user);
        }
    } else if (emoji === '💚') {
        if (event.signups.healer_subs.hasOwnProperty(user.id)) {
            log('info', `User ${user.tag} has removed themself as a Healer Sub for event ${event.id} (${event.title})`);
            delete event.signups.healer_subs[user.id];
        } else {
            log('info', `User ${user.tag} has added themself as a Healer Sub for event ${event.id} (${event.title})`);
            event.signups.healer_subs[user.id] = await getDisplayName(reaction, user);
        }
    } else if (emoji === '❤️') {
        if (event.signups.dps_subs.hasOwnProperty(user.id)) {
            log('info', `User ${user.tag} has removed themself as a DPS Sub for event ${event.id} (${event.title})`);
            delete event.signups.dps_subs[user.id];
        } else {
            log('info', `User ${user.tag} has added themself as a DPS Sub for event ${event.id} (${event.title})`);
            event.signups.dps_subs[user.id] = await getDisplayName(reaction, user);
        }
    }

}