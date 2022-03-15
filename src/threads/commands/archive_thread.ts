

import { bot } from '../../bot';
import { EMBED_INFO_COLOR, sendReply } from '../../utils/replies';
import { archiveThread, threads } from '../persistence';

bot.registerCommand('archive_thread', ['at'], async message => {
    const [threadId] = bot.parseCommand(message, /([0-9]+)/);
    const thread = threads[threadId];
    
    await archiveThread(thread);

    bot.sendReply(message, EMBED_INFO_COLOR, `✅ The thread "${thread.title}" has been archived in <#${thread.channel}>`);
});
