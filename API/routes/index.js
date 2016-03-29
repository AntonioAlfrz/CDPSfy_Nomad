var express = require('express');
var router = express.Router();
var multer = require("multer");
var azure = require('azure-storage');
var storage = multer.memoryStorage();
var upload = multer({ storage: storage });
var blobSvc = azure.createBlobService();

blobSvc.createContainerIfNotExists('music-container', {publicAccessLevel : 'blob'}, function(error, result, response){
  if(!error){
    console.log("Songs blob correct");
  }
});
blobSvc.createContainerIfNotExists('images-container', {publicAccessLevel : 'blob'}, function(error, result, response){
  if(!error){
    console.log("Image blob correct");
  }
});

/* GET home page. */
router.get('/', function(req, res) {
  res.render('index', { title: 'Express' });
});
/* POST */
router.post('/upload/:songId',upload.single("Song"), function(req, res) {
  var stream = blobSvc.createWriteStreamToBlockBlob('music-container', req.file.originalname);
  stream.write(req.file.buffer);
  stream.on('error', function(){
    console.log('Error on uploading song');
    res.status(404).end();
  });
  stream.end(function(){
    console.log('Song uploaded');
    res.status(204).end();
  });
});
/* POST */
router.post('/foto/:songId', upload.single("Caratula"), function(req, res) {
  var stream = blobSvc.createWriteStreamToBlockBlob('images-container', req.file.originalname);
  stream.write(req.file.buffer);
  stream.on('error', function(){
    console.log('Error on uploading image');
    res.status(404).end();
  });
  stream.end(function(){
    console.log('Image uploaded');
    res.status(204).end();
  });
});
router.delete('/delete', function(req,res){
  blobSvc.deleteBlob("music-container", req.body.ident+"."+req.body.song, function(error, response){
    if (error){
      console.log('Error on deleting song');
      console.log(response.body.Error.Message);
      res.status(404).end();
      return;
    }
    console.log('Song deleted');
    res.status(204).end();
  });
  if(req.body.img !== ''){
    blobSvc.deleteBlob("images-container", req.body.ident+"."+req.body.img, function(error, response){
      if (error){
        console.log('Error on deleting image');
        res.status(404).end();
        return;
      }
      console.log('Image deleted');
      res.status(204).end();
    });
  }
});
module.exports = router;
