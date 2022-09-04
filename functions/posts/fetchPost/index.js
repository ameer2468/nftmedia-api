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
    supabase.from("auth").select("avatar_image_url").eq("id", userId),
  ])
    .then(async ([thread, comments, didUserVote, addVotes, avatar_url]) => {
      const countVotes = addVotes.data.reduce((acc, vote) => {
        return acc + vote.dir;
      }, 0);
      const post_comments = comments.data.map(async (value) => {
        return {
          ...value,
          avatar_image_url: await supabase
            .from("auth")
            .select("avatar_image_url")
            .eq("id", value.user_id)
            .then((res) => res.data[0].avatar_image_url),
        };
      });
      const getAvatarImage = await supabase
        .from("auth")
        .select("avatar_image_url")
        .eq("id", thread.data[0].user_id)
        .then((res) => {
          return res.data[0].avatar_image_url;
        });
      const avatar_image_url = (await getAvatarImage) || null;
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
            vote_count: countVotes,
            comment_count: comments.count,
            didUserVote: didUserVoteForThisPost,
            avatar_image_url,
          },
          comments: await Promise.all(post_comments),
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
