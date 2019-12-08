const qs = require('qs');
const axios = require('axios');
require('dotenv').config();

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
    }
  ];
  const view = {
    type: 'home',
    title:{
      type:'plain_text',
      text:'well...'
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

};

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
      // Text input
      {
        "type": "input",
        "block_id": "note01",
        "label": {
          "type": "plain_text",
          "text": "Note"
        },
        "element": {
          "action_id": "content",
          "type": "plain_text_input",
          "placeholder": {
            "type": "plain_text",
            "text": "Take a note... \n(Text longer than 3000 characters will be truncated!)"
          },
          "multiline": true
        }
      },

      // Drop-down menu
      {
        "type": "input",
        "block_id": "note02",
        "label": {
          "type": "plain_text",
          "text": "Color",
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

      }
    ]
  };
  const args = {
    token: slackBotToken,
    trigger_id: trigger_id,
    view: JSON.stringify(modal)
  };

  const result = await axios.post(`${apiUrl}/views.open`, qs.stringify(args));
}
module.exports = {displayHome,openModal};
