var express = require('express');
var router = express.Router();
var multer  = require('multer');

var tracks_dir = process.env.TRACKS_DIR || './media/';

var trackController = require('../controllers/track_controller');
var userController = require('../controllers/users_controller');
var sessionController = require('../controllers/session_controller');
var plController = require('../controllers/playlist_controller');
router.get('/', function(req, res) {
  res.render('index');
});

router.param('trackId', trackController.load)

router.param('userId', userController.load)

router.param('playlistId', plController.playlistload)

router.get('/tracks', trackController.list);

router.get('/tracks/new', sessionController.loginRequired, trackController.new);

router.get('/tracks/:trackId', trackController.show);

router.post('/tracks', sessionController.loginRequired, multer({inMemory: true}), trackController.create);

router.delete('/tracks/:trackId',sessionController.loginRequired,  trackController.destroy);

router.get('/user/new', userController.new)

router.post('/user/create', userController.create)

router.get('/user/list',userController.list)

router.post('/user/login', userController.login)

router.delete('/user/delete', sessionController.loginRequired, userController.elimina, sessionController.destroy)
 
router.get('/user/edit',sessionController.loginRequired, userController.changePassword)

router.put('/user/edit', userController.update)

router.get('/user/login', userController.signin)

router.post('/user/playlists/create', sessionController.loginRequired, plController.createplaylist)

router.get('/user/playlists/new', sessionController.loginRequired, plController.newplaylist)

router.get('/user/playlists', sessionController.loginRequired, plController.playlists)

router.get('/user/playlists/edit/:playlistId', sessionController.loginRequired, plController.edit)

router.put('/user/playlists/edit/:playlistId', sessionController.loginRequired, plController.editplaylist)

router.delete('/user/playlists/delete/:playlistId',  sessionController.loginRequired, plController.removeplaylist)

router.get('/user/playlists/:playlistId', sessionController.loginRequired, plController.showplaylist)

router.get('/user/:userId', sessionController.loginRequired, userController.user)

router.get('/logout', sessionController.destroy)

// router.get('/dump',sessionController.dump)


module.exports = router;