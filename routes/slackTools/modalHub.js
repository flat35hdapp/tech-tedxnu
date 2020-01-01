const mongo = require("../mongodb/slack.js");

const make_mtg = () => {
  mongo.insert({
    "m_name":m_name,
    "m_t":[],
    "m_date":"YYYY-MM-DD",
    "m_s_t":"hh:mm",
    "m_e_t":"hh:mm",
    "m_pl":"hogehoge",
    "m_age":[],
    "m_rec_u":"http://document.google.com/hogehoge",
    "m_tr_c": "http://trello.com/hogehoge",
    "half":[{"original_user_id":"hogehoge"}],
    "att": [],
    "abs":[],
    "unans":[],
  },"mtg");
}
module.exports = {make_mtg};
