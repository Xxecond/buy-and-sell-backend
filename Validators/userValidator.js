const { z } = require('zod');

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1, "Password required"),
});

const signupSchema = z.object({
  name: z.string().min(1, "Name required"),

  email: z.string().email("Invalid email"),

  password: z
    .string()
    .min(6, "Password must be at least 6 characters")
    .regex(/[A-Z]/, "Must include at least one capital letter")
    .regex(/[0-9]/, "Must include at least one number")
    .regex(/[^A-Za-z0-9]/, "Must include a special character"),
});

const idParamSchema = z.object({
  id: z.string().regex(/^\d+$/, "Invalid Id")
})

const validateLogin = (req, res, next) =>{
try{
loginSchema.parse(req.body);
  next();
}catch(err){
  err.status = 400;
  next(err);
}}

const validateSignup = (req, res, next) =>{
try{
 signupSchema.parse(req.body);
  next();
}catch(err){
  err.status = 400;
  next(err);
}}

const validateUserId = (req, res, next) =>{
try{
  idParamSchema.parse(req.params);
  next();
}catch(err){
  err.status = 400;
  next(err);
}}


module.exports = { 
loginSchema,
signupSchema,
idParamSchema,
validateLogin,
validateSignup,
validateUserId};