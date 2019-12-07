const express = require('express');
export const router = express.Router();
const slackBotToken = process.env.SLACK_BOT_TOKEN;
const appHome = require('./slackTools/appHome');

router.post('/events',async (req,res) => {
  switch(req.body.type){
    case 'url_verification':{
      res.send({challenge: req.body.challenge});
      break;
    }
    case 'event_callback' :{
      const {type,user,channel,tab,text,subtype} = req.body.event;

      if(type==='app_home_opend'){
        appHome.displayHome(user);
      }
    }
  }

  if(type==='app_home_opend'){
    displayHome(user);
  }
})
