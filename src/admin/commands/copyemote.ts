import { Message, Permissions } from 'discord.js';
import { bot } from '../../bot';
import { EMBED_ERROR_COLOR, EMBED_SUCCESS_COLOR, log, makeError, sendReply, startTyping } from '../../utils';

bot.registerCommand('copyemote', ['emote', 'addemote'], async message => {
    const [emote] = bot.parseCommand(message, /(.*)/);

    await startTyping(message.channel);

    if (!(message instanceof Message) || !message.guild) {
        return;
    }

    const member = await message.guild.members.fetch(message.author.id)

    if (!member.permissions.has(Permissions.FLAGS.MANAGE_EMOJIS_AND_STICKERS)) {
        bot.sendReply(message, EMBED_ERROR_COLOR, makeError("Sorry, but you don't have permission to do that"));
        return;
    }

    let url = '';
    let name = '';
    let targetMsg = message;

    if (message.type === 'REPLY') {
        targetMsg = await message.fetchReference();
    }

    if (targetMsg.attachments.size > 0) {
        url = targetMsg.attachments.first()?.url || '';
        name = emote.trim() || targetMsg.attachments.first()?.name?.replace(/\.[a-z0-9]+$/i, '') || 'untitled';
    } else {
        let emoji = message.type === 'REPLY' ? targetMsg.content : emote;
        let m = emoji.match(/<(a?):([^:]+):([0-9]+)>/i);

        if (!m) {
            bot.sendReply(message, EMBED_ERROR_COLOR, makeError("No emoji detected"));
            return;
        }

        url = `https://cdn.discordapp.com/emojis/${m[3]}.${m[1] === 'a' ? 'gif' : 'png'}?size=4096&quality=lossless`;
        name = m[2];

        emoji = emote.replace(/<a?:([^:])+:([0-9])+>/i, '').trim();

        if (emoji.length > 0) {
            name = emoji;
        }
    }
    
    try {
        console.log(url, name);
        const newEmoji = await message.guild.emojis.create(url, name.replace(/:/g, ''));
        log('info', `${message.author.tag} has added a new emote (${url}, name: ${newEmoji.name}, id: ${newEmoji.id})`);
        setTimeout(() => {
            bot.sendReply(message, EMBED_SUCCESS_COLOR, `Your new emote has been added <${url.includes('.gif') ? 'a' : ''}:${newEmoji.name}:${newEmoji.id}>`);
        }, 100);
    } catch (err) {
        bot.sendReply(message, EMBED_ERROR_COLOR, makeError("Failed to create emoji: " + err));
    }
});
