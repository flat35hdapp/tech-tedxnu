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
        text:"*Welcome!* \nThis is a home for Stickers app. You can add small notes here!"
      },
      accessory:{
        type: "button",
        action_id: "add_note",
        text: {
          type: "plain_text",
          text: "Add a Stickie",
          emoji: true
        }
      }
    },
    {
      type: "context",
      elements: [
        {
          type: "mrkdwn",
          text: ":wave: Hey, my source code is on <https://glitch.com/edit/#!/apphome-demo-keep|glitch>!"
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

module.exports = {displayHome};
