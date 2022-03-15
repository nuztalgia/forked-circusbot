

import { bot } from '../../bot';
import { EMBED_INFO_COLOR, sendReply } from '../../utils';
import { archiveThread, buildThread, threads } from '../persistence';

bot.registerCommand('rebuild_thread', ['rt'], async message => {
    const [threadId] = bot.parseCommand(message, /([0-9]+)/);
    const thread = threads[threadId];
    
    await archiveThread(thread);
    await buildThread(thread);

    bot.replyTo(message, EMBED_INFO_COLOR, `✅ The thread "${thread.title}" has been archived & recreated in <#${thread.channel}>`);
});
