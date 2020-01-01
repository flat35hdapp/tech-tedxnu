/*global process*/
require('dotenv').config();
const qs = require('qs');
const axios = require('axios');
const mongo = require('../mongodb/slack.js');
const moment = require("moment");

const api_url = 'https://slack.com/api';
const slack_bot_token = process.env.SLACK_BOT_TOKEN;

const updateView = async (user) => {
  let header_blocks = [
    {
      type:'section',
      text:{
        type:'mrkdwn',
        text:"*Welcome!* \nThis is a home for attendance/absence app. You can create and answer mtg request."
      },
      accessory:{
        type: "button",
        action_id: "add_mtg",
        text: {
          type: "plain_text",
          text: "Make MTG",
          emoji: true
        }
      }
    },
    {
      type: "context",
      elements: [
        {
          type: "mrkdwn",
          text: ":wave: Hey, this app is in development. plz feed back to #20-team-tech-apps."
        }
      ]
    },
    {
      type: 'divider'
    },
  ];

  //mongodbにクエリでslackのユーザーIDが含まれているチームやミーティングの情報を取ってきて、配列に格納する処理。
  const user_obj = mongo.find({sl_u_id:user},user)[0];

  const attend_mtg_id_list = user_obj.att_m_id;
  const absence_mtg_id_list = user_obj.abs_m_id;
  const unanswered_mtg_id_list = user_obj.una_m_id;

  const attend_mtg_obj_list = mongo.find(attend_mtg_id_list.map(id=>{return {"m_id":id};}));
  const absence_mtg_obj_list = mongo.find(absence_mtg_id_list.map(id=>{return {"m_id":id};}));
  const unanswered_mtg_obj_list = mongo.find(unanswered_mtg_id_list.map(id=>{return {"m_id":id};}));

  const mtg_obj_convert_section = (mtg_obj,attendance) => {//一つのミーティングオブジェクトを受け入れて、一つのミーティングセクションを返すだけの関数。
    const {mtg_id,mtg_name,mtg_date,mtg_start_time,mtg_end_time,mtg_place,} = mtg_obj;
    if(attendance == "未回答"){
      return [
        {
          "type": "section",
          "text": {
            "type": "mrkdwn",
            "text": "*" + mtg_name + " " + mtg_date + "* \n" + mtg_start_time + "—" + mtg_end_time + " | " + mtg_place +"\nStatus: *" + attendance + "* "
          },
          "accessory": {
            "type": "overflow",
            "options": [
              {
                "text": {
                  "type": "plain_text",
                  "text": "Edit the agenda",
                  "emoji": true
                },
                "value": "edit_agenda"
              },
              {
                "text": {
                  "type": "plain_text",
                  "text": "Cansel this MTG",
                  "emoji": true
                },
                "value": "cancel_mtg"
              },
            ],
            "action_id": mtg_id
          }
        },
        {
          "type":"action",
          "elements":[
            {
              "type":"button",
              "text":{
                "type":"plain_text",
                "text":"出席"
              },
              "action_id":"",
              "value":"attend",
              "style":"primary"
            },
            {
              "type":"button",
              "text":{
                "type":"plain_text",
                "text":"欠席"
              },
              "action_id":"",
              "value":"absence",
              "style":"danger"
            },
            {
              "type":"button",
              "text":{
                "type":"plain_text",
                "text":"その他"
              },
              "action_id":"",
              "value":"other",
              "style":""
            },
            {
              "type":"button",
              "text":{
                "type":"plain_text",
                "text":"詳細"
              },
              "action_id":"",
              "value":"view_detail_of_mtg",
              "style":""
            }
          ],
          "block_id":"",
        }
      ];
    }else{
      return [
        {
          "type": "section",
          "text": {
            "type": "mrkdwn",
            "text": "*" + mtg_name + " " + mtg_date + "* \n" + mtg_start_time + "—" + mtg_end_time + " | " + mtg_place +"\nStatus: *" + attendance + "* "
          },
          "accessory": {
            "type": "overflow",
            "options": [
              {
                "text": {
                  "type": "plain_text",
                  "text": "Edit the agenda",
                  "emoji": true
                },
                "value": "edit_agenda"
              },
              {
                "text": {
                  "type": "plain_text",
                  "text": "Cansel this MTG",
                  "emoji": true,
                },
                "value": "cancel_mtg"
              },
              {
                "text": {
                  "type": "plain_text",
                  "text": "change attendance",
                  "emoji": true
                },
                "value": "change_attendance"
              }
            ],
            "confirm":{

            },
            "action_id": mtg_id
          }
        }
      ];
    }
  }

  const mtg_obj_list_convert_section_list = async (mtg_obj_list,attendance) => {//ミーティングオブジェクトの配列をセクションのリストに変換するだけの関数。
    const section_list = mtg_obj_list.map((obj)=>{
      return mtg_obj_convert_section(obj,attendance);
    });
    return section_list;
  }

  const mtg_list = Promise.all(
    [
      mtg_obj_list_convert_section_list(unanswered_mtg_obj_list,"未回答"),
      mtg_obj_list_convert_section_list(attend_mtg_obj_list,"出席"),
      mtg_obj_list_convert_section_list(absence_mtg_obj_list,"欠席")
    ]);

  const view = {
    type: 'home',
    title:{
      type:'plain_text',
      text:'att_abs_home'
    },
    blocks:header_blocks.push(mtg_list)
  };
  //return JSON.stringify(view);
  return JSON.stringify(view);
}

