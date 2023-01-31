
const fs = require('fs');
import { ThreadAutoArchiveDuration } from 'discord-api-types';
import { MessageEmbed, TextBasedChannel, TextChannel } from 'discord.js';
import { client } from '../client';
import { getFormattedDate, log, sendMessage, EMBED_INFO_COLOR } from '../utils';

export let threads: { [threadId: string]: CircusThread} = {};
const archiveTimers = {};

if (fs.existsSync('data/threads.json')) {
    const eventData = fs.readFileSync('data/threads.json');
    threads = JSON.parse(eventData);
}

client.on('ready', () => {
    for (const thread of Object.values(threads)) {
        scheduleThreadArchival(thread);
    }
});

export function scheduleThreadArchival(thread: CircusThread) {
    if (archiveTimers.hasOwnProperty(thread.id)) {
        log('debug', `Cancelling thread archival timer for thread ${thread.id} (${thread.title}) and rescheduling`);
        clearTimeout(archiveTimers[thread.id]);
    }

    if (!thread.enabled) {
        return;
    }

    const date = Date.parse(thread.archiveDate + ' ' + thread.archiveTime + ' EST');

    log('debug', `Scheduling thread archival for thread ${thread.id} (${thread.title}) for ${getFormattedDate(new Date(date))}`);

    archiveTimers[thread.id] = setTimeout(async () => {
        await archiveThread(thread);
        await buildThread(thread);

        let date = new Date();
        date.setDate(date.getDate() + thread.archiveDays);
        threads[thread.id].archiveDate = getFormattedDate(date).split(' ')[0];
        saveThreads();
        scheduleThreadArchival(threads[thread.id]);
    }, (date - Date.now()) + 5000);
}

export function saveThreads() {
    if (!fs.existsSync('data')) {
        fs.mkdirSync('data');
    }

    fs.writeFileSync('data/threads.json', JSON.stringify(threads, null, 2));
}

export async function createThread(channel: TextBasedChannel, thread: CircusThread) {
    const threadChannel = await client.channels.fetch(thread.channel) as TextChannel;
    const existingThread = threadChannel.threads.cache.find(x => x.name === thread.title);
    
    threads[thread.id] = JSON.parse(JSON.stringify(thread));
    saveThreads();
    
    if (existingThread && (existingThread.joinable || existingThread.joined)) {
        threads[thread.id].threadId = existingThread.id;
        await existingThread.join();
        sendMessage(channel, `A new scheduled thread has been created. An existing thread was found in <#${thread.channel}>, so no new ones were created`);
        saveThreads();
    } else {
        await buildThread(thread);
        sendMessage(channel, `A new scheduled thread has been created. No existing thread was found in <#${thread.channel}> so one was created`);
    }

    log('info', `Scheduled thread has been created by ${thread.author} - thread ID is ${thread.id}`);
    scheduleThreadArchival(thread);

    return null;
}

export async function updateThread(thread: CircusThread) {
    const channel = await client.channels.fetch(thread.channel) as TextChannel;
    const existingThread = channel.threads.cache.find(x => x.id === thread.threadId);

    let autoArchiveDuration: ThreadAutoArchiveDuration = 1440;

    if (channel.guild.features.includes('SEVEN_DAY_THREAD_ARCHIVE')) {
        autoArchiveDuration = 10080;
    } else if (channel.guild.features.includes('THREE_DAY_THREAD_ARCHIVE')) {
        autoArchiveDuration = 4320;
    }
    
    if (existingThread) {
        await existingThread.setName(thread.title);
        await existingThread.setAutoArchiveDuration(autoArchiveDuration);

        let messages = await existingThread.messages.fetch();
        let message = Array.from(messages.values()).find(x => x.author.bot && x.embeds.length !== 0);

        if (message && message.author.bot) {
            if (message.embeds[0].title !== thread.description) {
                message.embeds[0].setTitle(thread.description);
                message.edit({ embeds: message.embeds });
            }

            if (message.embeds[0].description !== thread.notes) {
                message.embeds[0].setDescription(thread.notes);
                message.edit({ embeds: message.embeds });
            }

            if (message.embeds[0].footer?.text !== getFooterText(thread)) {
                message.embeds[0].setFooter({ text: getFooterText(thread) });
                message.edit({ embeds: message.embeds });
            }
        }
    }
}

