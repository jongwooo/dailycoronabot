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
			let comparedList = [];
			let timeList = [];

			const $ = cheerio.load(html.data);
			const $countList = $("ul.liveNum li").children("span.num");
			const $comparedList = $("ul.liveNum li").children("span.before");
			const $timeList = $("div.live_left h2 a").children("span.livedate");

			moment.tz.setDefault("Asia/Seoul");
			const date = moment().format("M월 DD일 HH시");

			$timeList.each(function(i) {
				timeList[i] = $(this).text();
			});

			let t = timeList[0];
			let ts = t.indexOf("(") + 1;
			let time = t
				.substring(ts, t.indexOf(",", ts))
				.replace(".", "월 ")
				.replace(".", "일");

			$countList.each(function(j) {
				let countListContent = $(this).text();

				if (countListContent.includes("(누적)")) {
					countListContent = countListContent.replace("(누적)", "");
				}

				countList[j] = `${countListContent} 명`;
			});

			$comparedList.each(function(k) {
				let comparedListContent = $(this).text();

				if (comparedListContent.includes("전일대비 ")) {
					comparedListContent = comparedListContent.replace("전일대비 ", "");
				}

				comparedList[k] = `${comparedListContent}`;
			});

			let content = `${date}(${time}),\n대한민국의 코로나바이러스 현황\n\n[확진환자] ${countList[0]}${comparedList[0]}\n[격리해제] ${countList[1]}${comparedList[1]}\n[격리진행] ${countList[2]}${comparedList[2]}\n[사망자수] ${countList[3]}${comparedList[3]}\n\n#괄호_안_숫자는_전일대비_증감수치\n#코로나바이러스감염증 #국내확진자\n#힘내라_대한민국 #응원해요_의료진`;

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
