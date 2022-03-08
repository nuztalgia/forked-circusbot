import { Message, TextChannel, User } from 'discord.js';
import { client } from '../../client';
import { registerCommand, getRandomInt, parseCommand, sendReply, EMBED_ERROR_COLOR, EMOJI_ERROR, EMBED_SUCCESS_COLOR, loadPersistentData, log, getFormattedDate, savePersistentData } from '../../utils';

let reminders = loadPersistentData('reminders', []);

client.on('ready', () => {
    reminders.forEach(reminder => scheduleReminder(reminder));
});

function scheduleReminder(reminder: any) {
    log('info', `${reminder.remindedBy} has set a reminder for ${reminder.remindee} at ${reminder.remindAt}`);

    setTimeout(async () => {
        const channel = await client.channels.fetch(reminder.channel) as TextChannel;
        channel.send({ content: `<@${reminder.remindee}> ${reminder.reminder}` })
        reminders = reminders.filter(x => x.id !== reminder.id);
        savePersistentData('reminders', reminders);
    }, Date.parse(reminder.remindAt) - Date.now());
}

registerCommand('remind_me', ['remindme', 'remind'], message => {
    if (!(message instanceof Message)) return;

    let [user, remindTime, remindUnit, reminder] = parseCommand(message, /(<.*?> )?(([0-9]+) (?:hour|minute|day|week|month)s?|[0-9]{1,2}:[0-9]{2} ?(?:AM|PM))(.*)/i);
    
    let remindee = user ? message.mentions.users.first() : message.author;

    if (!remindee || !remindTime) {
        return;
    }

    let remindAt = new Date();

    if (remindTime.includes('minute')) {
        remindAt.setMinutes(remindAt.getMinutes() + parseInt(remindUnit));
    } else if (remindTime.includes('hour')) {
        remindAt.setHours(remindAt.getHours() + parseInt(remindUnit));
    } else if (remindTime.includes('day')) {
        remindAt.setHours(remindAt.getHours() + parseInt(remindUnit) * 24);
    } else if (remindTime.includes('week')) {
        remindAt.setHours(remindAt.getHours() + parseInt(remindUnit) * 24 * 7);
    } else if (remindTime.includes('month')) {
        remindAt.setMonth(remindAt.getMonth() + parseInt(remindUnit));
    } else {
        let scheduledTime = remindAt.getFullYear() + "-" + ('0' + (remindAt.getMonth() + 1)).slice(-2) + "-" + ('0' + remindAt.getDate()).slice(-2) + ' ' + remindTime + ' EST';
        remindAt = new Date(scheduledTime);
    }
    
    let newReminder = {
        id: message.id,
        channel: message.channel.id,
        remindedBy: message.author.id,
        remindee: remindee.id,
        remindAt: getFormattedDate(remindAt),
        reminder: reminder ? `${message.author.id === remindee.id ? 'You' : message.author.tag} asked me to remind you at this time with the following message: ${reminder}` : `${message.author.id === remindee.id ? 'You' : message.author.tag} asked me to remind you at this time, but didn\'t specify a reason. I hope I\'ve jogged your memory <:potatoAngel:925130155507191948>`,
    };

    reminders.push(newReminder)
    savePersistentData('reminders', reminders);
    scheduleReminder(newReminder);

    message.react('👍');
});
