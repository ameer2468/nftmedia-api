const supabase = require("./supabase");
const axios = require("axios");

exports.handler = async (event) => {
  const user_id = event.queryStringParameters.userId;
  let response = {};
  const data = async () => {
    return await axios
      .all([
        supabase
          .from("auth")
          .select("wallet, created_at, display_name, avatar_image_url, id")
          .eq("id", user_id),
        supabase
          .from("threads")
          .select("*", { count: "exact" })
          .eq("user_id", user_id),
        supabase
          .from("comments")
          .select("*", { count: "exact" })
          .eq("user_id", user_id),
        supabase
          .from("followers")
          .select("*", { count: "exact" })
          .eq("user_id", user_id),
        supabase
          .from("comments")
          .select("thread_title, thread_id, id")
          .eq("user_id", user_id),
        supabase.from("followers").select("*").eq("followed_by_id", user_id),
      ])
      .then(
        axios.spread(
          async (
            user,
            threadCount,
            commentCount,
            followCount,
            comments,
            followers
          ) => {
            const threadStats = threadCount.data.map(async (thread) => {
              return {
                ...thread,
                comment_count: await supabase
                  .from("comments")
                  .select("*", { count: "exact" })
                  .eq("thread_id", thread.id)
                  .then((res) => res.count),
                vote_count: await supabase
                  .from("votes")
                  .select("*")
                  .eq("thread_id", thread.id)
                  .then((res) =>
                    res.data.reduce((acc, curr) => acc + curr.dir, 0)
                  ),
              };
            });

            response = {
              statusCode: 200,
              headers: {
                "Content-Type": "application/json",
                "Access-Control-Allow-Origin": "*",
              },
              body: JSON.stringify({
                user: {
                  ...user.data[0],
                  postCount: threadCount.count + commentCount.count,
                  followerCount: followCount.count,
                  isFollowing: followers.data.length > 0,
                },
                comments: comments.data,
                threads: await Promise.all(threadStats).then((res) => {
                  return res;
                }),
              }),
            };
          }
        )
      )
      .catch((err) => {
        console.log(err);
        response = {
          statusCode: 400,
          response: err.message,
        };
      });
  };
  try {
    await data();
    return response;
  } catch (err) {
    console.log(err);
    return {
      statusCode: 500,
      body: JSON.stringify({
        error: err.message,
      }),
    };
  }
};
