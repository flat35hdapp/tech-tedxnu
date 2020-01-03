/*global process*/
const mongo = require("../mongodb/slack.js");
const moment = require("moment");
const qs = require('qs');
const axios = require('axios');
const trello = require('../trello.js');
const api_url = "https://slack.com/api";

const make_mtg = async (submit_obj) => {
  const m_date = submit_obj.make_mtg_date.mtg_date.selected_date;
  const m_place = submit_obj.make_mtg_place.mtg_place.value;
  const mtg_teams = submit_obj.make_mtg_teams.mtg_teams.selected_options;
  const m_s_t = submit_obj.make_mtg_start_time.mtg_start_time.value;
  const m_e_t = submit_obj.make_mtg_end_time.mtg_end_time.value;
  const mtg_agenda = submit_obj.make_mtg_ajenda.mtg_agenda.value;

  const m_age = mtg_agenda.split(",");
  const m_t = mtg_teams.map(obj=>obj.value);

  let m_name = "";
  for (var i = 0; i < mtg_teams.length; i++) {
    if(i == 0){
      m_name = mtg_teams[i].value;
    }else{
      m_name = m_name + " " + mtg_teams[i].value;
    }
  }
  //参加するメンバーの重複なしリスト。
  const potential_user_id = Array.from(new Set(m_t.map((t)=>{
    return mongo.find({"team":t},"team").member;
  })));

  mongo.insert({
    "m_name": moment(m_date).format('YYYYMMDD') + " "+ m_name,
    "m_t":m_t,
    "m_date":m_date,
    "m_s_t":m_s_t,
    "m_e_t":m_e_t,
    "m_pl":m_place,
    "m_age":m_age,
    "m_rec_u":"",
    "m_tr_c": "",
    "half":[],
    "att": [],
    "abs":[],
    "unans":[potential_user_id],
  },"mtg").then((result)=>{
    const mtg_id = result.insertedIds;
    potential_user_id.map((user_id)=>{
      mongo.update_list({"_id":mongo.id(user_id)},{"una_m_id":mtg_id},"user");
    });
  });
};

const sign_up = async (trigger_id) =>{
  const modal = {
    type: 'modal',
    title: {
      type: 'plain_text',
      text: 'Sign up tech-tedxnu'
    },
    submit: {
      type: 'plain_text',
      text: 'Sign Up!'
    },
    blocks:[
      {
        "type":"input",
        "label":{
          "type":"plain_text",
          "text":"Enter first name."
        },
        "element":{
          "type":"plain_text_input",
          "action_id":"sign_up_f_name",
          "placeholder":{
            "type":"plain_text",
            "text":"Ren"
          },
          "multiline":false
        },
        "block_id":"sign_up_first_name"
      },
      {
        "type":"input",
        "label":{
          "type":"plain_text",
          "text":"Enter last name."
        },
        "element":{
          "type":"plain_text_input",
          "action_id":"sign_up_l_name",
          "placeholder":{
            "type":"plain_text",
            "text":"Ueda"
          },
          "multiline":false
        },
        "block_id":"sign_up_last_name"
      },
      {
        "type":"input",
        "label":{
          "type":"plain_text",
          "text":"Enter email address."
        },
        "element":{
          "type":"plain_text_input",
          "action_id":"sign_up_email",
          "placeholder":{
            "type":"plain_text",
            "text":"uedaren.tedxnu@gmail.com"
          },
          "multiline":false
        },
        "block_id":"sign_up_email"
      },
      {
        "type":"input",
        "label":{
          "type":"plain_text",
          "text":"Select teams"
        },
        "element":{
          "type":"multi_static_select",
          "placeholder":{
            "type":"plain_text",
            "text":"所属チームを選択してください。"
          },
          "action_id":"sign_up_t",
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
        "block_id":"sign_up_teams"
      },
      {
        "type":"input",
        "label":{
          "type":"plain_text",
          "text":"Enter your trello user name."
        },
        "element":{
          "type":"plain_text_input",
          "action_id":"sign_up_trello_user_name",
          "placeholder":{
            "type":"plain_text",
            "text":"@user12345678"
          },
          "multiline":false
        },
        "block_id":"sign_up_trello"
      },
    ]
  };
  const args = {
    token: process.env.SLACK_BOT_TOKEN,
    trigger_id: trigger_id,
    view: JSON.stringify(modal)
  };
  const result = await axios.post(`${api_url}/views.open`, qs.stringify(args));
  const tre_result = trello.user_list(user);
  return result;
}

module.exports = {make_mtg,sign_up};
