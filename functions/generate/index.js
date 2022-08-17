const jwt = require("jsonwebtoken");
const supabase = require("./supabase");

exports.handler = async (event) => {
  let body = JSON.parse(event.body);
  try {
    const { address, signature, nonce } = body;
    const generateToken = await jwt.sign(
      { address, nonce, signature },
      process.env.JWT_SECRET,
      {
        expiresIn: "10s",
      }
    );
    await supabase
      .from("auth")
      .update({ token: generateToken })
      .eq("wallet", address);
    return {
      statusCode: 200,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
      body: JSON.stringify({ token: generateToken }),
      isBase64Encoded: false,
    };
  } catch (err) {
    return {
      statusCode: 400,
      body: err.message,
    };
  }
};
