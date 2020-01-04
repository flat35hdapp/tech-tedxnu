const mongo = require("../mongodb/slack.js");
const moment = require("moment");
const trello = require('../trello.js');
const chat = require('./chat.js');


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

const sign_up = async (payload) =>{
  const submit_obj = payload.view.state.values;
  const f_name = submit_obj.sign_up_first_name.sign_up_f_name.value;
  const l_name = submit_obj.sign_up_last_name.sign_up_l_name.value;
  const mail = submit_obj.sign_up_email.sign_up_email.value;
  const t = submit_obj.sign_up_teams.sign_up_t.selected_options;
  const sl_u_id = payload.user.id;
  const tre_user_name = submit_obj.sign_up_trello.sign_up_trello_user_name.value;
  let tre_user_id;
  let result;

  const exist = await mongo.find({"sl_u_id":sl_u_id},"user");
  if(exist == []){//過去にユーザー登録していた場合はinsertではなくupdateが行われる。
    try{
      const trello_user = await trello.user_define(tre_user_name)
      tre_user_id = trello_user.id;//user_objが返ってくるから、そのIDを入れとく。
      result = await mongo.insert({
        "f_name":f_name,
        "l_name":l_name,
        "mail":mail,
        "t":t,
        "sl_u_id":sl_u_id,
        "tr_u_id":tre_user_id,
        "att_m_id":[],
        "abs_m_id":[],
        "una_m_id":[],
      },"user");
    }catch(e){
      console.error(e);
      const error_message = "sign in 失敗のお知らせ...\n入力したtrello user nameが間違っているか、TEDxNagoyaUのtrelloに参加していない可能性があります。試行錯誤しても改善されない場合は以下の内容をチームリーダーに連絡してください。\n - Error code : 404\n - Error message : "+e;
      await chat.postMessage(sl_u_id,error_message);
    }
  }else{
    try{
      tre_user_id = await trello.user_define(tre_user_name).id;//user_objが返ってくるから、そのIDを入れとく。
      result = await mongo.update({"sl_u_id":sl_u_id},{
        "f_name":f_name,
        "l_name":l_name,
        "mail":mail,
        "t":t,
        "sl_u_id":sl_u_id,
        "tr_u_id":tre_user_id,
      },"user");
    }catch(e){
      console.error(e);
      const error_message = "sign in 失敗のお知らせ...\n入力したtrello user nameが間違っているか、TEDxNagoyaUのtrelloに参加していない可能性があります。試行錯誤しても改善されない場合は以下の内容をチームリーダーに連絡してください。\n - Error code : 404\n - Error message : "+e;
      await chat.postMessage(sl_u_id,error_message);
    }
  }
  return result;
}

module.exports = {make_mtg,sign_up};
