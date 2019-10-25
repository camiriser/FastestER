var mongoose = require("mongoose");

var info = new mongoose.Schema({
   Provider_ID: Number,
   Hospital_Name: String,
   Address: String,
   City: String,
   State: String,
   ZIP_Code: Number,
   County_Name: String,
   Phone_Number: String,
   ED_1b: Number,
   EDV:  Number,
   OP_18c: Number,
   OP_20:  Number,
   OP_22:  Number,
   ED_1b_Score: Number,
   EDV_Score:  Number,
   OP_18c_Score: Number,
   OP_20_Score:  Number,
   OP_22_Score:  Number,
   Partial_Score:  Number,
   Latitude:  String,
   Longitude:  String},  
   {collection: "info"});

module.exports = mongoose.model("info", info);