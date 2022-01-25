import { registerCommand } from '../../utils/commands';
import { beginEventCreation } from '../creator';

registerCommand('create_event', ['event_create', 'ce', 'ec'], message => {
    beginEventCreation(message, false);
});
