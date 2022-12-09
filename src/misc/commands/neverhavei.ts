import { ButtonInteraction, Message } from 'discord.js';
import { bot } from '../../bot';
import { client } from '../../client';

bot.registerCommand('neverhavei', [''], async message => {
    if (!message.channel.isThread()) {
        return bot.replyTo(message, bot.COLORS.ERROR, 'This command can only be run in a thread');
    }
        
    let messages = await message.channel.messages.fetch({ limit: 100 });
    let lastId = messages.last()?.id;

    if (messages.size === 100) {
        while (true) {
            let newMessages = await message.channel.messages.fetch({ before: lastId, limit: 100 });
            lastId = newMessages.last()?.id;
            messages = messages.concat(newMessages);
            
            if (newMessages.size < 100) {
                break;
            }
        }
    }

    console.log(`Retrieved ${messages.size} messages from ${message.channel.name}`);
    const totalMessages = messages.size;

    messages = messages.filter(x => x.content.toLowerCase().startsWith('never '));

    console.log(`Found ${messages.size} messages from ${message.channel.name} that seem like questions`);

    let reactions = {

    };

    let progress = await bot.replyTo(message, bot.COLORS.INFO, `Fetching reactions in this thread. This may take a while..... 1 of ${messages.size}`);

    let count = 1;

    for (let message of Array.from(messages.values()).reverse()) {
        for (let [_, reaction] of message.reactions.cache) {
            let users = await reaction.users.fetch();

            for (let [_, user] of users) {
                reactions[user.id] = reactions[user.id] || 0;
                reactions[user.id] += 1;

                console.log(`${user.tag} reacted with ${reaction.emoji} to "${message.content}"`);
            }
        }

        count++;

        if ((count % 10) === 0 && progress) {
            let newEmbed = progress.embeds[0];
            newEmbed.description = `Fetching reactions in this thread. This may take a while..... ${count} of ${messages.size}`;
            await progress.edit({ embeds: [newEmbed] });
        }
    }

    console.log(reactions);

    bot.replyTo(message, bot.COLORS.INFO, `Here is the reaction summary for this thread (there were ${totalMessages} messages and ${messages.size} seemed like questions):\n\n` + Object.keys(reactions).sort((a, b) => reactions[a] - reactions[b]).reverse().map(x => `<@${x}>: ${reactions[x]} reactions`).join('\n'));
});
