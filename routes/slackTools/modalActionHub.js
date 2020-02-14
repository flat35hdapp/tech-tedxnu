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
    m_name = m_name + mtg_teams[i].value + " ";
  }
  //参加するメンバーの重複ありリスト
  const over_lapping_list = await Promise.all(m_t.map((t)=>{
    return mongo.find({"team":t},"team").member;
  }))
  console.log(over_lapping_list);

  //参加するメンバーの重複なしリスト。
  const potential_user_id = Array.from(new Set(over_lapping_list));

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
    console.log(result);
    const mtg_id = result.insertedIds["0"];
    console.log("mtg_id is "+mtg_id);
    potential_user_id.map(async (user_id)=>{
      const id = mongo.id(user_id);
      mongo.update_list({"_id":id},{"una_m_id":mtg_id},"user");
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
  console.log(exist);
  if(exist.length == 0){//過去にユーザー登録していた場合はinsertではなくupdateが行われる。
    console.log("ifの中。")
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

const add_team = async(user_id,submit_obj)=>{
  const obj = submit_obj;
  const t_name = obj.add_team_name.add_t_name.value,
        t_l_name = obj.add_team_l_name.add_t_l_name.value,
        member = obj.add_team_member.add_team_member.selected_users;
  let exist;
  try{
    exist = await mongo.find({"t_name":t_name},"team");
  }catch(e){
    console.error(e);
  }
  let result;
  if(exist.length>0){
    try{
      chat.postMessage(user_id,`チーム名：${t_name}は使用済みです。別のチーム名を選択してください。`);
    }catch(e){
      console.error(e);
    }
  }else{
    try{
      result = await mongo.insert({
        "t_name":t_name,
        "t_l_name":t_l_name,
        "t_mem":member
      },"team");
    }catch(e){
      console.error(e);
    }

  }
  return result;
};

module.exports = {make_mtg,sign_up,add_team};
