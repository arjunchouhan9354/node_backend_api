const { encryptResponse } = require("../library/encryptionUtils");

function responseEncryptionMiddleware(req, res, next) {
  // Check if the request comes from Postman
  const userAgent = req.get("User-Agent");
  if (userAgent && userAgent.includes("Postman")) {
    return next();
  }

  const originalSend = res.send;
  res.send = function (body) {
    try {
      // Parse the response body if it's a JSON string
      if (typeof body === "string") {
        body = JSON.parse(body);
      }

      // Encrypt only the `response` key if it exists
      if (body && body.response) {
        const encryptedData = encryptResponse(body.response);
        body.response = encryptedData;
      }

      // Send the modified response
      originalSend.call(this, JSON.stringify(body));
    } catch (error) {
      console.error("Encryption failed:", error);
      res.status(500).send({ error: "Failed to encrypt response" });
    }
  };

  next();
}

module.exports = responseEncryptionMiddleware;
