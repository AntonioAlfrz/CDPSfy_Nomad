var fs = require('fs');
var track_model = require('./../models/track');
var request = require('request');
var FormData = require('form-data');
var needle = require('needle');
var STORAGE_PATH = "https://cdps.blob.core.windows.net/";
//Cambiar para desarrollo en local o para despliegue

var apiserver = "http://haproxy.service.consul:3000/";
exports.apiserver = apiserver;

//Carga la canción a partir de la URL
exports.load = function(req,res,next,trackId){
	track_model.Track.findById(trackId, function (err, track){

		  if (track) {
		  	req.track = track
		  	next()
		  } else if (err){
			 next(new Error('No existe'))
		  }

	});
}

// Devuelve una lista de las canciones disponibles y sus metadatos
exports.list = function (req, res) {

	track_model.Track.find(function (err, tracks) {
	  if (err) return console.error(err);
	  res.render('coverflow',  {title: 'All tracks', tracks: tracks, url: STORAGE_PATH});
	})
};


// Devuelve la vista del formulario para subir una nueva canción
exports.new = function (req, res) {
	res.render('tracks/new');
};

// Devuelve la vista de reproducción de una canción.
// El campo track.url contiene la url donde se encuentra el fichero de audio
exports.show = function (req, res) {
	console.log(req.track._id)
	res.render('tracks/show', {track: req.track, url: STORAGE_PATH});
};

// Escribe una nueva canción en el registro de canciones.
// TODO:
// - Escribir en tracks.cdpsfy.es el fichero de audio contenido en req.files.track.buffer
// - Escribir en el registro la verdadera url generada al añadir el fichero en el servidor tracks.cdpsfy.es
exports.create = function (req, res) {
	if (!req.files.track){
		res.redirect('/tracks/new')
	} else {

		var track = req.files.track;
		var caratula = req.files.caratula
		var id = track.name.split('.')[0];
		var cc = track.originalname.split('.')
		var filename = cc[0];
		var name = req.body.nombre || filename
		var tipo = cc[cc.length-1]
		var ext = ''
		if(caratula != undefined){
			var ccc = caratula.originalname.split('.')
			ext = ccc[ccc.length-1]
		}

		var song = new track_model.Track({
				"id": id,
				"name": name,
				"ext": tipo,
				"caratula":ext});

		song.save(function (err, s1) {
			console.log(song._id)
			if (err) return console.error(err);
			var data = {
			 Song: {
			    buffer       : req.files.track.buffer,
			    filename     : song._id+'.'+tipo,
			    content_type : 'application/octet-stream'
				}
			}
			needle.post(apiserver + "upload/"+song._id, data,{multipart:true}, function(err, resp, body) {
			});
			if(caratula != undefined){

				var imagen = {
				 Caratula: {
				    buffer       : req.files.caratula.buffer,
				    filename     : song._id+'.'+ext,
				    content_type : 'application/octet-stream'
				}

				}
				  	needle.post(apiserver + "foto/"+song._id, imagen,{multipart:true}, function(err, resp, body) {

				});


			}



		});

		res.redirect('/tracks');
	}
};

// Borra una canción (trackId) del registro de canciones
// TODO:
// - Eliminar en tracks.cdpsfy.es el fichero de audio correspondiente a trackId
exports.destroy = function (req, res) {
	var trackId = req.params.trackId;
	track_model.Track.findById(req.params.trackId, function (err, track){

		if (err) { res.redirect('/tracks');}
		var data = {
				ident : req.params.trackId,
				song: track.ext,
				img: track.caratula

		}
		 needle.delete(apiserver + "delete", data, function(err, resp, body) {

		 	track.remove()
		 	res.redirect('/tracks');


		});



	});

};
