const supabase = require("./supabase");
const axios = require("axios");

exports.handler = async (event) => {
 let response = {};
 const display_name = event.queryStringParameters.display_name;
 const capitalFirstLetter = display_name.charAt(0).toUpperCase() + display_name.slice(1);
 const {data, error} = await supabase.from('chats').select('*');
 const updateData = data.map((chat) => {
return {...chat, users: JSON.parse(chat.users)}
 });
  const filterDataToUser = updateData.filter((chat) => {
return chat.users.some((user) => user === capitalFirstLetter);
  });
  if (error) {
    response = {
      statusCode: 500,
      body: JSON.stringify(error),
    };
  } else {
    response = {
      statusCode: 200,
      body: JSON.stringify(filterDataToUser),
    };
  }
  return response;
};
