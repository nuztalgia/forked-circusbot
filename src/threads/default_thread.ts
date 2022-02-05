export function makeEmptyThread(): CircusThread {
    return {
        id: '',
        serverId: '',
        author: null, 
        authorId: null,
        messageId: '',
        title: '',
        description: '',
        channel: '',
        newChannel: null,
        enabled: true,
        visibility: 'public',
        threadId: null,
        autoAddRoles: [],
        archiveDays: 1,
        archiveDate: '',
        archiveTime: '',
        step: 'none',
    }
}