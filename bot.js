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
			const $ = cheerio.load(html.data);
			const $vaccinePercent = $("div.vaccine_list ul li.percent");
			const $countList = $("div.occurrenceStatus table.ds_table tbody tr td span").eq(3);
			const $timeList = $("div.occurrenceStatus h2 span.livedate");

			let firstVaccine = $vaccinePercent.eq(0).text();
			let secondVaccine = $vaccinePercent.eq(1).text();

			let countList = $countList.text();

			moment.tz.setDefault("Asia/Seoul");
			const date = moment().format("M월 DD일 HH시");

			let t = $timeList.text();
			let ts = t.indexOf("(") + 1;
			let time = t
				.substring(ts, t.indexOf(",", ts))
				.replace(".", "월 ")
				.replace(".", "일");

			let content = `${date} (${time}),\n대한민국의 코로나바이러스 현황\n\n[1차 접종] ${firstVaccine}\n[접종완료] ${secondVaccine}\n[일일확진] ${countList} 명\n\n#위드_코로나 #단계적_일상회복\n#코로나바이러스감염증 #국내확진자`;

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