require('dotenv').config();
const qs = require('qs');
const axios = require('axios');
const mongo = require('../mongodb/slack.js');

const apiUrl = 'https://slack.com/api';
const slackBotToken = process.env.SLACK_BOT_TOKEN;

const updataView = async (user) => {
  let blocks = [
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

  const mtgSection = (mtgObj) => {
    const {mtgId,mtgName,mtgDate,mtgStartTime,mtgEndTime,mtgPlace} = mtgObj;
    return {
      "type": "section",
      "text": {
        "type": "mrkdwn",
        "text": "*" + mtgName + " " + mtgDate + "* \n" + mtgStartTime + "—" + mtgEndTime + " | " + mtgPlace +"\nStatus: *" + "" + "* "
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
          "action_id": mtgId
        ]
      }
    };
  }

  for(let i = 0;i<array.length;i++){
    blocks.push(mtgSection());
  }

  const view = {
    type: 'home',
    title:{
      type:'plain_text',
      text:'att_abs_home'
    },
    blocks:blocks
  };
  //return JSON.stringify(view);
  return JSON.stringify(view);
}

const displayHome = async (user) => {
  const args = {
    token: slackBotToken,
    user_id: user,
    view: await updataView(user)
  };
  const result = await axios.post(`${apiUrl}/views.publish`,qs.stringify(args));

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
    Authorization: 'Bearer '+ slackBotToken,
    url: `${apiUrl}/views.publish`,
    data: args
  });*/
  /*const option = {
    url :`${apiUrl}/views.publish`,
    method:'POST',
    headers:{
      'Content-Type':'application/json',
      'Authorization': 'Bearer ' + slackBotToken
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
      // Drop-down menu
      {
        "type": "input",
        "block_id": "make_mtg_01",
        "label": {
          "type": "plain_text",
          "text": "team",
        },
        "element": {
          "type": "static_select",
          "action_id": "make_mtg_name",
          "options": [
            {
              "text": {
                "type": "plain_text",
                "text": "speaker"
              },
              "value": "speaker_mtg"
            },
            {
              "text": {
                "type": "plain_text",
                "text": "communication"
              },
              "value": "communication_mtg"
            },
            {
              "text": {
                "type": "plain_text",
                "text": "tech"
              },
              "value": "tech_mtg"
            },
            {
              "text": {
                "type": "plain_text",
                "text": "organize"
              },
              "value": "organize_mtg"
            },
            {
              "text": {
                "type": "plain_text",
                "text": "all"
              },
              "value": "all_mtg"
            },
            {
              "text": {
                "type": "plain_text",
                "text": "leaders"
              },
              "value": "leaders_mtg"
            },
          ]
        }
      },
      // Text input
      {
        "type": "input",
        "block_id": "make_mtg_02",
        "label": {
          "type": "plain_text",
          "text": "agenda"
        },
        "element": {
          "action_id": "content",
          "type": "plain_text_input",
          "placeholder": {
            "type": "plain_text",
            "text": "一つ目の議題"
          },
          "multiline": false
        },
        "element": {
          "action_id": "content",
          "type": "plain_text_input",
          "placeholder": {
            "type": "plain_text",
            "text": "二つ目の議題"
          },
          "multiline": false
        },
        "element": {
          "action_id": "content",
          "type": "plain_text_input",
          "placeholder": {
            "type": "plain_text",
            "text": "三つ目の議題"
          },
          "multiline": false
        }
      },
    ]
  };
  const args = {
    token: slackBotToken,
    trigger_id: trigger_id,
    view: JSON.stringify(modal)
  };

  const result = await axios.post(`${apiUrl}/views.open`, qs.stringify(args));
}

const openAgendaModal = async (trigger_id) => {

}
module.exports = {displayHome,openModal};
