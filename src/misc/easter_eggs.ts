import { Message } from 'discord.js';
import { EMBED_ERROR_COLOR, sendReply } from '../utils';

const clowncilWarnings: { [userId: string]: number } = {};
let recentClowncilWarnings = 0;

export async function easterEggHandler(message: Message<boolean>) {
    if (message.content.toLowerCase().includes('shadow clowncil')) {
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
        }

        setTimeout(() => recentClowncilWarnings -= 1, 1000 * 60 * 30);

        return;
    }
}