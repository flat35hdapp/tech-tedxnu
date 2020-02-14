/*global process*/
const express = require('express');
const router = express.Router();
const appHome = require('./slackTools/appHome');
const modalActionHub = require('./slackTools/modalActionHub');
const modalMakeHub = require('./slackTools/modalMakeHub');
require('dotenv').config();

router.post('/events',async (req,res) => {
  console.log("events");
  console.log(req.body);
  switch(req.body.type){
    case 'url_verification':{
      res.send({challenge: req.body.challenge});
      break;
    }
    case 'event_callback' :{
      const {type,user} = req.body.event;//channel,tab,text,subtypeもあるよ
      switch (type) {
        case "app_home_opened":
        console.log('app_home_opend');
        //console.log(typeof req.body.event);
        appHome.displayHome(user);
        res.sendStatus(200);
          break;
        case "app_mention":
        console.log("app_mention");
        res.sendStatus(200);
          break;
      }
      break;
    }
    default : {res.sendStatus(404);}
  }
})

router.post('/actions',async(req,res) => {
  const payload = JSON.parse(req.body.payload);//なぜかpayloadがオブジェクトではなく文字列で渡されるため処理している。
  const {token,trigger_id,actions,type,view,user} = payload;//userもあるよ
  //console.log("actions");
  console.log(req.body.payload);
  if(token == process.env.SLACK_EVENT_TOKEN){
    switch (type) {
      case 'block_actions':{
        switch(actions[0].action_id){
          case 'add_mtg': {
            appHome.open_make_mtg_modal(trigger_id);
            res.sendStatus(200);
            break;
          }
          case 'sign_up': {
            appHome.open_sign_up_modal(trigger_id);
            res.sendStatus(200);
            break;
          }
          case 'add_team':{
            try{
              modalMakeHub.open_add_team_modal(trigger_id);
            }catch(e){
              console.error(e);
            }
            res.sendStatus(200);
            break;
          }
          case "set_env":{
            modalMakeHub.open_setting_modal(trigger_id);
            res.sendStatus(200);
            break;
          }
          default : {
            console.log("irregular block_actions requested\naction_id : "+ actions[0].action_id);
            res.sendStatus(404);
          }
        }
        break;
      }
      case 'view_submission':{
        console.log(req.body);
        console.log(view.state.values)
        switch (view.callback_id) {
          case "make_mtg":{
            modalActionHub.make_mtg(view.state.values);
            res.send("");
            break;
          }
          case "sign_up":{
            modalActionHub.sign_up(payload);
            res.send("");
            break;
          }
          case "add_team":{
            modalActionHub.add_team(user.id,view.state.values);
            res.send("");
            break;
          }
          default:
          console.log("irregular view_submission requested\ncallback_id: "+view.callback_id);
          res.sendStatus(404);
        }

        break;
      }

    }
  }else{
    console.log(token);
  }
})

module.exports = {router};
