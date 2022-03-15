

import { bot } from '../../bot';
import { beginThreadCreation } from '../thread_creator';

bot.registerCommand('create_thread', [], message => {
    beginThreadCreation(message);
});