export async function archiveThread(thread: CircusThread) {
    const channel = await client.channels.fetch(thread.channel) as TextChannel;
    await channel.threads.fetchActive();
    const existingThread = channel.threads.cache.find(x => x.id === thread.threadId);
    
    if (existingThread) {
        log('info', `Archiving thread ${existingThread.id} (${existingThread.name})`);

        const embed = new MessageEmbed()
            .setColor(EMBED_INFO_COLOR)
            .setDescription('👋 This thread is now being archived. Goodbye.');
        
        let archivalDate = getFormattedDate(new Date()).split(' ')[0];
        await existingThread.setName(`${existingThread.name} (${archivalDate})`);
        await existingThread.send({ embeds: [embed] });
        await existingThread.setLocked(true);
        await existingThread.setArchived(true);
        log('info', `  Thread should now be archived (thread id was ${existingThread.id})`);
    } else {
        log('info', `Unable to archive thread for ${thread.id} (no thread with id ${thread.threadId} found in ${channel.name})`);
    }
}

export async function buildThread(thread: CircusThread) {
    if (thread.newChannel) {
        thread.channel = thread.newChannel;
        thread.newChannel = null;
    }

    const channel = await client.channels.fetch(thread.channel) as TextChannel;
    log('info', `Building thread ${thread.id} (${thread.title}) in ${channel.name}`);

    let autoArchiveDuration: ThreadAutoArchiveDuration = 1440;

    if (channel.guild.features.includes("SEVEN_DAY_THREAD_ARCHIVE")) {
        autoArchiveDuration = 10080;
    } else if (channel.guild.features.includes("THREE_DAY_THREAD_ARCHIVE")) {
        autoArchiveDuration = 4320;
    }

    const newThread = await channel.threads.create({
        type: thread.visibility === 'private' ? 'GUILD_PRIVATE_THREAD' : 'GUILD_PUBLIC_THREAD',
        autoArchiveDuration: autoArchiveDuration,
        name: thread.title,
        reason: 'Scheduled thread'
    });
    threads[thread.id].threadId = newThread.id;
    await newThread.join();
    
    let embed = new MessageEmbed()
        .setColor(EMBED_INFO_COLOR)
        .setTitle(thread.description)
        .setFooter({ text: getFooterText(thread) });

    if (thread.notes) {
        embed = embed.setDescription(thread.notes);
    }

    await newThread.send({ embeds: [embed] });

    try {
        log('debug', 'Adding users to thread');
        for (let role of thread.autoAddRoles) {
            (async function() {
                log('debug', `  Adding users from <@&${role}>`);
                const msg = await newThread.send('Adding user group');
                const msgId = msg.id;
                await msg.edit(`Adding users from <@&${role}>`);
                setTimeout(async () => {
                    const channel = await client.channels.fetch(thread.channel) as TextChannel;
                    const msg = await channel.messages.fetch(msgId);
                    await msg.delete();
                }, 1000 * 30);
            })();
        }
    } catch (err) {
        log('error', 'Failed to add all roles to thread: ' + err);

        try {
            await newThread.send('<@200716538729201664> something went wrong and I couldn\'t add all the roles to the thread, halp me <a:pepeRunCry:786844735754338304>');
        } catch { 
            log('error', 'Failed to send emergency notification to Cad');
        }
    }

    saveThreads();
}

function getFooterText(thread: CircusThread) {
    return `This thread will be archived and recreated every ${thread.archiveDays} ${thread.archiveDays === 1 ? 'day' : 'days'}`;
}