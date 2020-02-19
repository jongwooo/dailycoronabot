const twit = require("twit");
const axios = require("axios");
const cheerio = require("cheerio");
const config = require("./config.js");

const client = new twit(config);

const getHTML = async () => {
  try {
    return await axios.get("http://ncov.mohw.go.kr/index_main.jsp");
  } catch (e) {
    console.error(e);
  }
};

getHTML()
  .then(html => {
    let countList = [];

    const $ = cheerio.load(html.data);
    const $bodyList = $("div.co_cur ul li").children("a.num");

    $bodyList.each(function(i) {
      countList[i] = $(this).text();
    });
    
    return countList;
  })
  .then(res => tweetPost(res));


const tweetPost = res => {
  const d = new Date();
  let content = `${d.getFullYear()}년 ${d.getMonth()}월 ${d.getDate()}일 ${d.getHours()}시 기준,\n대한민국의 코로나바이러스 현황\n\n[바이러스 확진환자수] ${
    res[0]
  }\n[확진환자 격리해제수] ${res[1]}\n[바이러스 검사진행수] ${res[2]}`;

  client.post("statuses/update", { status: content }, function(error, tweet, response) {
    if (!error) {
      console.log("tweet success: " + content);
    } else {
      console.log(error);
    }
  });
}
