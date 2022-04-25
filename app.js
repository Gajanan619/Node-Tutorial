const path = require('path');
const express = require('express');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const hpp = require('hpp');
const cookieParser = require('cookie-parser');
const fs = require('fs');

const AppError = require('./Model/AppError');
const ErrorController = require('./controllers/errorController');

const tourRouter = require('./routes/tourRoutes');
const userRouter = require('./routes/userRoutes');
const authRouter = require('./routes/authRoutes');
const reviewRouter = require('./routes/reviewRoutes');
const viewRouter = require('./routes/viewRouter');

const app = express();

// 177
//Express directly support some view engine
//pug is one of them so we don't need to install anything
app.set("view engine", "pug");

//WE USE path.join it will automatically check "/" is available or not between 2 path
//so it will manage all this small thing within
app.set("views", path.join(__dirname, 'views'));


//so here we are specify path from which our all static assest will serve from this path image,css etc.
app.use(express.static(path.join(__dirname, "public")));


// 1)Global MIDDLEWARES
app.use(helmet());

if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
});
app.use("/api", limiter)


//Body Parser and cookie parser
app.use(express.json({
  limit: "10kb"
}));

app.use(express.urlencoded({
  //195 Form Data Parser
  extended: true,
  limit: "10kb"
}));

app.use(cookieParser());



app.use(mongoSanitize())
app.use(xss());
app.use(hpp());


//Test Logger Middleware 
app.use((req, res, next) => {
  try {
    console.log('Hello from the middleware 👋');
    console.log(req.body);
    next();
  } catch (error) {
    next(error);
  }
});

//Views



// 3) ROUTES
app.use("/", viewRouter);
app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);
app.use('/api/v1/auth', authRouter);
app.use('/api/v1/reviews', reviewRouter);


app.use("*", (req, res, next) => {
  next(new AppError("Page Not Found", 404));
});


//Global Error Handling Middleware
app.use(ErrorController);

module.exports = app;
