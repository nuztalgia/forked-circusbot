import { checkPermissions, registerCommand } from '../../utils/commands';
import { sendMessage } from '../../utils/embeds';

registerCommand('thread_help', ['thelp'], message => {
    let helpMsg = '';

    if (checkPermissions('create_thread', message.channel)) {
        helpMsg += "🚙 `create_thread`\nBegin creating a new scheduled thread. You will be prompted for the thread parameters.\n**Example:** `!create_thread`\n\n";
    }    
    if (checkPermissions('list_threads', message.channel)) {
        helpMsg += "🚙 `list_threads`\nList all scheduled threads configured for the server.\n**Example:** `!list_threads`\n\n";
    }
    if (checkPermissions('edit_thread', message.channel)) {
        helpMsg += "📝 `edit_thread <THREAD_ID> <THREAD_FIELD> <NEW_VALUE>`\nEdit a field/option for an existing thread. Only one field can be edited at a time.\n**Example:** `!edit_thread 123456789 title Weekly Lockouts`\n\n";
    }
    if (checkPermissions('archive_thread', message.channel)) {
        helpMsg += "🚙 `archive_thread`\nArchive the target thread early. It will still be recreated as scheduled, or can be rebuilt manually using !rebuild_thread.\n**Example:** `!archive_thread 1234567890`\n\n";
    }
    if (checkPermissions('rebuild_thread', message.channel)) {
        helpMsg += "🛠️ `rebuild_thread`\nArchived any existing thread and create a new thread for the specified scheduled thread.\n**Example:** `!rebuild_thread 1234567890`\n\n";
    }
    
    if (!helpMsg) {
        sendMessage(message.channel, "There are no commands whitelisted for this channel");
        return;
    }

    sendMessage(message.channel, helpMsg);
});
