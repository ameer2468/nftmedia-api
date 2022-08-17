const supabase = require("./supabase");
const axios = require('axios');


exports.handler = async (event) => {
    const user_id = event.queryStringParameters.userId;
     let response = {};
      await axios.all([
            supabase
                .from("auth")
                .select("wallet, created_at, display_name")
                .eq("id", user_id),
            supabase
                .from("threads")
                .select("*", { count: "exact" })
                .eq("user_id", user_id),
            supabase
                .from("comments")
                .select("*", { count: "exact" })
                .eq("user_id",user_id),
            supabase
                .from("followers")
                .select("*", { count: "exact" })
                .eq("user_id", user_id),
            supabase
                .from("comments")
                .select("thread_title, thread_id, id")
                .eq("user_id", user_id),
            supabase.from("threads").select("*").eq("user_id", user_id),
            supabase.from("followers").select("*").eq("followed_by_id", user_id),
        ]).then(axios.spread(async (user, threadCount, commentCount, followCount, comments, threads, followers) => {
            const threadStats = threads.data.map(async (thread) => {
                return {...thread,
                    comment_count: await supabase.from("comments").select("*", { count: "exact" }).eq("thread_id", thread.id).then(res => res.count),
                    vote_count: await supabase.from("votes").select("*").eq("thread_id", thread.id).then(res => res.data.reduce((acc, curr) => acc + curr.dir, 0)),
                };
            })
         const data = await Promise.all(threadStats).then(res => {
               return res;
         })

            response = {
                statusCode: 200,
                headers: {
                    "Content-Type": "application/json",
                    'Access-Control-Allow-Origin': '*'
                },
                body: JSON.stringify({
                    user: {
                        ...user.data[0],
                        postCount: threadCount.count + commentCount.count,
                        followerCount: followCount.count,
                        isFollowing: followers.data.length > 0,
                    },
                    comments: comments.data,
                    threads: data,
                }),
            }
        })).catch((err) => {
            response = {
                statusCode: 400,
                response: err.message
            }
        });
        return response;
}
