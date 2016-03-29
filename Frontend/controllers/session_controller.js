
//Administra el cierre de sesión
exports.destroy = function(req,res){
	delete req.session.user
	res.redirect('/user/login')
}
//Comprueba que se ha iniciado sesión para acceder a determinadas funcionalidades
exports.loginRequired = function(req,res,next){
	if(req.session.user){
		next()
	}else{
		res.redirect('/user/login')
	}
}
//Función para development, borra la base de datos de canciones y usuarios
/*
exports.dump = function (req, res) {

	track_model.Track.find(function (err, tracks) {

		 	tracks.forEach(function(track){
		 		track.remove()
		 	})
		 
		 	res.redirect('/tracks');
			


		
	});
	track_model.Users.find(function (err, tracks) {

		 	tracks.forEach(function(track){
		 		track.remove()
		 	})
		 req.session.user = null
	


		
	});

};*/