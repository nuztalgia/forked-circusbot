import { Client, Message } from "discord.js";
import { sendError, sendMessage } from "../utils/embeds";
import { getFormattedDate, log } from "../utils/logging";
import { makeEmptyThread } from "./default_thread";
import { createThread } from "./persistence";

let threadSessions: { [channelId: string]: CircusThread } = { };

export function beginThreadCreation(message: Message<boolean>) {
    if (threadSessions.hasOwnProperty(message.channel.id)) {
        sendError(message.channel, "Another user is already in the process of creating a thread. Please wait for them to finish.");
        return;
    }

    threadSessions[message.channel.id] = makeEmptyThread();
    threadSessions[message.channel.id].serverId = message.guildId || '';
    threadSessions[message.channel.id].authorId = message.author.id;
    threadSessions[message.channel.id].author = `${message.author.tag} {${message.author.id}}`;
    threadSessions[message.channel.id].messageId = message.id;
    threadSessions[message.channel.id].id = message.id;

    log('info', `User ${message.author.tag} {${message.author.id}} is now creating a scheduled thread`);

    if (message.content.includes('json')) {
        threadSessions[message.channel.id].step = 'json';
        sendMessage(message.channel, "Creating new thread (Advanced Mode). Please enter the JSON for the event:");
    } else {
        threadSessions[message.channel.id].step = 'title';
        sendMessage(message.channel, "Creating new scheduled thread. Please enter a **Title** for the thread (e.g. \"Weekly Lockouts\"):");
    }
}

export function threadCreationHandler(message: Message<boolean>) {
    if (!threadSessions.hasOwnProperty(message.channel.id) || threadSessions[message.channel.id].authorId !== message.author.id) {
        return;
    }

    const thread = threadSessions[message.channel.id];

    if (message.id === thread.messageId) {
        return; // Artifact of having multiple messageCreate event listeners
    } else if (message.content === 'cancel') {
        delete threadSessions[message.channel.id];
        return;
    } else if (message.content === 'debug') {
        sendMessage(message.channel, '```\n' + JSON.stringify(event, null, 2) + '\n```');
        return;
    }

    switch (thread.step) {
        case 'json':
            threadSessions[message.channel.id] = JSON.parse(message.content);
            thread.authorId = message.author.id;
            thread.author = `${message.author.tag} {${message.author.id}}`;
            createThread(message.channel, thread);
            delete threadSessions[message.channel.id];
            break;
        case 'title':
            thread.title = message.content;
            thread.step = 'description';
            sendMessage(message.channel, "Please provide a description for the thread, which will be posted each time the thread is created:");
            break;
        case 'description':
            thread.description = message.content;
            thread.step = 'archiveDays';
            sendMessage(message.channel, "Please enter the number of **days** after which the thread should be archived/recreated:");
            break;
        case 'archiveDays':
            thread.archiveDays = parseInt(message.content);
            thread.step = 'archiveDate';
            sendMessage(message.channel, `Please enter the date (format '01-Jan-2022') when the thread should next be archived (or type 'next' to archive it ${thread.archiveDays} days from today):`);
            break;
        case 'archiveDate':
            if (message.content === 'next') {
                var date = new Date();
                date.setDate(date.getDate() + thread.archiveDays);

                thread.archiveDate = getFormattedDate(date).split(' ')[0];
            } else if (!message.content.match(/^[0-9]{1,2}-(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)-202[2-9]$/)) {
                sendError(message.channel, 'Invalid date or date format was given, please try again');
                message.react('👎');
                return;
            } else {
                thread.archiveDate = message.content;
            }

            thread.step = 'archiveTime';
            sendMessage(message.channel, "Please enter the time of day when the thread should be archived (format: '9:00 AM'):");
            break;
        case 'archiveTime':
            if (!message.content.match(/^[0-2]?[0-9]:[0-9]{2} (AM|PM)$/i)) {
                sendError(message.channel, 'Invalid time or time format was given, please try again');
                message.react('👎');
                return;
            }

            thread.archiveTime = message.content;
            thread.step = 'channel';
            sendMessage(message.channel, "Please enter the target channel to create the thread in (use a channel mention):");
            break;
        case 'channel':
            thread.channel = message.mentions.channels.first()?.id;
            thread.step = 'visibility';
            sendMessage(message.channel, "Would you like to create a public or private thread:");
            break;
        case 'visibility':
            thread.visibility = message.content;
            thread.step = 'autoAdd';
            sendMessage(message.channel, "Please provide a list of roles to add to the channel after it's created (use mentions):");
            break;
        case 'autoAdd':
            if (message.mentions.roles.size === 0) {
                thread.autoAddRoles = message.content.split(',').map(x => x.trim()).map(x => message.guild?.roles.cache.find(y => y.name === x)?.id || '');
            } else {
                thread.autoAddRoles = message.mentions.roles.map(x => x.id);
            }
            thread.step = 'none';
            createThread(message.channel, thread);
            delete threadSessions[message.channel.id];
            break;
    }
}