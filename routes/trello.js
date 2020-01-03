/*global process*/
const request = require("request-promise");
const api_key = process.env.TRELLO_API_KEY;
const api_token = process.env.TRELLO_API_TOKEN;
const organization_id = process.env.TRELLO_ORGANIZATION_ID;

//初期設定欄
const id_card_source = '';//コピー元のURL
const keep_from_source = 'desc,checklists'

const mtgCard = async (cardObj) => {
  const {mtg_name,id_list,member_list,record_url} = cardObj;
  const option = {
    method: 'POST',
    url: 'https://api.trello.com/1/cards',
    qs: {
      name: mtg_name,
      pos: 'top',
      idList: id_list,
      idMembers: member_list,
      urlSource: record_url,
      idCardSource: id_card_source,
      keepFromSource: keep_from_source,
      key: api_key,
      token: api_token
    }
  };
  request(option, (err,res,body) => {
    if(err)throw new Error(err);
    console.log(body);
  });
};

const user_list = async (user_name)=>{
  var options = {
    method: 'GET',
    url: `https://api.trello.com/1/organizations/${organization_id}/actions`,
    qs: {key: api_key, token: api_token}
  };

  const result = await request(options);
}

module.exports = {mtgCard,user_list};
