import axios from "axios";
import * as core from '@actions/core'
import {CustomField, Task} from './types'

export default async function run(): Promise<void> {
    try {
        let failed = false
        const token: string = core.getInput('clickup_token')
        const task_ids: string[] = core.getMultilineInput('clickup_custom_task_ids')
        const team_id: string = core.getInput('clickup_team_id')
        const custom_field_label: string = core.getInput('custom_field_label')
        const value: string = core.getInput('custom_field_value')

        for (const task_id of task_ids) {
            try {
                let task = await getTask(task_id, team_id, token)
                let custom_fields = await getCustomFieldsForList(task.list.id, token)
                let matches: CustomField[] = custom_fields.filter(custom_field => custom_field.name == custom_field_label)
                if (matches.length == 0) {
                    core.warning(`Custom field ${custom_field_label} is not available for ${task_id}`)
                    continue
                }
                let custom_field: CustomField = matches[0]

                await updateCustomField(task_id, team_id, custom_field, token, value)
            } catch (error) {
                failed = true
                core.info(`${task_id} error: ${error.message}`)
                core.debug(`Error output for ${task_id}`)
                core.debug(JSON.stringify(error))
            }
        }

        if (failed) {
            throw 'One of the API requests has failed. Please check the logs for more details.'
        }

    } catch (error) {
        core.setFailed(`Action failed: ${error}`)
    }
}

async function getTask(task_id: string, team_id: string, token: string): Promise<Task> {
    const endpoint = `https://api.clickup.com/api/v2/task/${task_id}/?custom_task_ids=true&team_id=${team_id}`
    const result = await axios.get(endpoint, {
        headers: {
            'Content-Type': 'application/json',
            'Authorization': token
        }
    })
    core.debug(`GET request for ${task_id} output:`)
    core.debug(JSON.stringify(result.data))

    return result.data;
}

async function getCustomFieldsForList(list_id: string, token: string): Promise<CustomField[]> {
    const endpoint = `https://api.clickup.com/api/v2/list/${list_id}/field`
    const result = await axios.get(endpoint, {
        headers: {
            'Content-Type': 'application/json',
            'Authorization': token
        }
    })
    core.debug(`GET request for list ${list_id} output:`)
    core.debug(JSON.stringify(result.data))

    return result.data.fields ?? {}
}

async function updateCustomField(task_id: string, team_id: string, custom_field: CustomField, token: string, value: string): Promise<void> {
    const endpoint = `https://api.clickup.com/api/v2/task/${task_id}/field/${custom_field.id}/?custom_task_ids=true&team_id=${team_id}`
    const body = {
        'value': value
    }
    await axios.post(endpoint, body, {
        headers: {
            'Content-Type': 'application/json',
            'Authorization': token
        }
    }).then((response) => {
        core.debug(`POST request for custom field ${custom_field.id} output:`)
        core.debug(JSON.stringify(response.data))
        core.info(`${task_id}: Succesfully updated field ${custom_field.name} with ID ${custom_field.id} to ${value}`)
    })
}
