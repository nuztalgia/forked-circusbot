import { bot } from '../../bot';
import { arrayRandom } from '../../utils';

let messages = [
    `Let's go with $`,
    `Hmm, thats a tough one. How about $`,
    `All good options, but I think $ is the best one`,
    `Why does everyone always want me to decide? I guess $ is ok`,
    `I'm not a fan of any of those options, but let's go with $`,
    `Pfffft, obviously $ is best`,
    `$, I CHOOSE YOU!`
];

bot.registerCommand('pick', ['choose'], message => {
    let [options] = bot.parseCommand(message, /(.*)/);
    let decisions = options.split(options.includes(',') ? ',' : ' ').map(x => x.trim());
    const roll = arrayRandom(decisions);

    let msg = arrayRandom(messages).replace(/\$/, `**${roll}**`);

    bot.replyTo(message, bot.COLORS.DM, msg);
});
