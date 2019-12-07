const express = require('express');
const router = express.Router();
const appHome = require('./slackTools/appHome');
require('dotenv').config();

const slackBotToken = process.env.SLACK_BOT_TOKEN;

router.post('/events',async (req,res,next) => {
  console.log(req.body);
  switch(req.body.type){
    case 'url_verification':{
      res.send({challenge: req.body.challenge});
      break;
    }
    case 'event_callback' :{
      const {type,user,channel,tab,text,subtype} = req.body.event;

      if(type==='app_home_opened'){
        appHome.displayHome(user);
      }
      break;
    }
    default : {res.sendStatus(404);}
  }
})

router.post('/actions',async(req,res,next) => {
  const {token,trigger_id,user,actions,type } = JSON.parse(req.body.payload);
  next();
})

module.exports = {router};
