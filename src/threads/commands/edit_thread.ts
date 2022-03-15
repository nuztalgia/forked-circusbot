

import { TextBasedChannel } from 'discord.js';
import { bot } from '../../bot';
import { EMBED_INFO_COLOR, sendError, sendReply } from '../../utils/replies';
import { saveThreads, scheduleThreadArchival, threads, updateThread } from '../persistence';

function editEventUsage(channel: TextBasedChannel) {
    sendError(channel, "Incorrect syntax to edit a thread. Correct usage:\n\n" +
        "`!edit_thread <THREAD_ID> <FIELD_NAME> <NEW VALUE>`\n\n" +
        "Example:\n\n" +
        "`!edit_thread 123456789 title New Title`\n\n" +
        "Valid fields:\n\n" +
        " - title\n" + 
        " - description\n" +
        " - enabled\n" +
        " - archiveDate\n" +
        " - archiveDays\n" +
        " - archiveTime\n" +
        " - channel\n" +
        " - visibility\n" + 
        " - roles");
}

bot.registerCommand('edit_thread', ['et'], message => {
    const [threadId, threadField, threadValue] = bot.parseCommand(message, /([0-9]+) +([\S]+) +(.*)/);

    if (!threadId) {
        editEventUsage(message.channel);
        return;
    } else if (!threads.hasOwnProperty(threadId)) {
        sendError(message.channel, "Unable to edit thread, no such Thread ID was found");
        return;
    }

    if (threadField === 'roles') {
        threads[threadId].autoAddRoles = message.mentions.roles.map(x => x.id);
    } else if (threadField === 'archiveDays') {
        threads[threadId].archiveDays = parseInt(threadValue);
    } else if (threadField === 'archiveTime') {
        threads[threadId].archiveTime = threadValue;
        scheduleThreadArchival(threads[threadId]);
    } else if (threadField === 'archiveDate') {
        threads[threadId].archiveDate = threadValue;
        scheduleThreadArchival(threads[threadId]);
    } else if (threadField === 'enabled') {
        threads[threadId].enabled = threadValue === 'true';
        scheduleThreadArchival(threads[threadId]);
    } else if (threadField === 'channel') {
        threads[threadId].newChannel = message.mentions.channels.first()?.id || '';
        bot.replyTo(message, EMBED_INFO_COLOR, 'The next time the thread is archived and recreated, the thread will be created in the updated channel. To move the thread now, use the `!rebuild_thread` command');
        return;
    } else if (threads[threadId].hasOwnProperty(threadField)) {
        threads[threadId][threadField] = threadValue;
    } else {
        editEventUsage(message.channel);
        return;
    }

    if (['title', 'description', 'archiveDays'].includes(threadField)) {
        updateThread(threads[threadId]);
    }

    saveThreads();
    message.react('👍');
});
