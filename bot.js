const config = require("./config.js");
const twit = require("twit");
const axios = require("axios");
const cheerio = require("cheerio");
const moment = require("moment");
require("moment-timezone");

const URL_SECRET = process.env.URL_SECRET;
const client = new twit(config);

const getHTML = async () => {
	try {
		return await axios.get(URL_SECRET);
	} catch (error) {
		console.error(`async failed: ${error}`);
	}
};

getHTML()
	.then(html => {
		try {
			let countList = [];
			let timeList = [];

			const $ = cheerio.load(html.data);
			const $countList = $("table.num tr").children("td.w_bold");
			const $timeList = $("div.bvc_txt").children("p.s_descript");

			moment.tz.setDefault("Asia/Seoul");
			const date = moment().format("M월 DD일 HH시");

			$timeList.each(function(i) {
				timeList[i] = $(this).text();
			});

			let t = timeList[0];
			let ts = t.indexOf("(") + 1;
			let time = t.substring(ts, t.indexOf(")", ts)).replace(".", "월 ");

			$countList.each(function(j) {
				countList[j] = $(this).text();
			});

			let content = `${date}(${time}),\n대한민국의 코로나바이러스 현황\n\n[바이러스 확진환자수] ${countList[0]}\n[확진환자 격리해제수] ${countList[1]}\n[국내확진자 사망자수] ${countList[2]}\n[바이러스 검사진행수] ${countList[3]}\n\n#코로나바이러스감염증 #국내확진자`;

			return content;
		} catch (error) {
			console.error(`crawling failed: ${error}`);
			return null;
		}
	})
	.then(content => tweetPost(content));

const tweetPost = content => {
	if (content) {
		client.post("statuses/update", { status: content }, error => {
			if (!error) {
				console.log(`tweet success: ${content}`);
			} else {
				console.error(`tweet failed: ${error}`);
			}
		});
	}
};
