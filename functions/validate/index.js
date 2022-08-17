const jwt = require("jsonwebtoken");
const supabase = require("./supabase");

exports.handler = async (event) => {
  let body = JSON.parse(event.body);
  let user;
  const randomNonce = Math.floor(Math.random() * 1000000);
  try {
    const { wallet } = body;
    const token = event.headers["auth-token"];
    const validateToken = jwt.verify(token, process.env.JWT_SECRET);
    if (validateToken) {
      await supabase
        .from("auth")
        .update({ nonce: randomNonce })
        .eq("wallet", wallet)
        .then(async () => {
          await supabase
            .from("auth")
            .select("*")
            .eq("wallet", wallet)
            .then((res) => {
              user = res.data[0];
            });
        });
      return {
        statusCode: 200,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
          "auth-token": token,
        },
        body: JSON.stringify({
          status: "success",
          token: validateToken,
          expiresIn: 10,
          user: {
            ...user,
          },
        }),
      };
    } else {
      return {
        statusCode: 400,
        body: "Invalid token: authentication failed",
      };
    }
  } catch (err) {
    return {
      statusCode: 400,
      body: err.message,
    };
  }
};
