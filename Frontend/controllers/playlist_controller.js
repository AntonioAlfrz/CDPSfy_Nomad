var track_model = require('./../models/track');
var apiserver = require('./track_controller').apiserver
//Carga la playlist a partir de la URL
exports.playlistload = function(req,res,next,playlistId){
	if(req.session.user){
		track_model.Users.find( { name: req.session.user.name }, function (err, user) {
		 	if(user){
				var playlists = user[0].playlists || "[]"
				playlists = JSON.parse(playlists)
				req.session.playlist = playlists[playlistId]
				req.session.playlistId = playlistId
				next()
			} else {
	 		res.redirect("/user/login")
	 		}
 		});
	} else {	
		res.redirect("/user/login")
	}
}
//Lista las playlists del usuario logueado
exports.playlists = function(req,res){
	var playlists = []
	 track_model.Users.find( { name: req.session.user.name }, function (err, user) {
	 	if(user){
	 		playlists = user[0].playlists || []
	 		var rr = []
	 		if (playlists != '') {
	 			 rr =  JSON.parse(playlists)
	 		}
	 		res.render('users/playlists',{ playlists: rr })
	 	} else {
	 		res.render('users/playlists',{ playlists: [] })
		}
	 })
}
//Página de creación de playlist nueva
exports.newplaylist = function(req,res){
	track_model.Track.find(function (err, tracks) {
	  if (err) return console.error(err);
	  res.render('users/new_playlist',{tracks: tracks})
	})
}
//Crea playlist nueva
exports.createplaylist = function(req,res,next){
	track_model.Users.find( { name: req.session.user.name }, function (err, user) {
	 	if(user){
			var playlists = user[0].playlists || "[]"
			playlists = JSON.parse(playlists)
			var plname = req.body.nombre || 'new playlist'
			var pl = {name: plname, songs: req.body.songsofplaylist};
			playlists.push(pl)
			 var playlists = JSON.stringify(playlists)
			var conditions = { name: req.session.user.name}
			  , update = { $set: { playlists: playlists } }
			  , options = { multi: false };

			
			track_model.Users.update(conditions, update, options, function (err, user) {
			  if (err) {
				req.session.errors = {"message": ''+ new Error('Error')}
			  	res.redirect("/user/playlists/new")

			  } else if (user){
			  	res.render("users/playlists",{playlists: JSON.parse(playlists)})
			  } else {
			  	req.session.errors = {"message": ''+ new Error('Error')}
			  	res.redirect("/user/playlists/new")
			  }
			});
		}
	});
}
//Muestra playlist seleccionada
exports.showplaylist = function(req,res, next){
	track_model.Track.find(function (err, tracks) {
		if (err) return console.error(err);
			if(req.session.playlist){
				var songs = []
				if(req.session.playlist.songs != undefined){
				tracks.forEach(function(tr){
					if (req.session.playlist.songs.indexOf(''+tr._id) >=0 ){
						songs.push(tr)
					}
				})
			} else {songs= tracks}
					  res.render('tracks/index', {title: req.session.playlist["name"], id: req.session.playlistId, tracks: songs, url: apiserver});

			} else {
						  res.render('tracks/index', {tracks: tracks, url: apiserver});

			}

	})
}
//Actualiza playlist tras su edición
exports.editplaylist = function(req,res,next){
	track_model.Users.find( { name: req.session.user.name }, function (err, user) {
	 	if(user){
			var playlists = user[0].playlists || "[]"
			playlists = JSON.parse(playlists)
			var plname = req.body.nombre || 'nueva'
			var pl = {name: plname, songs: req.body.songsofplaylist};
			playlists[req.session.playlistId] = pl
			 var playlists = JSON.stringify(playlists)
			var conditions = { name: req.session.user.name}
			  , update = { $set: { playlists: playlists } }
			  , options = { multi: false };

			
			track_model.Users.update(conditions, update, options, function (err, user) {
				
			  if (err) {
				req.session.errors = {"message": ''+ new Error('Error')}
			  	res.redirect("/user/playlists/edit")

			  } else if (user){
			  	res.redirect("/user/playlists")
			  } else {
			  	req.session.errors = {"message": ''+ new Error('Error')}
			  	res.redirect("/user/playlists/edit")
			  }
			});
		}
	});
}
//Página de edición de playlists
exports.edit = function(req,res,next){
	track_model.Track.find(function (err, tracks) {
	if (err) return console.error(err);

		if(req.session.playlist){
			var songs = []
			if (req.session.playlist.songs != undefined){
				tracks.forEach(function(tr){
					if (req.session.playlist.songs.indexOf(''+tr._id) >=0 ){
						tr.sel = 1 
					}
					songs.push(tr)

				})
			} else { songs = tracks}
			res.render('users/edit_playlist', {title: req.session.playlist["name"], tracks: songs, id: req.session.playlistId});

		} else {
			res.render('tracks/index', {title: 'No existe', tracks: tracks, id: req.session.playlistId});

		}
	})
}
//Elimina playlist
exports.removeplaylist = function(req,res,next){
	 track_model.Users.find( { name: req.session.user.name }, function (err, user) {
	 	if(user){
			var playlists = user[0].playlists || "[]"
			playlists = JSON.parse(playlists)
			var aux = playlists.splice(req.session.playlistId)
			aux.shift()
			playlists = playlists.concat(aux)
			var playlists = JSON.stringify(playlists)
			  , conditions = { name: req.session.user.name}
			  , update = { $set: { playlists: playlists } }
			  , options = { multi: false };

			
			track_model.Users.update(conditions, update, options, function (err, user) {
				if (err) {
					req.session.errors = {"message": ''+ new Error('Error')}
				  	res.redirect("/user/playlists")

				} else if (user){
				  	res.render("users/playlists",{playlists: JSON.parse(playlists)})
				} else {
				  	req.session.errors = {"message": ''+ new Error('Error')}
				  	res.redirect("/user/playlists")
				}
			});
		}
	});
}

