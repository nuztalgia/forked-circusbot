

import { parseCommand, registerCommand } from '../../utils/commands';
import { EMBED_INFO_COLOR, sendReply } from '../../utils/replies';
import { archiveThread, threads } from '../persistence';

registerCommand('archive_thread', ['at'], async message => {
    const [threadId] = parseCommand(message, /([0-9]+)/);
    const thread = threads[threadId];
    
    await archiveThread(thread);

    sendReply(message, EMBED_INFO_COLOR, `✅ The thread "${thread.title}" has been archived in <#${thread.channel}>`);
});
