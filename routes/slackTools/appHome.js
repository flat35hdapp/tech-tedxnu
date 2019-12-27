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
  let mtg_blocks = []

  //mongodbにクエリでslackのユーザーIDが含まれているチームやミーティングの情報を取ってきて、配列に格納する処理。
  const user_obj = mongo.find_user_by_user(user)[0];

  const attend_mtg_id_list = user_obj.att_m_id;
  const absence_mtg_id_list = user_obj.abs_m_id;
  const unanswered_mtg_id_list = user_obj.una_m_id;

  const attend_mtg_obj_list = mongo.find_mtgs_by_mtgs(attend_mtg_id_list);
  const absence_mtg_obj_list = mongo.find_mtgs_by_mtgs(absence_mtg_id_list);
  const unanswered_mtg_obj_list = mongo.find_mtgs_by_mtgs(unanswered_mtg_id_list);

  const mtg_obj_convert_section = (mtg_obj,attendance) => {//一つのミーティングオブジェクトを受け入れて、一つのミーティングセクションを返すだけの関数。
    const {mtg_id,mtg_name,mtg_date,mtg_start_time,mtg_end_time,mtg_place,m_age,attend_list,absence_list,unanswered_list} = mtg_obj;
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

  const mtg_obj_list_convert_section_list = (mtg_obj_list,attendance) => {//ミーティングオブジェクトの配列をセクションのリストに変換するだけの関数。
    const section_list = [];
    return new Promise(()=>{
      for(let i = 0;i<mtg_obj_list.length;i++){
        section_list.push(mtg_obj_convert_section(mtg_obj_list[i],attendance));
      }
      resolve(section_list);
    });
  }

  const mtg_list = Promise.all(
    [
      mtg_obj_list_convert_section_list(unanswered_mtg_obj_list,"未回答"),
      mtg_obj_list_convert_section_list(attend_mtg_obj_list,"出席"),
      mtg_obj_list_convert_section_list(absence_mtg_obj_list,"欠席")
    ]).then((list)=>{
    return new Promise(()=>{
      for (var i = 0; i < list.length; i++) {
        mtg_blocks.push(list[i]);
      }
      resolve(mtg_blocks);
    })
  });

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

  try{
    if(result.data.error){
      console.log(result.data.error);
    }
  }catch(e){
    console.log(e);
  }
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

const openModal = async (trigger_id) => {
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
          "action_id":"hogehoge",//観測対象。
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
          "action_id":"hogehogehoge",
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
          "text":"Enter start time and end time."
        },
        "element":{
          "type":"plain_text_input",
          "action_id":"hogehogehogehoge",
          "placeholder":{
            "type":"plain_text",
            "text":"hh-mm,hh-mm"
          },
          "multiline":false
        },
        "block_id":"make_mtg_time"
      },
      {
        "type":"input",
        "label":{
          "type":"plain_text",
          "text":"Enter mtg place."
        },
        "element":{
          "type":"plain_text_input",
          "action_id":"hoge3",
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
          "action_id":"hoge1",
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
}

const openAgendaModal = async (trigger_id) => {

}

module.exports = {displayHome,openModal};
