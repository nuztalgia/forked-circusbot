import { registerCommand } from '../../utils/commands';
import { beginEventCreation } from '../creator';

registerCommand('quick_create', ['qc'], message => {
    beginEventCreation(message, true);
});
