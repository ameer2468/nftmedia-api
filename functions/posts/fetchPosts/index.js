const supabase = require("./supabase");

exports.handler = async () => {
  let response = {};
  const getCommentCount = async (threadid) => {
    return await supabase
      .from("comments")
      .select("*", { count: "exact" })
      .eq("thread_id", threadid)
      .then((res) => {
        return res.count;
      });
  };

  const getVoteCount = async (threadid) => {
    return await supabase
      .from("votes")
      .select("dir")
      .eq("thread_id", threadid)
      .then((votes) => {
        return votes.data.reduce((acc, vote) => {
          return acc + vote.dir;
        }, 0);
      });
  };

  const getUserImageUrls = async (userid) => {
    return await supabase
      .from("auth")
      .select("avatar_image_url")
      .eq("id", userid)
      .then((res) => {
        if (res.data.length > 0) {
          return res.data[0].avatar_image_url;
        } else {
          return null;
        }
      });
  };

  await supabase
    .from("threads")
    .select("*")
    .range(0, 10)
    .then(async (threads) => {
      const threadStats = threads.data.map(async (thread) => {
        return {
          ...thread,
          comment_count: await getCommentCount(thread.id),
          vote_count: await getVoteCount(thread.id),
          avatar_image_url: await getUserImageUrls(thread.user_id),
        };
      });
      return await Promise.all(threadStats);
    })
    .then((res) => {
      response = {
        statusCode: 200,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
        },
        body: JSON.stringify({
          threads: res,
        }),
      };
    })
    .catch((err) => {
      response = {
        statusCode: 400,
        response: err.response.data.message,
      };
    });
  return response;
};
