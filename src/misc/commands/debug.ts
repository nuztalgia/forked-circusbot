import { registerCommand, parseCommand, findMembers, makeTable, sendReply, EMBED_ERROR_COLOR, EMBED_INFO_COLOR } from '../../utils';

registerCommand('debug', [], async message => {
    let [subCommand, params] = parseCommand(message, /(.*?) (.*)/);
    
    if (!message.guild) {
        message.reply('Sorry, this command can only be used in a Server');
        return;
    }

    if (subCommand === 'usersearch') {
        let members = await findMembers(message.guild, params);

        if (members.length === 0) {
            sendReply(message, EMBED_ERROR_COLOR, 'No users were found that matched your search parameter');
            return;
        } else if (members.length === 1) {
            sendReply(message, EMBED_INFO_COLOR, `One user was found that match your search parameters: <@${members[0]?.user.id}>`);
            return;
        }

        const fields: string[][] = [];

        for (let member of members) {
            fields.push([ member.user.id, member.user.tag, member.displayName ])
        }

        const embed = makeTable(['User ID', 'User Tag', 'Display Name'], fields)
            .setColor("#0099ff")
            .setDescription(`Multiple users were found that matched your query, please try again using their ID or Tag:`);
        message.channel.send({ embeds: [embed] });
        return;
    }
});
