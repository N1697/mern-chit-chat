const notFound = (req, res, next) => {
  const error = new Error(`Not Found: ${req.originalUrl}`);
  res.status(404);
  next(error);
};

const errorHandler = (error, req, res, next) => {
  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  res.status(statusCode);
  res.json({
    message: error.message,
    stack: process.env.NODE_ENV === "production" ? null : error.stack,
    //- By default, NODE_ENV is set to "development", but it can be set to other values,
    //such as "production" or "test", depending on the needs of the application.
    //- In production mode, it is not recommended to include the stack trace in the response as it
    //may contain sensitive information about the server environment. Therefore, the stack property is set to null in production mode
  });
};

export { notFound, errorHandler };
