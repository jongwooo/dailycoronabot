const twit = require('twit')

const config = require('../config')
const client = new twit(config)

exports.tweetPost = tweet => {
  if (tweet) {
    client.post('statuses/update', { status: tweet }, error => {
      if (!error) {
        console.log(`tweet success: ${tweet}`)
      } else {
        console.error(`tweet failed: ${error}`)
      }
    })
  }
}
