import { bot } from '../../bot';
import { sendReply, EMBED_ERROR_COLOR, EMBED_DMM_COLOR, arrayRandom } from '../../utils';

const POSSIBLE_ANSWERS = [
    'It is certain.',
    'It is decidedly so.',
    'Without a doubt.',
    'Yes definitely.',
    'You may rely on it.',
    'As I see it, yes.',
    'Most likely.',
    'Outlook good.',
    'Yes.',
    'Signs point to yes.',
    'Reply hazy, try again.',
    'Ask again later.',
    'Better not tell you now.',
    'Cannot predict now.',
    'Concentrate and ask again.',
    'Don\'t count on it.',
    'My reply is no.',
    'My sources say no.',
    'Outlook not so good.',
    'Very doubtful.',
]

bot.registerCommand('8ball', [], message => {
    let [question] = bot.parseCommand(message, /(.*)/);
    
    if (!question.trim()) {
        bot.sendReply(message, bot.COLORS.ERROR, 'You must ask a question, to receive an answer');
        return;
    }
   
    bot.sendReply(message, bot.COLORS.DM, arrayRandom(POSSIBLE_ANSWERS));
});
