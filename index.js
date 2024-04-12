
//Succesfully completed (Mini Whatsapp)

const express = require("express");
const app = express();
const mongoose = require("mongoose");
const path = require("path");
//const Chat = require("./models/chat.js");
//const { Console } = require("console");
const methodOverride = require("method-override");
const Chat = require("./models/chat");
const ExpressError = require("./ExpressError");

app.set('view engine',"ejs")
app.set("views",path.join(__dirname,"views"))
app.use(express.static(__dirname + "/public"));  // to attach styling
app.use(methodOverride("_method"));
app.use(express.urlencoded({ extended: true }));    // to get the data parse while we create a data and it stores in the main form



// const currUser = "Pulkit";
// const currReciever = "Elon Musk";

main()
  .then(() => {
    console.log("connected");
  })
  .catch((err) => {
    console.log(err);
  });
async function main() {
    await mongoose.connect("mongodb://127.0.0.1:27017/fakewhatsapp");
}




//Index Route
app.get("/chats",async (req,res)=>{
  try{
    let chats = await Chat.find({});
    // console.log(chats);
    res.render("index.ejs",{ chats });
  } catch(err){
    next(err);
  }
  
});

//New route
app.get("/chats/new",(req,res)=>{
  // throw new ExpressError(404,"Page not found");
 res.render("new.ejs"); 
});

//Create route
app.post("/chats",asyncWrap(async(req,res,next)=>{
  
    let { sentFrom,sentTo,message } = req.body;
   let  newChat = new Chat({
    sentFrom : sentFrom,
    sentTo : sentTo,
    message: message,
    instance :new Date(),
  });
     await newChat.save();
     res.redirect("/chats");
})
);


//  newChat   // newchat , save, create , update all are async func only. 
// .save()   // Here, no need to write async or await ,coz it is an then-nable func it automatically knows it need to wait.
// .then((res) => {
//     console.log("chat was saved");
//   })
//     .catch((err) => {
//      console.log(err);
//    });
//   res.redirect("/chats");
//  });

function asyncWrap(fn){
  return function(req,res,next){
    fn(req,res,next).catch((err) => next(err));
  };
}

//to avoid error handling , we have created a new route
//NEW ROUTE (show route)
app.get("/chats/:id",
      asyncWrap(async(req,res,next)=>{
  
    let {id} = req.params;
    let chat = await Chat.findById(id);
    if(!chat){
      next(new ExpressError(404,"chat not found"));
    }
    res.render("edit.ejs",{chat});
  
})
);

 //edit route
 app.get("/chats/:id/edit", async (req,res)=>{
  try{
    let { id } = req.params;
    let chat = await Chat.findById(id);
    console.log(chat);
    res.render("edit.ejs",{chat});
  }catch(err){
    next(err);
  }
  
 });
//Update route
app.put("/chats/:id",
asyncWrap(async(req,res)=>{
  
    let {id} = req.params;
    let { message : newMsg } = req.body;
    let updatedChat = await Chat.findByIdAndUpdate(
    id,
    {message : newMsg},
    { runValidators : true , new : true}
  );
  console.log(updatedChat);
  res.redirect("/chats");    // CREATE AN UPDATED TIME AFTER THE CHANGE (!!! HOME WORK !!!)
})
);

//destroy route
app.delete("/chats/:id",asyncWrap(async(req,res)=>{
 
    let {id} = req.params;
    const chat = await Chat.findByIdAndDelete(id);
    console.log(`deleted : ${chat}`);
    res.redirect("/chats");
 
 
})
);

// let chat1 = new Chat({
//     sentFrom : "srija",
//     sentTo : "priya",
//     message:"send me your notes",
//     instance: new Date(),
// });
// chat1.save().then(res=>{
// console.log(res);
// });

app.get("/", (req, res) => {
  res.send("root is working");
});

// app.patch("/messages", async (req, res) => {
//   await new Chat({
//     sentFrom: req.body.sentFrom,
//     sentTo: req.body.sentTo,
//     message:req.body.message,
//     instance:Date.now()
//   }).save()
//   res.redirect("/")
// });

// app.get("/message/edit", async (req, res) => {
//   const chatObj = await Chat.findById(req.params.id);
//   console.log(chatObj);
//   res.render("index",{messages: await Chat.find({}),user:currUser});
// });

// app.get("/message/:id/edit", async (req, res) => {
//   Chat.findById(req.params.id).then(msg=>{
//     res.render("message",{msg,user:currUser})
//   });
// });

// app.patch("/message/:id", async (req, res) => {
//   Chat.findByIdAndUpdate((req.params.id),{message:req.body.msg},{new:true}).then(()=>{
//     res.redirect("/")
//   })
// });

// app.delete("/message/:id", async (req, res) => {
//   Chat.findByIdAndDelete(req.params.id).then(res=>{
//     console.log(res);
//   })
//   res.redirect("/")
// });

const handleValidationErr = (err) =>{
  console.log("This was a Validation error.Please follow rules");
  console.dir(err.message);
  return err;
};
app.use((err,req,res,next)=>{
  console.log(err.name);
  if(err.name === "ValidationError"){
    err = handleValidationErr(err);
  }
  next(err);
});


//Error Handling Middleware
app.use((err,req,res,next)=>{
  let {status = 500 , msg ="Some Error occurred"} = err;
  res.status(status).send(msg);
});

app.listen(8080, () => {
  console.log("app is listening on port 8080");
});