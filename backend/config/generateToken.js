import jwt from "jsonwebtoken";

const generateToken = (id) => {
  /**
    jwt.sign(payload, secret_key, options);
    - payload: A JavaScript object that contains the data that you want to include in the JWT token
    - secret: A secret key or a private key used to sign the token. It should be kept secret to ensure that no one else can generate a valid token
    - options: An optional parameter that includes additional settings for the token, such as the expiration time, issuer, audience, and algorithm used to sign the token
      It is an object with the following optional properties:
        algorithm: The algorithm used to sign the token. Defaults to HS256.
        expiresIn: The expiration time of the token in seconds or a string describing a time span. For example, 60, '2 days', or '10h'.
        notBefore: The time before which the token cannot be accepted for processing, in seconds or as a string.
        audience: A string or array of strings representing the intended audience for the token.
        issuer: A string representing the issuer of the token.
        jwtid: A unique identifier for the token.
        subject: A subject for the token.
 */
  return jwt.sign({ id }, process.env.JWT_SECRET_KEY, { expiresIn: "30d" });
};

export default generateToken;
