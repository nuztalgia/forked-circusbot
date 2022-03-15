import { bot } from '../../bot';
import { beginEventCreation } from '../creator';

bot.registerCommand('quick_create', ['qc'], message => {
    beginEventCreation(message, true);
});
