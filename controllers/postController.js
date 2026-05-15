const {PrismaClient} =require('@prisma/client');
const prisma = new PrismaClient();

const getAllPosts = async (req, res) => {
        const cursor = req.query.cursor ? Number(req.query.cursor) : undefined;
        const limit = Number(req.query.limit) || 9;

        const posts = await prisma.post.findMany({ 
          
        take: limit,
    ...(cursor && {
        cursor: {id: cursor},
        skip: 1
    }),
    orderBy: {
        id: 'desc'
    }
});
          
        res.json(posts);
    };

const getMyPosts = async (req, res) =>{
        const page = Number(req.query.page) || 1;
        const limit = Number(req.query.limit) || 5;

        const posts = await prisma.post.findMany({
            where: {
                userId: req.user.id
            },
            skip: (page - 1) * limit,
            take: limit,
            orderBy:{
              createdAt:"asc"
            },
           
        });
        
        res.json(posts);
        console.log(req.user);
    };

const createPost = async (req, res) => {

        const {title, content} = req.body;  

        const post = await prisma.post.create({
            data: {
                title,
                content,
                userId: req.user.userId
            }
        });
        res.status(201).json(post);
    }
               //single(optimized)
const updatePost = async (req, res) => {
        
        const {id} = req.params;
        const {title, content} = req.body;
            

        const isSuperAdmin = req.user.role === 'superAdmin';
        const isAdmin =req.user.role === "admin";

        const result =await prisma.post.updateMany({
            where:{
                id: Number(id),
             ...(!isSuperAdmin && !isAdmin ? {userId: req.user.userId} : {})
            },
            data: {title, content}
        });

        if(result.count === 0){
            return res.status(403).json({message: "not authorized or post not found"});
        }

        res.json({message: "post updated successfully"});
        };
    //2 queries(makes process slower)
const deletePost = async (req, res) => {
console.error(req.params)
    const {id} = req.params;

    const admin = req.user.role === 'admin';
    const isSuperAdmin = req.user.role === 'superAdmin';

    const result = await prisma.post.deleteMany({
        where: {
            id: Number(id),
            ...(!admin && !isSuperAdmin && {userId: req.user.userId})
        }
 });
 if(result.count === 0 ){
    return res.status(403).json({message: "Not authorized or post not found"})
}
res.json({message: "post deleted successfully"})
 };
 
module.exports = {getMyPosts, getAllPosts, createPost, updatePost, deletePost };