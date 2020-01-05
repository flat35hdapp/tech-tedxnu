/*global process*/
require("dotenv").config();
const qs = require('qs');
const axios = require('axios');
const api_url = 'https://slack.com/api';

const open_add_team_modal = async (trigger_id) => {
  const modal = {
    type: 'modal',
    callback_id:"add_team",
    title: {
      type: 'plain_text',
      text: 'Add team'
    },
    submit: {
      type: 'plain_text',
      text: 'add team'
    },
    blocks:[
      {
        "type":"input",
        "label":{
          "type":"plain_text",
          "text":"Enter team name."
        },
        "element":{
          "type":"plain_text_input",
          "action_id":"add_t_name",
          "placeholder":{
            "type":"plain_text",
            "text":"spkr"
          },
          "multiline":false
        },
        "block_id":"add_team_name"
      },
      {
        "type":"input",
        "label":{
          "type":"plain_text",
          "text":"Enter long team name."
        },
        "element":{
          "type":"plain_text_input",
          "action_id":"add_t_l_name",
          "placeholder":{
            "type":"plain_text",
            "text":"speaker"
          },
          "multiline":false
        },
        "block_id":"add_team_l_name"
      },
      {
        "type":"input",
        "label":{
          "type":"plain_text",
          "text":"Select members"
        },
        "element":{
          "type":"multi_users_select",
          "placeholder":{
            "type":"plain_text",
            "text":"hiroto ..."
          },
          "action_id":"add_team_member"
        },
        "block_id":"add_team_member"
      }
    ]
  }
  const args = {
    token: process.env.SLACK_BOT_TOKEN,
    trigger_id: trigger_id,
    view: JSON.stringify(modal)
  }
  const result = await axios.post(`${api_url}/views.open`, qs.stringify(args));
  return result;
}

exports.module = {open_add_team_modal};
