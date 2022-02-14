

import { parseCommand, registerCommand } from '../../utils/commands';
import { EMBED_INFO_COLOR, sendReply } from '../../utils/replies';
import { archiveThread, buildThread, threads } from '../persistence';

registerCommand('rebuild_thread', ['rt'], async message => {
    const [threadId] = parseCommand(message, /([0-9]+)/);
    const thread = threads[threadId];
    
    await archiveThread(thread);
    await buildThread(thread);

    sendReply(message, EMBED_INFO_COLOR, `✅ The thread "${thread.title}" has been archived & recreated in <#${thread.channel}>`);
});
