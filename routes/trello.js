const require('request');
const apiKey = process.env.TRELLO_API_KEY;
const apiToken = process.env.TRELLO_API_TOKEN;

//初期設定欄
const idCardSource = '';//コピー元のURL
const keepFromSource = 'desc,checklists'


const mtgCard = async (cardObj) => {
  const {} = cardObj;
  const option = {
    method: 'POST',
    url: 'https://api.trello.com/1/cards',
    qs: {
      name: mtgName,
      pos: 'top',
      idList: idList,
      idMembers: memberList,
      urlSource: recordUrl,
      idCardSource: idCardSource,
      keepFromSource: keepFromSource,
      key: apiKey,
      token: apiToken
  };
  request.(option, (err,res,body) => {
    if(err)throw new Error(err);
    console.log(body);
  })
}
