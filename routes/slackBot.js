const express = require('express');
export const router = express.Router();
const slackBotToken = process.env.SLACK_BOT_TOKEN;

const displayHome = async(user,data) => {
  const arg = {
    token: slackBotToken,
    user_id: user,
    view: await updataView(user)
  };
  const result = await axios.post('/view.publish',)
}

router.post('/events',async (req,res) => {
  const {type,user,channel,tab,text,subtype} = req.body.event;
  if(type==='app_home_opend'){
    displayHome(user);
  }
})
