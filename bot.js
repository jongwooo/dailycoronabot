const config = require("./config.js");
const twit = require("twit");
const axios = require("axios");
const cheerio = require("cheerio");
const moment = require("moment");
require("moment-timezone");

const client = new twit(config);

const getHTML = async () => {
  try {
    return await axios.get("http://ncov.mohw.go.kr/bdBoardList.do");
  } catch (e) {
    console.error(e);
  }
};

getHTML()
  .then(html => {
    let countList = [];
    let timeList = [];

    const $ = cheerio.load(html.data);
    const $countList = $("ul.s_listin_dot").children("li");
    const $timeList = $("div.bvc_txt").children("p.s_descript");

    moment.tz.setDefault("Asia/Seoul");
    const date = moment().format("M월 DD일 HH시");

    $timeList.each(function(i) {
      timeList[i] = $(this).text();
    });

    let t = timeList[0];
    let ts = t.indexOf("(") + 1
    let time = t.substring(ts, t.indexOf(")", ts)).replace(".", "월 ")

    let c, cs = null;
    $countList.each(function(i) {
      c = $(this).text();
      cs = c.indexOf(")") + 1;
      countList[i] = c.substring(cs, c.indexOf("명", cs))
    });
    
    let content = `${date}(${time}),\n대한민국의 코로나바이러스 현황\n\n[바이러스 확진환자수]${countList[0]}명\n[확진환자 격리해제수]${countList[1]}명\n[바이러스 검사진행수]${countList[2]}명`;

    return content;
  })
  .then(res => tweetPost(res));

const tweetPost = res => {
  client.post("statuses/update", { status: content }, function(error, tweet, response) {
    if (!error) {
      console.log("tweet success: " + content);
    } else {
      console.log(error);
    }
  });
}
