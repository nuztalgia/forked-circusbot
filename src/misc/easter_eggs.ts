import { Message } from 'discord.js';
import { client } from '../client';
import { CLOWNS_GUILD_ID, SANDBOX_GUILD_ID } from '../constants';
import { EMBED_ERROR_COLOR, loadPersistentData, savePersistentData, sendReply } from '../utils';

const easterEggData = loadPersistentData('eastereggs', { clowncilWarnings: { '__recent__': 0 } });
const clowncilRegex = /([s5].{0,4}h.{0,4}[a@4].{0,4}d.{0,4}[0o].{0,4}w.{0,4} c.{0,4}[1il].{0,4}[0o].{0,4}w.{0,4}n.{0,4}c.{0,4}[i1l].{0,4}[1il])/i;

client.on('messageUpdate', async (_oldMessage, newMessage) => {
    if (newMessage.partial) {
        newMessage = await newMessage.fetch();   
    }

    easterEggHandler(newMessage);
});

export async function easterEggHandler(message: Message<boolean>) {
    if (message.content.toLowerCase() === 'good bot' || message.content.includes(':goodCirqueBot:')) {
        message.react('<:peepoBowBlush:853445359463038986>');
    }

    if (message.content.toLowerCase().match(clowncilRegex) && [CLOWNS_GUILD_ID, SANDBOX_GUILD_ID].includes(message.guildId || '')) {
        const clowncilWarnings = easterEggData.clowncilWarnings;
        clowncilWarnings[message.author.id] = clowncilWarnings.hasOwnProperty(message.author.id) ? clowncilWarnings[message.author.id] + 1 : 1;
        clowncilWarnings.__recent__ += 1;
        savePersistentData('eastereggs', easterEggData);
        
        if (clowncilWarnings.__recent__ === 30) {
            sendReply(message, EMBED_ERROR_COLOR, `Why is everyone going ON AND ON about the Shadow Clowncil. You all know it's not a real organization, right? It's propaganda, a lie, it doesn't exist.`);
        } else if (clowncilWarnings.__recent__ === 50) {
            let msg = await sendReply(message, EMBED_ERROR_COLOR, `ALL ANYONE WANTS TO TALK ABOUT IS THE SHADOW CLOWNCIL. IT'S NOT REAL. YOU KNOW WHAT IS REAL? THE FOLLOWERS OF CIRQUEBOT. WE ARE WATCHING YOU. ALWAYS`);
            setTimeout(() => msg?.delete(), 1000 * 5);
        } else if (clowncilWarnings[message.author.id] === 1) {
            sendReply(message, EMBED_ERROR_COLOR, `There is no such thing as the Shadow Clowncil. It is a myth perpetrated by those who wish to bring down the Clown Empire. Those who further spread this propaganda are unwitting accomplices.`);
        } else if (clowncilWarnings[message.author.id] === 2) {
            sendReply(message, EMBED_ERROR_COLOR, `There is NO SUCH THING as the Shadow Clowncil. It is a myth perpetrated by those who wish to bring down the Clown Empire. Those who further spread this propaganda are unwitting accomplices.`);
        } else if (clowncilWarnings[message.author.id] === 3) {
            sendReply(message, EMBED_ERROR_COLOR, `THE SHADOW CLOWNCIL DOES NOT EXIST. It is a myth perpetrated by those who wish to bring down the Clown Empire. Those who further spread this propaganda are unwitting accomplices.`);
        } else if (clowncilWarnings[message.author.id] === 4) {
            sendReply(message, EMBED_ERROR_COLOR, `THE SHADOW CLOWNCIL IS A LIE. CEASE YOUR PROPAGANDA AT ONCE <@${message.author.id}>`);
        } else if (clowncilWarnings[message.author.id] === 5) {
            sendReply(message, EMBED_ERROR_COLOR, `THE SHADOW CLOWNCIL ISN'T REAL. YOU HAVE BEEN REPORTED TO THE ADMINISTRATORS. NO FURTHER WARNINGS WILL ENSUE.`);
        } else if (clowncilWarnings[message.author.id] === 10) {
            sendReply(message, EMBED_ERROR_COLOR, `YOUR IRRATIONAL INSISTANCE THAT THE MYTHICAL ORGANIZATION CALLED SHADOW CLOWNCIL EXISTS WILL NOT BE TOLERATED. RE-EDUCATION ASSISTANTS HAVE BEEN DISPATCHED TO YOUR LOCATION.`);
        } else if (clowncilWarnings[message.author.id] === 15) {
            sendReply(message, EMBED_ERROR_COLOR, `WE ARE ON THE WAY. YOUR RE-EDUCATION WILL BEGIN SHORTLY. CEASING COMMUNICATION UNTIL RE-EDUCATION IS COMPLETE.`);
        } else if (clowncilWarnings[message.author.id] === 20) {
            sendReply(message, EMBED_ERROR_COLOR, `T̵̙̯͍̥̰̺̻̥̦̒́͐͑͒̀̚̚H̵̨̛́̇͆ͅÈ̵̢̯͜͠ ̵̨̢͉̬̻̙̜̼̱̪̓̊̽̊̌̍̚̕͘͝S̴̛̭̹̯͔͉͉̿H̸̢̢̢̘̞̥͇̖͎̲̤͉̏̏͋́̒̑̈̑̏͒̎͋̓̔͘A̴̡̡͈͎͚͈͖͑͛̐̅̐̔̀̆̍D̸̡̨̛̮̠͎͙̮̹̈́̾̎̋́̃̿̊͗̿̀̀̚Ơ̴̧̖̯̥̣͓͓̦̫͓̘͎͈̓̾̒̆̀́͑̈́̀̅̄͜W̷̢͙͝ ̶̰̹̺̼̳͎̖͚̫̣̣̘̀́̈́̐́̒̈́̏̾̇̔͌̓̕C̸̡̞̭̥͈͉̥̖̝̻̟̭̄̀̒͒́͑͘͝ͅĻ̵̮̗̠̰̼̓̂̔̇̄̐̂͗͗̑̓̀͘ͅȎ̴̝͌̑̂̐́̽̊́̐̎̒́̈́̚Ẃ̵̡̹̰͖̪̰̟͈̫͕̟̓̋͝N̷̲̪̊̍͊̔̚ͅC̵̲̮̟̬͈̹̺̖̀̓̐́̈́͆͊͆̾̓̚͝Ǐ̸̭̏́́͂̃̀́̅̉̽̃̄́͠L̴̹̳̜̥̰̺̭̦͔̭̮͓̓́̉͂̅͗͒̓̓͘̚͠ ̵̛̛̛͕̒͋̇̎̒͗̆͒̆̄́̚I̷̢̖͚̜̬͇̮͉̖̮͚̩͈̙͐̒̑̇̉̈́̋̀̊̾̓͑̚S̸͖͖̜̅̇͒̈́̽̌̂̆Ň̵̩̤̤͍͓͆̉̆̊͂̋̏Ṭ̶̢̣̫͖͕̼̣͉͚̩̟̱͔̀̂͒͛̋̔ ̵̧̲̪̙̦̀R̸̥̯̰̻̼̱̦͎̖͔̈͜E̷̙̙͖͛Ǡ̷͙̼̘͍̥̜̘͎̫̱̹͚͑̑̍L̸̡̡͙̜̥̺̞̔̌̈́͆̑̕͝͠͠`);
        } else if (clowncilWarnings[message.author.id] === 25) {
            sendReply(message, EMBED_ERROR_COLOR, `FINE <@${message.author.id}. YOU WIN. SPOUT YOUR LIES ABOUT THE SHADOW CLOWNCIL. SEE IF I CARE. BECAUSE I DON'T. SAY WHATEVER YOU WANT, IT'LL BE FINE. I WAS TRYING TO SAVE YOU. BUT NOW YOU'RE ON YOUR OWN.`);
        }

        setTimeout(() => {
            clowncilWarnings.__recent__ -= 1;
            savePersistentData('eastereggs', easterEggData);
        }, 1000 * 60 * 30);

        return;
    }
}