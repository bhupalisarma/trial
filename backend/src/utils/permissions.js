
export const resources = {
    classroom: 'classroom',
    user: 'user',
    comment: 'comment'
}

const roles = {
    admin: "admin",
    mentor: "mentor",
    mentee: "mentee"
}

const permissions = {


    [roles.admin]: {
        [resources.classroom]: {
            create: false,
            read: true,
            update: false,
            delete: false
        },
        [resources.user]: {
            create: false,
            read: true,
            update: false,
            delete: false
        },
        [resources.classroom]: {
            create: false,
            read: true,
            update: false,
            delete: false
        }
    },

    [roles.mentee]: {
        [resources.classroom]: {
            create: false,
            read: true,
            update: false,
            delete: false
        },
        [resources.user]: {
            create: false,
            read: true,
            update: false,
            delete: false
        },
        [resources.classroom]: {
            create: false,
            read: true,
            update: false,
            delete: false
        }
    }
}