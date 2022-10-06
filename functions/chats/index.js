const supabase = require("./supabase");
const axios = require("axios");

exports.handler = async (event) => {
  let response = {};
  const display_name = event.queryStringParameters.display_name;
  const capitalFirstLetter =
    display_name.charAt(0).toUpperCase() + display_name.slice(1);
  const { data, error } = await supabase.from("chats").select("*");
  const getChatLastMessage = async (chat) => {
    const { data } = await supabase
      .from("messages")
      .select("*")
      .eq("chat_id", chat.id)
      .order("created_at", { ascending: false })
      .limit(1);
    if (data.length > 0) {
      return {
        message: data[0].message || null,
        created_at: data[0].created_at || null,
      };
    } else {
      return {
        message: null,
        created_at: null,
      };
    }
  };
  const getUserImages = async (user) => {
    const request = await user.map(async (value) => {
      return {
        user: value,
        avatar_image_url: await supabase
          .from("auth")
          .select("avatar_image_url")
          .eq("display_name", value)
          .then((res) => {
            return res.data[0].avatar_image_url;
          }),
      };
    });
    return Promise.all(request);
  };
  const filterDataToUser = data
    .map((chat) => {
      return { ...chat, users: JSON.parse(chat.users) };
    })
    .filter((chat) => {
      return chat.users.some((user) => user === capitalFirstLetter);
    });
  const updateDataToUser = filterDataToUser.map(async (chat) => {
    return {
      ...chat,
      users: await getUserImages(chat.users),
      last_message: await getChatLastMessage(chat),
    };
  });
  const result = await Promise.all(updateDataToUser);

  if (error) {
    response = {
      statusCode: 500,
      body: error.response.data.message,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
    };
  } else {
    response = {
      statusCode: 200,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
      body: JSON.stringify(result),
    };
  }
  return response;
};
