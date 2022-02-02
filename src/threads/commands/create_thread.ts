

import { registerCommand } from '../../utils/commands';
import { beginThreadCreation } from '../thread_creator';

registerCommand('create_thread', [], message => {
    beginThreadCreation(message);
});
