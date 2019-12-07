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
      break;
    }
    default : {res.sendStatus(404);}
  }

  if(type==='app_home_opend'){
    displayHome(user);
  }
})

router.post('/actions',async(req,res) => {
  const {token,trigger_id,user,actions,type } = JSON.parse(req.body.payload);
})
