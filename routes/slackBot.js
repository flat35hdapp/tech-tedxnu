const express = require('express');
const router = express.Router();
const appHome = require('./slackTools/appHome');
require('dotenv').config();

const slackBotToken = process.env.SLACK_BOT_TOKEN;

router.post('/events',async (req,res,next) => {
  //console.log("events");
  console.log(req.body);
  switch(req.body.type){
    case 'url_verification':{
      res.send({challenge: req.body.challenge});
      break;
    }
    case 'event_callback' :{
      const {type,user,channel,tab,text,subtype} = req.body.event;
      if(type==='app_home_opened'){
        console.log('app_home_opend');
        //console.log(typeof req.body.event);
        appHome.displayHome(user);
        res.sendStatus(200);
      }
      break;
    }
    default : {res.sendStatus(404);}
  }
})

router.post('/actions',async(req,res,next) => {
  const {token,trigger_id,user,actions,type,view} = JSON.parse(req.body.payload);//なぜかpayloadがオブジェクトではなく文字列で渡されるため処理している。
  //console.log("actions");
  //console.log(req.body.payload);

  switch (type) {
    case 'block_actions':{
      switch(actions[0].action_id){
        case 'add_mtg': {
          appHome.openModal(trigger_id);
          res.sendStatus(200);
          break;
        }
        case '': {
          break;
        }
        default : {
          console.log(req.body);
          res.sendStatus(404);
        }
      }
      break;
    }

    case 'view_submission':{

      console.log(view.state.values);
      console.log("中に入った。");
      res.send("");
      break;
    }

    default:{}

  }

})

module.exports = {router};
