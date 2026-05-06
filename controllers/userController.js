const {PrismaClient} =require('@prisma/client');
const prisma = new PrismaClient();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');


const signup = async (req, res) => {

    const { name, email, password } = req.body;

    // 2. check user exists
    const existingUser = await prisma.user.findUnique({
      where: { email }
    });

    if (existingUser) {
     const err  = new Error( "User already exists" );
     err.status = 400;
     throw err;
    }

    // 3. hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // 4. create user
    const newUser = await prisma.user.create({
      data: { name, email, password: hashedPassword }
    });

    // 5. create token (use newUser, NOT user)
    const token = jwt.sign(
      { id: newUser.id, role: newUser.role },
      process.env.JWT_SECRET,
      { expiresIn: '21h' }
    );

    // 6. send cookie
    res.cookie("token", token, {
      httpOnly: true,
      secure: false,
      sameSite: "lax",
      maxAge: 1000 * 60 * 60 * 24
    });

    res.json({ user: newUser });

};

const login = async (req, res) => {
  

    const { email, password } = req.body;

    const user = await prisma.user.findUnique({
      where: { email }
    });

    if (!user) {
      const err = new Error("User not found" );
      err.status = 400;
      throw err;
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      const err = new Error("Invalid credentials" );
      err.status = 400;
      throw err;
    }

    const token = jwt.sign(
      { id: user.id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '21h' }
    );

      res.cookie("token", token, {
      httpOnly: true,
      secure: false,
      sameSite: "lax",
      maxAge: 1000 * 60 * 60 * 24 
    });

    res.json({ user });

};

const logout = async (req, res) => {
  res.clearCookie("token");
  res.json({message:"Logged out"})
}

const promoteUser = async (req, res) => {
  try {

    const { id } = req.params;

    const user = await prisma.user.update({
      where: { id: Number(id) },
      data: { role: "admin" }
    });

    res.json({ message: "User promoted to admin", user });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


const getAllUsers = async  (req, res) => {
  const users = await prisma.user.findMany({
     orderBy: {
      id:"asc"
     }
  })
   res.json(users)    
}


const demoteUser = async (req, res) => {
    const { id } = req.params;

    if (req.user.userId === Number(id)) {
      const err = new Error( "You cannot demote yourself" );
      err.status = 400;
      throw err;
    }

    const user = await prisma.user.findUnique({
      where:{
        id: Number(id)}
      });

    if(!user){
      const err = new Error("user not found");
      err.status = 404;
      throw err;
    }

      if(user.isSuperAdmin){
       const err = new Error("Cannot demote super admin");
       err.status = 403;
       throw err;
      }
    
    const updated = await prisma.user.update({
      where: { id: Number(id) },
      data: { role: "user" }
    });

    res.json({ message: "User demoted to user", user: updated });
};


const deleteUser = async (req, res) => {
    const { id } = req.params;

     if (req.user.userId === Number(id)) {
    const err = new Error("You can't delete yourself" );
    err.status = 400;
    throw err;
    }

    const user = await prisma.user.findUnique({
      where:{
        id: Number(id)}
      })

    if(!user){
      return res.status(404).json({message:"User not found"})
    }

    if(user.isSuperAdmin){
      return res.status(403).json({message:"cannot delete super admin"});
    }
    await prisma.user.delete({
      where: { id: Number(id) }
    });

    res.json({ message: "User deleted" });
};

module.exports = {signup, login, logout,getAllUsers, promoteUser,demoteUser, deleteUser};