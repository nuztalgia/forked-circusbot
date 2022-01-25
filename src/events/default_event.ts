export function makeEmptyEvent(): CircusEvent {
    return {
        id: null,
        author: null, 
        authorId: null,
        messageId: null,
        title: 'Untitled Event',
        description: null,
        date: null,
        time: null,
        role_requirements: {
            tank: null,
            healer: null,
            dps: null,
        },
        role_limits: {
            tank: 2,
            healer: 4,
            dps: 10,
        },
        signups: {
            tanks: {},
            healers: {},
            dps: {},
            tank_subs: {},
            healer_subs: {},
            dps_subs: {},
        },
        step: 'none',
        signup_status: 'closed',
        quick_create: false,
        open_signups_at: null,
        published_channels: {}
    };
}
