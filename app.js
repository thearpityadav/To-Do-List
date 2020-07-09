const express=require("express");
const ejs=require("ejs");
const bodyParser= require("body-parser");
const mongoose=require("mongoose");
const lodash=require("lodash");


const app= express();
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));
mongoose.connect("mongodb+srv://admin-arpit:Test123@cluster0.iwarp.mongodb.net/todolistDB", { useNewUrlParser: true});
const itemSchema= {
  name: String
};
const Item= mongoose.model("item", itemSchema);
const item1= new Item ({
  name: "Welcome to your To Do List"
});
const item2= new Item ({
  name: "Press + to add item"
});
const item3= new Item ({
  name: "Hit checkbox to delete item"
});
const defaultItems=[item1,item2,item3];

const listSchema= {
  name: String,
  items: [itemSchema]
}
const List=mongoose.model("List", listSchema);




app.set("view engine","ejs");


app.get("/", function(req,res) {
 Item.find({}, function(err,foundItems)
{
  if(foundItems.length===0){
    Item.insertMany(defaultItems, function(err){
      if (err){
        console.log(err);
      } else {
        console.log("Successfully Added.");
      }
    });
    res.redirect("/");
  }else {
  res.render("list", {listTitle: "Today", newItems: foundItems});
}
});


});
app.post("/",function(req,res)
{
   let itemName=req.body.addItem;
   let lName=req.body.list;
   const item= new Item({
     name: itemName
   });
if(lName==='Today'){

  item.save();
  res.redirect("/");
} else{
  List.findOne({name: lName}, function(err,foundList){
    if(!err)
    {
      foundList.items.push(item);
      foundList.save();
      res.redirect("/"+lName);
    }
  });
}


});


app.post("/delete", function(req,res){
  const itemName= req.body.checkbox;
  const listName= req.body.listName;
  if(listName==="Today"){
  Item.findByIdAndRemove(itemName, function(err){
    if(!err){
      console.log("Removed Successfully");
    }
  });
  res.redirect("/");
}
else{
  List.findOneAndUpdate({name: listName},{$pull:{items:{_id: itemName}}}, function(err)
{
  if(!err){
    res.redirect("/"+listName);
  }
});
}


});


app.get("/:listName", function(req,res){
  const listName= _.capitalize(req.params.listName);

List.findOne({name: listName}, function(err, foundList){
  if(!err){
    if(!foundList){
      const list= new List({
        name: listName,
        items: defaultItems
        });
        list.save();
        res.redirect("/"+listName);
    }
    else {
      res.render("list",{listTitle: foundList.name, newItems: foundList.items});
    } }
  });
});


app.get("/work", function(req,res)
{
  res.render("list", {listTitle: "Work List", newItems: workItems});
});
app.get("/about", function(req,res){

res.render("about");
});


let port = process.env.PORT;
if (port == null || port == "") {
  port = 3000;
}

app.listen(port, function(){
  console.log("Server is up");
});
