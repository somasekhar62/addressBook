require('dotenv').config(); 
const express = require('express');
const mongoose = require('mongoose');
const app = express();
const PORT = process.env.PORT || 5000;
const path=require("path");
const methodOveride=require("method-override");
// const uri = "mongodb://localhost:27017/AddressBook";
const ejsMate=require("ejs-mate");
const flash=require("connect-flash");
const session=require("express-session");
const passport=require("passport");
const MongoStore = require('connect-mongo');
const localstragety=require("passport-local");
const User=require("./models/UserModel.js");
app.use(session({
  secret:"mysecretstring",
  resave:false,
  saveUninitialized:true,
  store: MongoStore.create({ mongoUrl: process.env.MONGO_URI }),
  cookie:{
    expires:Date.now()+7*24*60*60*1000,
    maxAge:7*24*60*60*1000,
    httpOnly:true
  }
}));
app.use(passport.initialize());
app.use(passport.session());
passport.use(new localstragety(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());
app.use(flash());
app.set("view engine","ejs");
app.set("views",path.join(__dirname,"views"));
app.use(express.urlencoded({extended:true}));
app.engine("ejs",ejsMate);
app.use(express.static("public"));
app.use(methodOveride("_method"));
app.use(express.static(path.join(__dirname,"/public")));
app.use(flash());
// Import the Address model
const Address = require("./models/AddressModel.js");

// Connect to MongoDB
// Connect to MongoDB Atlas
mongoose
  .connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("MongoDB Connected"))
  .catch((err) => console.log("MongoDB Connection Error:", err));
  app.get("/", (req, res) => {
    res.send("Server is running...");
    res.redirect("/alladdress");
  });
// Define the /address route
app.get("/address", async (req, res) => {
  const addressData = [
    {
      name: "John Doe",
      address1: "123 Main St",
      address2: "Apt 4B",
      phonenumber: 9876543210,
      relation: "Friend",
      email: "johndoe@example.com",
      occupation: "Software Engineer",
      socialmedia: "@johndoe"
    },
    {
      name: "Jane Smith",
      address1: "456 Elm St",
      address2: "Suite 12A",
      phonenumber: 9876543211,
      relation: "Colleague",
      email: "janesmith@example.com",
      occupation: "Project Manager",
      socialmedia: "@janesmith"
    },
    {
      name: "Alice Johnson",
      address1: "789 Oak St",
      address2: "Flat 22",
      phonenumber: 9876543212,
      relation: "Sister",
      email: "alicejohnson@example.com",
      occupation: "Doctor",
      socialmedia: "@alicejohnson"
    },
    {
      name: "Robert Brown",
      address1: "321 Pine St",
      address2: "House 7",
      phonenumber: 9876543213,
      relation: "Uncle",
      email: "robertbrown@example.com",
      occupation: "Professor",
      socialmedia: "@robertbrown"
    },
    {
      name: "Emily Davis",
      address1: "654 Maple St",
      address2: "Villa 3",
      phonenumber: 9876543214,
      relation: "Cousin",
      email: "emilydavis@example.com",
      occupation: "Artist",
      socialmedia: "@emilydavis"
    }
  ];

  try {
    const ownerId = "67ed580503ff214413d3a1dc"; // Replace with actual owner ID if needed

    // Add the owner field to each address
    const addressesWithOwner = addressData.map((add) => ({
      ...add,
      owner: ownerId
    }));

    // Insert all addresses in bulk using insertMany
    await Address.insertMany(addressesWithOwner);

    console.log("All addresses saved successfully!");
    return res.send("All addresses have been successfully saved!");
    
  } catch (error) {
    console.error("Error saving addresses:", error);
    return res.status(500).send("Error saving addresses.");
  }
});

app.post("/signup", async (req, res) => {
      let { username, email, password } = req.body;
      const newUser = new User({ email, username });

      // Register the user asynchronously
      const registeredUser = await User.register(newUser, password);
      req.logIn(registeredUser,(err)=>{
        if(err){
          return next(err);
        }
        req.flash("success", "Welcome to Address Book!");
        res.redirect("/alladdress");
      })
});


app.use((req,res,next)=>{
  res.locals.success=req.flash("success");
  res.locals.error=req.flash("error");
  res.locals.Curruser=req.user;
  next();
});
app.get("/address/view",(req,res)=>{
  res.render("View.ejs")
})
app.get("/address/new", (req, res, next) => {
  console.log(req.user);
  
  if (!req.isAuthenticated()) {
    req.flash("error", "You must be logged in");
    return res.redirect("/alladdress");
  }
  
  res.render("new.ejs"); 
});

app.get("/address/:id",async(req,res)=>{
  let{id}=req.params;
  let lf=await Address.findById(id).populate("owner");
  res.render("show.ejs",{lf})
});
app.get("/address/:id/edit",async(req,res)=>{
  if (!req.isAuthenticated()) {
    req.flash("error", "You must be logged in");
    return res.redirect("/alladdress");
  }
  let {id}=req.params;
  let lf=await Address.findById(id);
  res.render("edit.ejs",{lf});
});
app.post("/address/create", async (req, res) => {
  let newAddress = new Address(req.body.address);
  if(!newAddress){
    req.flash("error","Error created in Address");
  }
  newAddress.owner=req.user._id;
  console.log(newAddress);
  
  await newAddress.save();

  req.flash("success", "Address created successfully!"); // Set flash message
  res.redirect("/alladdress"); // Redirect to display the addresses
});
app.get("/signup",(req,res)=>{
  res.render("Signup.ejs")
});
app.get("/login",(req,res)=>{
  res.render("Login.ejs");
})
app.post("/login",passport.authenticate("local",{
  failureRedirect:"/login",
  failureFlash:true
}),(req,res)=>{
  req.flash("success","Welcome back to Address Book");
  res.redirect("/alladdress");
})
app.get("/alladdress", async(req, res) => {
  let alladdress=await Address.find({});
  res.render("index.ejs", { alladdress });
});
app.put("/address/:id", async (req, res) => {
  let { id } = req.params;
  let address = await Address.findById(id);

  if (!address) {
    req.flash("error", "Address not found!");
    return res.redirect("/alladdress");
  }

  if (res.locals.Curruser && !address.owner._id.equals(res.locals.Curruser._id)){
    req.flash("error", "You do not have permission to edit this address.");
    return res.redirect(`/address/${id}`);
  }

  await Address.findByIdAndUpdate(id, { ...req.body.address });

  req.flash("success", "Address updated successfully!");
  return res.redirect("/alladdress");
});

app.delete("/address/:id",async(req,res)=>{
  if (!req.isAuthenticated()) {
    req.flash("error", "You must be logged in");
    return res.redirect("/alladdress");
  }
  let{id}=req.params;
  let lf=await Address.findById(id);
  if (res.locals.Curruser && !lf.owner._id.equals(res.locals.Curruser._id)){
    req.flash("error", "You do not have permission to  delete this address.");
    return res.redirect(`/address/${id}`);
  }
  await Address.findByIdAndDelete(id);
  req.flash("success", "Address deleted successfully!");
  res.redirect("/alladdress");
});
app.get("/logout",(req,res,next)=>{
  req.logOut((err)=>{
    if(err){
      next(err)
    }
    req.flash("success","you are logged out");
    res.redirect("/alladdress");
  })
})

// app.delete("/address/delte/:id",async(req,res)=>{
//   let{id}=req.params;
//   let lf =Address.findByIdAndDelete(id);
//   console.log(lf);
//   res.redirect("/alladdress");
// })


app.listen(PORT, () => {
  console.log(`App started on port ${PORT}`);
});
