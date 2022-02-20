const axios = require('axios')
const cheerio = require('cheerio')
const moment = require('moment')
require('moment-timezone')

const { tweetPost } = require('./api')

const { URL_SECRET } = process.env

const getHTML = async () => {
  try {
    return await axios.get(URL_SECRET)
  } catch (error) {
    console.error(`async failed: ${error}`)
  }
}

getHTML()
  .then(html => {
    try {
      const $ = cheerio.load(html.data)
      const $getCoronaInfo = $('div.occurrenceStatus table.ds_table tbody tr td span')
      const $getTime = $('div.occurrenceStatus h2 span.livedate')

      const todaysDeath = $getCoronaInfo.eq(0).text()
      const todaysSeverePatient = $getCoronaInfo.eq(1).text()
      const todaysNormalPatient = $getCoronaInfo.eq(2).text()
      const todaysCases = $getCoronaInfo.eq(3).text()

      moment.tz.setDefault('Asia/Seoul')
      const date = moment().format('M월 DD일 HH시')

      const rawTime = $getTime.text()
      const startIndex = rawTime.indexOf('(') + 1
      const lastIndex = rawTime.indexOf(',', startIndex)

      let structuredTime = rawTime
        .substring(startIndex, lastIndex)
        .replace('.', '월 ')
        .replace('.', '일')

      return `${date} (${structuredTime}),\n대한민국의 코로나바이러스 현황\n\n[오늘 사망자] ${todaysDeath} 명\n[재원 위중증] ${todaysSeverePatient} 명\n[신규 입원자] ${todaysNormalPatient} 명\n[오늘 확진자] ${todaysCases} 명\n\n#코로나바이러스감염증 #국내확진자`
    } catch (error) {
      console.error(`crawling failed: ${error}`)
      return null
    }
  })
  .then(content => tweetPost(content))
