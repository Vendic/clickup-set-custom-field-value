"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const axios_1 = __importDefault(require("axios"));
const core = __importStar(require("@actions/core"));
async function run() {
    try {
        let failed = false;
        const token = core.getInput('clickup_token');
        const task_ids = core.getMultilineInput('clickup_custom_task_ids');
        const team_id = core.getInput('clickup_team_id');
        const custom_field_label = core.getInput('custom_field_label');
        const value = core.getInput('custom_field_value');
        for (const task_id of task_ids) {
            try {
                let task = await getTask(task_id, team_id, token);
                let custom_fields = await getCustomFieldsForList(task.list.id, token);
                let matches = custom_fields.filter(custom_field => custom_field.name == custom_field_label);
                if (matches.length == 0) {
                    core.warning(`Custom field ${custom_field_label} is not available for ${task_id}`);
                    continue;
                }
                let custom_field = matches[0];
                await updateCustomField(task_id, team_id, custom_field, token, value);
            }
            catch (error) {
                failed = true;
                core.warning(`${task_id} error: ${error.message}`);
                core.debug(`Error output for ${task_id}`);
                core.debug(JSON.stringify(error));
            }
        }
        if (failed) {
            throw 'One of the API requests has failed. Please check the logs for more details.';
        }
    }
    catch (error) {
        core.setFailed(`Action failed: ${error}`);
    }
}
exports.default = run;
async function getTask(task_id, team_id, token) {
    const endpoint = `https://api.clickup.com/api/v2/task/${task_id}/?custom_task_ids=true&team_id=${team_id}`;
    const result = await axios_1.default.get(endpoint, {
        headers: {
            'Content-Type': 'application/json',
            'Authorization': token
        }
    });
    core.debug(`GET request for ${task_id} output:`);
    core.debug(JSON.stringify(result.data));
    return result.data;
}
async function getCustomFieldsForList(list_id, token) {
    var _a;
    const endpoint = `https://api.clickup.com/api/v2/list/${list_id}/field`;
    const result = await axios_1.default.get(endpoint, {
        headers: {
            'Content-Type': 'application/json',
            'Authorization': token
        }
    });
    core.debug(`GET request for list ${list_id} output:`);
    core.debug(JSON.stringify(result.data));
    return (_a = result.data.fields) !== null && _a !== void 0 ? _a : {};
}
async function updateCustomField(task_id, team_id, custom_field, token, value) {
    const endpoint = `https://api.clickup.com/api/v2/task/${task_id}/field/${custom_field.id}/?custom_task_ids=true&team_id=${team_id}`;
    const body = {
        'value': value
    };
    await axios_1.default.post(endpoint, body, {
        headers: {
            'Content-Type': 'application/json',
            'Authorization': token
        }
    }).then((response) => {
        core.debug(`POST request for custom field ${custom_field.id} output:`);
        core.debug(JSON.stringify(response.data));
        core.info(`${task_id}: Succesfully updated field ${custom_field.name} with ID ${custom_field.id} to ${value}`);
    });
}
