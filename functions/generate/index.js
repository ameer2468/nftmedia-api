const jwt = require('jsonwebtoken');


exports.handler = async (event) => {
    let body = JSON.parse(event.body);
    try {
        const {address, signature, nonce} = body;
        const generateToken = await jwt.sign({address, nonce, signature}, process.env.JWT_SECRET);
        return {
            statusCode: 200,
            headers: {
                "Content-Type": "application/json",
                'Access-Control-Allow-Origin': '*'
            },
            body: JSON.stringify({token: generateToken}),
            isBase64Encoded: false
        }
    } catch (err) {
        return {
            statusCode: 400,
            body: err.message
        }
    }
}
