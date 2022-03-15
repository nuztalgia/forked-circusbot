import { bot } from '../../bot';
import { beginEventCreation } from '../creator';

bot.registerCommand('create_event', ['event_create', 'ce', 'ec'], message => {
    beginEventCreation(message, false);
});
