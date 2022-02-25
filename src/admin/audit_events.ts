import { DMChannel } from "discord.js";
import { client } from "../client";
import { log } from "../utils";

client.on('channelUpdate', async (oldChannel, newChannel) => {
    if (oldChannel instanceof DMChannel || newChannel instanceof DMChannel) {
        return;
    }

    if (oldChannel.guildId !== '722929163291328653' && oldChannel.guildId !== '621354743972888602') {
        return;
    }

    let oldCategory = oldChannel.parent;
    let newCategory = newChannel.parent;

    if (oldCategory?.id !== newCategory?.id) {
        log('info', `#${oldChannel.name} was moved from ${oldCategory?.name || 'Uncategorized'} to ${newCategory?.name || 'Uncategorized'}`);
    }
    
    if (oldChannel.rawPosition !== newChannel.rawPosition) {
        log('info', `#${oldChannel.name} was moved from position ${oldChannel.rawPosition} to ${newChannel.rawPosition}`);
    }
    
    if (oldChannel.name !== newChannel.name) {
        log('info', `#${oldChannel.name} was renamed to #${newChannel.name}`);
    }
});