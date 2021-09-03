import * as core from '@actions/core'
import * as fs from "fs";
import nock from "nock";
import {expect, test} from '@jest/globals'
import run from '../src/run'

test('Updates the custom field value Custom field ABC to Value DEF for task MAX-185', async () => {
    const infoSpy = jest.spyOn(core, 'info')
    const failedSpy = jest.spyOn(core, 'setFailed')
    const task_id: string = process.env['INPUT_CLICKUP_CUSTOM_TASK_IDS'] ?? ''
    const team_id: string = process.env['INPUT_CLICKUP_TEAM_ID'] ?? ''
    const custom_field_id = '12-34-56'
    process.env['INPUT_CUSTOM_FIELD_LABEL'] = 'Custom field ABC'

    mockApiEndpoints(task_id, custom_field_id, team_id);

    await run()

    const custom_field_label = process.env['INPUT_CUSTOM_FIELD_LABEL']
    const custom_field_value = process.env['INPUT_CUSTOM_FIELD_VALUE']
    expect(infoSpy).toHaveBeenCalledWith(`MAX-185: Succesfully updated field ${custom_field_label} with ID ${custom_field_id} to ${custom_field_value}`)
    expect(failedSpy).toHaveBeenCalledTimes(0)
})

test('Display a warning when it tries to update a non existing custom field', async () => {
    const warningSpy = jest.spyOn(core, 'warning')
    const failedSpy = jest.spyOn(core, 'setFailed')
    const infoSpy = jest.spyOn(core, 'info')

    const task_id: string = process.env['INPUT_CLICKUP_CUSTOM_TASK_IDS'] ?? ''
    const team_id: string = process.env['INPUT_CLICKUP_TEAM_ID'] ?? ''
    const custom_field_id = '12-34-56'
    process.env['INPUT_CUSTOM_FIELD_LABEL'] = 'Nonexisting'

    mockApiEndpoints(task_id, custom_field_id, team_id);

    await run()

    expect(warningSpy).toHaveBeenCalledTimes(1)
    expect(warningSpy).toHaveBeenCalledWith(`Custom field Nonexisting is not available for ${task_id}`)
    expect(failedSpy).toHaveBeenCalledTimes(0)
    expect(infoSpy).toHaveBeenCalledTimes(0)
})

function mockApiEndpoints(task_id: string, custom_field_id: string, team_id: string) {
    const taskReply = fs.readFileSync(__dirname + '/' + 'get_task_response.json', 'utf-8')
    nock('https://api.clickup.com')
        .persist()
        .get('/api/v2/task/MAX-185/?custom_task_ids=true&team_id=123')
        .reply(200, taskReply)

    const customFieldsReply = fs.readFileSync(__dirname + '/' + 'get_custom_fields_response.json', 'utf-8')
    nock('https://api.clickup.com')
        .persist()
        .get('/api/v2/list/99999/field')
        .reply(200, customFieldsReply)

    nock('https://api.clickup.com')
        .persist()
        .post(`/api/v2/task/${task_id}/field/${custom_field_id}/?custom_task_ids=true&team_id=${team_id}`)
        .reply(200)
}

beforeEach(() => {
    process.env['INPUT_CLICKUP_TOKEN'] = 'pk_123'
    process.env['INPUT_CLICKUP_CUSTOM_TASK_IDS'] = 'MAX-185'
    process.env['INPUT_CLICKUP_TEAM_ID'] = '123'
    process.env['INPUT_CUSTOM_FIELD_VALUE'] = 'Value DEF'
})
