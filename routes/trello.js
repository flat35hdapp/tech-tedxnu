const require('request');
const api_key = process.env.TRELLO_API_KEY;
const api_token = process.env.TRELLO_API_TOKEN;

//初期設定欄
const id_card_source = '';//コピー元のURL
const keep_from_source = 'desc,checklists'


const mtgCard = async (cardObj) => {
  const {} = cardObj;
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
  };
  request.(option, (err,res,body) => {
    if(err)throw new Error(err);
    console.log(body);
  })
}

module.exports = {mtgCard};
