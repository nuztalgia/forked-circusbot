import { Guild, User } from 'discord.js';

export * from './commands';
export * from './embeds';
export * from './logging';
export * from './users';

export function getRandomInt(min: number, max: number) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

export async function getGuildMember(user: User, guild: Guild) {
    if (!guild) return null;

    return await guild.members.fetch(user.id);
}

export async function getDisplayName(user: User, guild: Guild | null) {
    if (!guild) return user.tag;

    return (await guild.members.fetch(user.id))?.displayName || user.tag;
}