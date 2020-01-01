const mongo = require("../mongodb/slack.js");
const moment = require("moment");

const make_mtg = (submit_obj) => {
  const m_date = submit_obj.make_mtg_date.mtg_date.selected_date;
  const m_place = submit_obj.make_mtg_place.mtg_place.value;
  const mtg_teams = submit_obj.make_mtg_teams.mtg_teams.selected_options;
  const m_s_t = submit_obj.make_mtg_start_time.mtg_start_time.value;
  const m_e_t = submit_obj.make_mtg_end_time.mtg_end_time.value;
  const mtg_agenda = submit_obj.make_mtg_ajenda.mtg_agenda.value;

  const m_age = mtg_agenda.split(",");

  let m_name = "";
  for (var i = 0; i < mtg_teams.length; i++) {
    if(i == 0){
      m_name = mtg_teams[i].value;
      console.log("1");
      console.log(mtg_teams[i].value);
    }else{
      m_name = m_name + " " + mtg_teams[i].value;
      console.log(mtg_teams[i].value);
    }
  }
  console.log(m_name);

  mongo.insert({
    "m_name": moment(m_date).format('YYYYMMDD') + " "+ m_name,
    "m_t":mtg_teams.map(obj=>obj.value),
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
    "unans":[],
  },"mtg");
}
module.exports = {make_mtg};
