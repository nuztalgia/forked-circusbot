import { Message } from 'discord.js';
import { bot } from '../../bot';

let nukeArmed = false;
let nukePrimed = false;

bot.registerCommand('nuke', [], message => {
    if (message.author.id !== '200716538729201664') {
        bot.replyTo(message, bot.COLORS.ERROR, `☢️ WARNING: Unauthorized user detected. Further attempts to access restricted systems will result in the deployment of countermeasures.`);
        return;
    }

    bot.replyTo(message, bot.COLORS.ERROR, `☢️ WARNING: This action will kick all server members and delete all channels. This action cannot be reversed. Are you sure you wish to continue?`);
    nukePrimed = true;
});

export function nukeMessageHandler(message: Message<boolean>) {
    if (message.author.id !== '200716538729201664') {
        return;
    } 

    if (nukePrimed && message.content.toLowerCase() === 'abort') {
        nukePrimed = false;
        bot.replyTo(message, bot.COLORS.SUCCESS, `☢️ NOTICE: Server nuke has been disarmed. Standby mode engaged.`);
        return;
    }
    
    if (nukePrimed && message.content.toLowerCase() === 'yes') {
        nukeArmed = true;
        bot.replyTo(message, bot.COLORS.SUCCESS, `☢️ NOTICE: Server nuke is now armed. Awaiting activation message.`);
        return;
    }
    
    if (nukeArmed && (message.content.toLowerCase().includes('disarm') || message.content.toLowerCase().includes('abort'))) {
        nukeArmed = false;
        nukePrimed = false;
        bot.replyTo(message, bot.COLORS.SUCCESS, `☢️ NOTICE: Server nuke has been disarmed. Standby mode engaged.`);
        return;
    }
}