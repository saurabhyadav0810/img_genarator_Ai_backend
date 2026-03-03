import jwt from "jsonwebtoken";
import createError from "../error.js";

const verifyToken = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer "))
    return next(createError(401, "Not authenticated"));

  const token = authHeader.split(" ")[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = decoded.id;
    next();
  } catch {
    return next(createError(401, "Invalid or expired token"));
  }
};

export default verifyToken;
