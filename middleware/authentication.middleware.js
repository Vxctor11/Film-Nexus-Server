import jwt from "jsonwebtoken";

export default async function isAuth(req, res, next) {
  try {
    //Checking for authorization property in request
    if (!req.headers.authorization) {
      return res
        .status(401)
        .json({ message: "No token was provided in headers" });
    }

    //Splitting and capturing the token in a variable
    const token = req.headers.authorization.split(" ")[1];

    //Confirming that the token was captured in the token variable
    if (!token) {
      return res
        .status(401)
        .json({ message: "No token was provided (after Bearer)" });
    }

    //Verifying that the token is valid, and then decoding it back into an object
    const verified = jwt.verify(token, process.env.TOKEN_SIGN_SECRET);

    //Assigning a custom req property called user and giving it the value of the object from the token
    req.user = verified.payload;

    next();
  } catch (error) {
    console.log("Error inside the isAuth middleware", error);

    //Checking for specific errors:

    //JWT not there or invalid
    if (error.message === "jwt malformed") {
      return res
        .status(401)
        .json({ message: "No token was provided (malformed)" });
    }

    //No Token, Token invalid, No headers or authorization in req (no token)
    res.status(401).json({ message: "Token not provided or not valid" });
  }
}
