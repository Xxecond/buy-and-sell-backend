const { z } = require('zod');

const createPostSchema = z.object({
  title: z.string().min(1, "Title is required"),
  content: z.string().min(1, "Content is required"),
});

const updatePostSchema = z.object({
  title: z.string().min(1).optional(),
  content: z.string().min(1).optional()
}).refine(data => data.title || data.content,{
  message: "At least one field (title or content) is required"
});

const idParamSchema = z.object({
  id: z.coerce.number().int("Id must be an integer").positive("Id must be positive"),
})

const querySchema = z.object({
  page: z.string().optional(),
  limit: z.string().optional(),
  cursor: z.string().optional()
});


const validateCreatePost = (req, res, next) => {
  try{
    createPostSchema.parse(req.body);
    next();
  } catch(err){
    err.status = 400; 
    next(err);
  }
};


const validateUpdatePost = (req, res,next) => {
  try{
    updatePostSchema.parse(req.body);
    next();
  } catch(err){
    err.status = 400; 
    next(err);
  }
};

const validatePostId = (req, res, next) => {
  try{
    console.error("params", req.params)
    const parsed = idParamSchema.parse(req.params);
    req.params.id = parsed.id;
    next();
  }catch(err){
    err.status = 400;
    next(err)
  }
}

const validatePostQuery = (req, res, next) => {
  try{
    querySchema.parse(req.query);
    next();
  } catch (err) {
    err.status=  400;
    next(err);
  }
};

module.exports = {
validateCreatePost,
validateUpdatePost,
validatePostId,
validatePostQuery
 };