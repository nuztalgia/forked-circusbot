interface CircusThread {
    id: string;
    serverId: string;
    author: string?;
    authorId: string?;
    messageId: string?;
    title: string;
    description: string;
    channel: string;
    newChannel: string?;
    visibility: string;
    threadId: string?;
    enabled: boolean;
    autoAddRoles: string[];
    archiveDate: string?;
    archiveTime: string?;
    archiveDays: number;
    step: string;
}