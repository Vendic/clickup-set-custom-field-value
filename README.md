# Clickup set custom field value action [![Tests](https://github.com/Vendic/clickup-set-custom-field-value/actions/workflows/tests.yml/badge.svg)](https://github.com/Vendic/clickup-set-custom-field-value/actions/workflows/tests.yml)
Github action to set a custom field in Clickup.

### Usage
```yml
name: Set custom field in Clickup

on: [ push ]

jobs:
    custom_field:
        name: Set clickup custom field
        runs-on: ubuntu-latest
        steps:
            -   name: Get clickup team ID
                env:
                    clickup_token: ${{ secrets.CLICKUP_TOKEN }}
                run: |
                    TEAM_ID=$(curl --location --request GET 'https://api.clickup.com/api/v2/team' --header "Authorization: $clickup_token" --header 'Content-Type: application/json' | jq -r "(.teams | first).id")
                    echo "TEAM_ID=${TEAM_ID}" >> $GITHUB_ENV

            -   name: Set clickup custom field
                uses: Vendic/clickup-set-custom-field-value@develop
                with:
                    clickup_token: ${{ secrets.CLICKUP_TOKEN }}
                    clickup_custom_task_ids: |
                        ABC-123
                    clickup_team_id: ${{ env.TEAM_ID }}
                    custom_field_label: Your custom field
                    custom_field_value: "http://www.vendic.nl/"
```
