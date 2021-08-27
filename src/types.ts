export type CustomField = {
    id: string,
    name: string,
    type: string
    date_created: string,
    hide_from_guests: boolean,
    required: boolean
}

export type Task = {
    id: string,
    custom_id : string,
    name : string,
    status: {
        id: string,
        status: string,
        color: string,
        orderindex: number,
        type: string
    },
    custom_fields: CustomField[]
    list: List
}

export type List = {
    id: string,
    name: string,
    access: boolean
}
