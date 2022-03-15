export function makeEmptyEvent(): CircusEvent {
    return {
        id: '',
        serverId: '',
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

            going: 99,
            tentative: 99,
            notgoing: 99,
        },
        signups: {
            tanks: {},
            healers: {},
            dps: {},
            tank_subs: {},
            healer_subs: {},
            dps_subs: {},

            going: {},
            tentative: {},
            notgoing: {},
        },
        template: 'swtor_raid',
        step: 'none',
        signup_status: 'closed',
        quick_create: false,
        open_signups_at: null,
        published_channels: {}
    };
}
