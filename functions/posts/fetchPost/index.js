const supabase = require("./supabase");

exports.handler = async (event) => {
  const postId = event.queryStringParameters.postid;
  const userId = event.queryStringParameters.userid;
  let response = {};
  await Promise.all([
    supabase.from("threads").select("*").eq("id", postId),
    supabase
      .from("comments")
      .select("*", { count: "exact" })
      .eq("thread_id", postId),
    supabase
      .from("votes")
      .select("*")
      .eq("thread_id", postId)
      .eq("user_id", userId),
    supabase.from("votes").select("*").eq("thread_id", postId),
    supabase.from("auth").select("avatar_url").eq("id", userId),
  ])
    .then(([thread, comments, didUserVote, addVotes, avatar_url]) => {
      const countVotes = addVotes.data.reduce((acc, vote) => {
        return acc + vote.dir;
      }, 0);
      const didUserVoteForThisPost =
        didUserVote.data.length > 0
          ? { dir: didUserVote.data[0].dir, id: didUserVote.data[0].id }
          : { dir: null, id: null };
      response = {
        statusCode: 200,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
        },
        body: JSON.stringify({
          thread: {
            ...thread.data[0],
            user_image_url: avatar_url.data[0].avatar_url,
            vote_count: countVotes,
            comment_count: comments.count,
            didUserVote: didUserVoteForThisPost,
          },
          comments: [...comments.data],
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
