import { Message } from 'discord.js';
import { registerCommand, getRandomInt, parseCommand, sendReply, EMBED_ERROR_COLOR, EMOJI_ERROR, EMBED_SUCCESS_COLOR } from '../../utils';

registerCommand('nroll', ['roll'], message => {
    let [params] = parseCommand(message, /(.*)/);
    let min = 0, max = 0, minStr = '0', maxStr = '';

    if (message instanceof Message && !message.content.includes('nroll')) {
        min = 1;
        minStr = '1';
    }

    params = params.replace(/([0-9])-/, '$1 -').trim();

    if (!params.trim()) { 
        return;
    } else if (params.includes(' -')) {
        minStr = params.split(' -')[0].trim();
        maxStr = params.split(' -')[1].trim(); 
        min = parseInt(minStr);
        max = parseInt(maxStr);
    } else {
        maxStr = params.trim();
        max = parseInt(params.trim());
    }

    if (isNaN(min) || min.toString() !== minStr) {
        sendReply(message, EMBED_ERROR_COLOR, `${EMOJI_ERROR} ${params.split(' -')[0]} is not a number I can understand (min)`);
        return;
    } else if (isNaN(max) || max.toString() !== maxStr) {
        sendReply(message, EMBED_ERROR_COLOR, `${EMOJI_ERROR} ${params.split(' -')[1]} is not a number I can understand (max)`);
        return;
    } else if (min > max) {
        sendReply(message, EMBED_ERROR_COLOR, `${EMOJI_ERROR} Minimum number cannot be greater then maximum number`);
        return;
    }

    const roll = getRandomInt(min, max);
    let msg = `<@${message.author.id}> rolled **${roll == 69 ? '<:69:776740697892978728>' : roll}**`;

    if (roll === max && max !== min) {
        msg += ' 🥳';
    } else if (roll === min && max !== min) {
        msg += ' <:pepePointLaugh:925112330633740288>';
    }

    sendReply(message, EMBED_SUCCESS_COLOR, msg);
});
