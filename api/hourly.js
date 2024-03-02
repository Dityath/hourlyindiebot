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

const postTweet = async (tweetText) => {
  try {
    const tweet = await client.v2.tweet(tweetText);
    return tweet;
  } catch (error) {
    console.error(`Failed to post tweet: ${error}`);
    return null;
  }
};

const getRandomSong = async () => {
  try {
    const { data } = await supabase
      .from("songs")
      .select("*")
      .is("validated", "true")
      .is("posted", "false")
      .limit(10);

    if (!data || data.length === 0) {
      console.error("No data found.");
      return null;
    }

    const randomIndex = Math.floor(Math.random() * data.length);
    return data[randomIndex];
  } catch (error) {
    console.error("Error fetching songs:", error);
    return [];
  }
};

const postHourlyRecommendation = async (req, res) => {
  try {
    const randomSong = await getRandomSong();

    if (!randomSong) {
      console.error("No valid song data found.");
      res.status(500).json({ error: "No valid song data found." });
      return;
    }

    const tweetText = `Your #hourlyindie recommendation:\n${
      randomSong.name
    } by ${randomSong.artist}\n\n${
      randomSong.artist_username ? `${randomSong.artist_username} ` : ""
    }${randomSong.genre
      .split(", ")
      .map((genreId) => `#${genreId.replace(/\s/g, "")}`)
      .join(" ")}\n\n${randomSong.link}`;

    const tweet = await postTweet(tweetText);

    if (tweet) {
      await supabase
        .from("songs")
        .update({ posted: true, post_id: tweet.data.id })
        .eq("id", randomSong.id)
        .select();

      res.status(200).json({ tweetId: tweet.data.id });
    }
  } catch (error) {
    console.error("Error posting tweet or updating Supabase:", error);
    res.status(500).json({ error: "Error posting tweet or updating Supabase" });
  }
};

module.exports = postHourlyRecommendation;
