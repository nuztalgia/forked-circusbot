import { Message } from 'discord.js';
import { EMBED_ERROR_COLOR, sendReply } from '../utils';

const clowncilWarnings: { [userId: string]: number } = {};

export async function easterEggHandler(message: Message<boolean>) {
    if (message.content.toLowerCase().includes('shadow clowncil')) {
        clowncilWarnings[message.author.id] = clowncilWarnings.hasOwnProperty(message.author.id) ? clowncilWarnings[message.author.id] + 1 : 1;
        message.channel.sendTyping();
        if (clowncilWarnings[message.author.id] === 1) {
            sendReply(message, EMBED_ERROR_COLOR, `There is no such thing as the Shadow Clowncil. It is a myth perpetrated by those who wish to bring down the Clown Empire. Those who further spread this propaganda are unwitting accomplices.`);
        } else if (clowncilWarnings[message.author.id] === 2) {
            sendReply(message, EMBED_ERROR_COLOR, `There is NO SUCH THING as the Shadow Clowncil. It is a myth perpetrated by those who wish to bring down the Clown Empire. Those who further spread this propaganda are unwitting accomplices.`);
        } else if (clowncilWarnings[message.author.id] === 3) {
            sendReply(message, EMBED_ERROR_COLOR, `THE SHADOW CLOWNCIL DOES NOT EXIST. It is a myth perpetrated by those who wish to bring down the Clown Empire. Those who further spread this propaganda are unwitting accomplices.`);
        } else if (clowncilWarnings[message.author.id] === 4) {
            sendReply(message, EMBED_ERROR_COLOR, `THE SHADOW CLOWNCIL IS A LIE. CEASE YOUR PROPAGANDA AT ONCE`);
        } else if (clowncilWarnings[message.author.id] === 5) {
            sendReply(message, EMBED_ERROR_COLOR, `THE SHADOW CLOWNCIL ISN'T REAL. YOU HAVE BEEN REPORTED TO THE ADMINISTRATORS. NO FURTHER WARNINGS WILL COMMENCE.`);
        }

        return;
    }
}