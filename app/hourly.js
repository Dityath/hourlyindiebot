const { TwitterApi } = require("twitter-api-v2");
const { createClient } = require("@supabase/supabase-js");
const dotenv = require("dotenv");

dotenv.config();

const client = new TwitterApi({
  appKey: process.env.TWITTER_APP_KEY,
  appSecret: process.env.TWITTER_APP_SECRET,
  accessToken: process.env.TWITTER_ACCESS_TOKEN,
  accessSecret: process.env.TWITTER_ACCESS_SECRET,
});

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function postTweet(tweetText) {
  try {
    const tweet = await client.v2.tweet(tweetText);
    return tweet;
  } catch (error) {
    console.error(`failed to post tweet: ${error}`);
  }
}

async function getRandomSongs() {
  try {
    const { data } = await supabase
      .from("songs")
      .select("*")
      .is("validated", "true")
      .is("posted", "false");

    const randomizer = Math.floor(Math.random() * data.length);

    return data[randomizer];
  } catch (error) {
    console.error(error);
    return null;
  }
}

async function hourly() {
  const result = await getRandomSongs();
  if (result) {
    postTweet(
      `your #hourlyindie recommendation\n${result.name} by ${
        result.artist
      }\n\n${
        result.artist_username ? `${result.artist_username} ` : " "
      }${result.genre
        .split(", ")
        .map((genreid) => `#${genreid.replace(/\s/g, "")}`)
        .join(" ")}\n\n${result.link}`
    )
      .then((tweet) => {
        return supabase
          .from("songs")
          .update({ posted: "TRUE", post_id: `${tweet.data.id}` })
          .eq("id", result.id)
          .select();
      })
      .catch((error) => {
        console.error("Error updating Supabase:", error);
      });
  } else {
    console.error("No data found.");
  }
}

module.exports = hourly;
