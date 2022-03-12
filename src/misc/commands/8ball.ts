import { Message } from 'discord.js';
import { registerCommand, getRandomInt, parseCommand, sendReply, EMBED_ERROR_COLOR, EMOJI_ERROR, EMBED_SUCCESS_COLOR, EMBED_DMM_COLOR, arrayRandom } from '../../utils';

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

registerCommand('8ball', [], message => {
    let [question] = parseCommand(message, /(.*)/);
    
    if (!question.trim()) {
        sendReply(message, EMBED_ERROR_COLOR, 'You must ask a question, to receive an answer');
        return;
    }
   
    sendReply(message, EMBED_DMM_COLOR, arrayRandom(POSSIBLE_ANSWERS));
});
