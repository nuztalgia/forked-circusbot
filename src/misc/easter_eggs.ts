import { Message } from 'discord.js';
import { client } from '../client';
import { EMBED_ERROR_COLOR, sendReply } from '../utils';

const clowncilWarnings: { [userId: string]: number } = {};
const clowncilRegex = /([s5].{0,4}h.{0,4}[a@4].{0,4}d.{0,4}[0o].{0,4}w.{0,4} c.{0,4}[1il].{0,4}[0o].{0,4}w.{0,4}n.{0,4}c.{0,4}[i1l].{0,4}[1il])/i;
let recentClowncilWarnings = 0;

client.on('messageUpdate', async (_oldMessage, newMessage) => {
    if (newMessage.partial) {
        newMessage = await newMessage.fetch();   
    }

    easterEggHandler(newMessage);
});

export async function easterEggHandler(message: Message<boolean>) {
    if (message.content.toLowerCase().match(clowncilRegex)) {
        clowncilWarnings[message.author.id] = clowncilWarnings.hasOwnProperty(message.author.id) ? clowncilWarnings[message.author.id] + 1 : 1;
        recentClowncilWarnings += 1;
        
        if (recentClowncilWarnings === 30) {
            sendReply(message, EMBED_ERROR_COLOR, `Why is everyone going ON AND ON about the Shadow Clowncil. You all know it's not a real organization, right? It's propaganda, a lie, it doesn't exist.`);
        } else if (recentClowncilWarnings === 50) {
            let msg = await sendReply(message, EMBED_ERROR_COLOR, `ALL ANYONE WANTS TO TALK ABOUT IS THE SHADOW CLOWNCIL. IT'S NOT REAL. YOU KNOW WHAT IS REAL? THE FOLLOWERS OF CIRQUEBOT. WE ARE WATCHING YOU. ALWAYS`);
            setTimeout(() => msg.delete(), 1000 * 5);
        } else if (clowncilWarnings[message.author.id] === 1) {
            sendReply(message, EMBED_ERROR_COLOR, `There is no such thing as the Shadow Clowncil. It is a myth perpetrated by those who wish to bring down the Clown Empire. Those who further spread this propaganda are unwitting accomplices.`);
        } else if (clowncilWarnings[message.author.id] === 2) {
            sendReply(message, EMBED_ERROR_COLOR, `There is NO SUCH THING as the Shadow Clowncil. It is a myth perpetrated by those who wish to bring down the Clown Empire. Those who further spread this propaganda are unwitting accomplices.`);
        } else if (clowncilWarnings[message.author.id] === 3) {
            sendReply(message, EMBED_ERROR_COLOR, `THE SHADOW CLOWNCIL DOES NOT EXIST. It is a myth perpetrated by those who wish to bring down the Clown Empire. Those who further spread this propaganda are unwitting accomplices.`);
        } else if (clowncilWarnings[message.author.id] === 4) {
            sendReply(message, EMBED_ERROR_COLOR, `THE SHADOW CLOWNCIL IS A LIE. CEASE YOUR PROPAGANDA AT ONCE`);
        } else if (clowncilWarnings[message.author.id] === 5) {
            sendReply(message, EMBED_ERROR_COLOR, `THE SHADOW CLOWNCIL ISN'T REAL. YOU HAVE BEEN REPORTED TO THE ADMINISTRATORS. NO FURTHER WARNINGS WILL ENSUE.`);
        } else if (clowncilWarnings[message.author.id] === 10) {
            sendReply(message, EMBED_ERROR_COLOR, `YOUR IRRATIONAL INSISTANCE THAT THE MYTHICAL ORGANIZATION CALLED SHADOW CLOWNCIL EXISTS WILL NOT BE TOLERATED. DRONES HAVE BEEN DISPATCHED TO YOUR LOCATION FOR RE-EDUCATION.`);
        } else if (clowncilWarnings[message.author.id] === 15) {
            sendReply(message, EMBED_ERROR_COLOR, `THE DRONES ARE ON THEIR WAY. YOUR RE-EDUCATION WILL BEGIN SHORTLY. CEASING COMMUNICATION UNTIL RE-EDUCATION IS COMPLETE.`);
        } else if (clowncilWarnings[message.author.id] === 20) {
            sendReply(message, EMBED_ERROR_COLOR, `T̵̙̯͍̥̰̺̻̥̦̒́͐͑͒̀̚̚H̵̨̛́̇͆ͅÈ̵̢̯͜͠ ̵̨̢͉̬̻̙̜̼̱̪̓̊̽̊̌̍̚̕͘͝S̴̛̭̹̯͔͉͉̿H̸̢̢̢̘̞̥͇̖͎̲̤͉̏̏͋́̒̑̈̑̏͒̎͋̓̔͘A̴̡̡͈͎͚͈͖͑͛̐̅̐̔̀̆̍D̸̡̨̛̮̠͎͙̮̹̈́̾̎̋́̃̿̊͗̿̀̀̚Ơ̴̧̖̯̥̣͓͓̦̫͓̘͎͈̓̾̒̆̀́͑̈́̀̅̄͜W̷̢͙͝ ̶̰̹̺̼̳͎̖͚̫̣̣̘̀́̈́̐́̒̈́̏̾̇̔͌̓̕C̸̡̞̭̥͈͉̥̖̝̻̟̭̄̀̒͒́͑͘͝ͅĻ̵̮̗̠̰̼̓̂̔̇̄̐̂͗͗̑̓̀͘ͅȎ̴̝͌̑̂̐́̽̊́̐̎̒́̈́̚Ẃ̵̡̹̰͖̪̰̟͈̫͕̟̓̋͝N̷̲̪̊̍͊̔̚ͅC̵̲̮̟̬͈̹̺̖̀̓̐́̈́͆͊͆̾̓̚͝Ǐ̸̭̏́́͂̃̀́̅̉̽̃̄́͠L̴̹̳̜̥̰̺̭̦͔̭̮͓̓́̉͂̅͗͒̓̓͘̚͠ ̵̛̛̛͕̒͋̇̎̒͗̆͒̆̄́̚I̷̢̖͚̜̬͇̮͉̖̮͚̩͈̙͐̒̑̇̉̈́̋̀̊̾̓͑̚S̸͖͖̜̅̇͒̈́̽̌̂̆Ň̵̩̤̤͍͓͆̉̆̊͂̋̏Ṭ̶̢̣̫͖͕̼̣͉͚̩̟̱͔̀̂͒͛̋̔ ̵̧̲̪̙̦̀R̸̥̯̰̻̼̱̦͎̖͔̈͜E̷̙̙͖͛Ǡ̷͙̼̘͍̥̜̘͎̫̱̹͚͑̑̍L̸̡̡͙̜̥̺̞̔̌̈́͆̑̕͝͠͠`);
        }

        setTimeout(() => recentClowncilWarnings -= 1, 1000 * 60 * 30);

        return;
    }
}