const displayHome = async (user) => {
  const args = {
    token: slack_bot_token,
    user_id: user,
    view: await updateView(user)
  };
  const result = await axios.post(`${api_url}/views.publish`,qs.stringify(args));
  return result;
  //axiosが不安定になったらrequestで実装するときに使う。
  /*const result = await axios({
    method: 'post',
    'Content-type': 'application/json',
    Authorization: 'Bearer '+ slack_bot_token,
    url: `${api_url}/views.publish`,
    data: args
  });*/
  /*const option = {
    url :`${api_url}/views.publish`,
    method:'POST',
    headers:{
      'Content-Type':'application/json',
      'Authorization': 'Bearer ' + slack_bot_token
    },
    json: true,
    body: JSON.stringify(args)
  };
  request(option ,(err,res,body)=>{
    console.log(body);
  });*/

}

const open_make_mtg_modal = async (trigger_id) => {
  const modal = {
    type: 'modal',
    title: {
      type: 'plain_text',
      text: 'Create a MTG'
    },
    submit: {
      type: 'plain_text',
      text: 'Create'
    },
    blocks: [
      {
        "type":"input",
        "label":{
          "type":"plain_text",
          "text":"Select teams"
        },
        "element":{//一個しか入らないことに注意。
          "type":"multi_static_select",
          "placeholder":{
            "type":"plain_text",
            "text":"参加するチームを選んでください。"
          },
          "action_id":"mtg_teams",//観測対象。
          "options":[
            {
              "text":{
                "type":"plain_text",
                "text":"All Member"
              },
              "value":"all"
            },
            {
              "text":{
                "type":"plain_text",
                "text":"Spaker Team"
              },
              "value":"spk"
            },
            {
              "text":{
                "type":"plain_text",
                "text":"Communication Team"
              },
              "value":"com"
            },
            {
              "text":{
                "type":"plain_text",
                "text":"Tech Team"
              },
              "value":"tec"
            },
            {
              "text":{
                "type":"plain_text",
                "text":"Leaders Team"
              },
              "value":"ldr"
            },
            {
              "text":{
                "type":"plain_text",
                "text":"Organize Team"
              },
              "value":"org"
            }
          ]
        },
        "block_id":"make_mtg_teams"
      },
      {
        "type":"input",
        "label":{
          "type":"plain_text",
          "text":"Select MTG date"
        },
        "element":{
          "type":"datepicker",
          "action_id":"mtg_date",
          "placeholder":{
            "type":"plain_text",
            "text":"ミーティングの日にちを入力"
          },
          "initial_date":moment().add(7,'days').format("YYYY-MM-DD")
        },
        "block_id":"make_mtg_date"
      },
      {
        "type":"input",
        "label":{
          "type":"plain_text",
          "text":"Enter start time."
        },
        "element":{
          "type":"plain_text_input",
          "action_id":"mtg_start_time",
          "placeholder":{
            "type":"plain_text",
            "text":"hh:mm"
          },
          "multiline":false
        },
        "block_id":"make_mtg_start_time"
      },
      {
        "type":"input",
        "label":{
          "type":"plain_text",
          "text":"Enter end time."
        },
        "element":{
          "type":"plain_text_input",
          "action_id":"mtg_end_time",
          "placeholder":{
            "type":"plain_text",
            "text":"hh:mm"
          },
          "multiline":false
        },
        "block_id":"make_mtg_end_time"
      },
      {
        "type":"input",
        "label":{
          "type":"plain_text",
          "text":"Enter mtg place."
        },
        "element":{
          "type":"plain_text_input",
          "action_id":"mtg_place",
          "initial_value":"名大文総",
          "multiline":false
        },
        "block_id":"make_mtg_place"
      },
      {
        "type":"input",
        "label":{
          "type":"plain_text",
          "text":"Enter ajenda."
        },
        "element":{
          "type":"plain_text_input",
          "action_id":"mtg_agenda",
          "placeholder":{
            "type":"plain_text",
            "text":"議題をカンマ(,)区切りで入力してください。"
          },
          "multiline":false
        },
        "block_id":"make_mtg_ajenda"
      }
    ]
  };
  const args = {
    token: slack_bot_token,
    trigger_id: trigger_id,
    view: JSON.stringify(modal)
  };

  const result = await axios.post(`${api_url}/views.open`, qs.stringify(args));
  return result;
}

const open_mtg_detail_modal = async (trigger_id) => {
  const mtg_obj = mongo.find({"_id":trigger_id});
  const {m_name,m_date,m_s_t,m_e_t,} = mtg_obj;
  const modal = {};
  const args = {
    token: slack_bot_token,
    trigger_id: trigger_id,
    view: JSON.stringify(modal)
  };
  const result = await axios.post(`${api_url}/views.open`, qs.stringify(args));
  return result;
}

module.exports = {displayHome,open_make_mtg_modal,open_mtg_detail_modal};
