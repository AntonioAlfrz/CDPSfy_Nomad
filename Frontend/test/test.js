var expect = require("chai").expect;
var mongoose = require('mongoose');

describe("Test Database", function() {
  it("Checking Mongo", function() {
    mongoose.connect('mongodb://mongodbcdps.westeurope.cloudapp.azure.com:27017/tracks', function(err){
      console.log("Function"+err)
      if (err){
        throw err
      }else{
        done()
      }
    });
  });
});
