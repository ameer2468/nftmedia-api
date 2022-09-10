const supabase = require("./supabase");
const axios = require("axios");

exports.handler = async (event) => {
 let response = {};
 const display_name = event.queryStringParameters.display_name;
 const {data, error} = await supabase.from('chats').select('*');
 const filterDataToUser = JSON.parse(data).filter((chat) => chat.users.find((user) => user.display_name === display_name));
  if (error) {
    response = {
      statusCode: 500,
      body: JSON.stringify(error),
    };
  } else {
    response = {
      statusCode: 200,
      body: JSON.stringify(data),
    };
  }
};
