var track_model = require('./../models/track');
var key = "7962564a5ebdd1e07c196eefb7b86ed34bfb166f8a4160b3a107b32374b28820"// process.env.MY_SECRET_KEY
var encryptor = require('simple-encryptor')(key);


// Extra el usuario de la base de datos a partir de la URL
exports.load = function(req,res,next,userId){
	var user = track_model.Users.find( { name:req.body.nombre }, function (err, user) {
		console.log(err)
		console.log(user)
		if(user){
			req.user = user;
			next()
		} else {next(new Error('Wrong userId=' + userId))}
	})
}

//Página de creación de usuario nuevo
exports.new = function(req,res){
	res.render('users/new')
}

//Creación de usuario nuevo
exports.create = function(req,res){

	var password = req.body.password
	if (password == ''){
		req.session.errors = {"message": ''+ new Error('Invalid password')}
			res.redirect('/user/new')
	} else {
	var encrypted = encryptor.encrypt(password);
		var user = track_model.Users.find( { name:req.body.nombre }, function (err, user) {
		console.log(err)
		console.log(user)
		if(user.length > 0 ){
			req.session.errors = {"message": ''+ new Error('Username already exists')}
			res.redirect('/user/new')
		} else {
			var usuario = new track_model.Users({ 
			"name": req.body.nombre,
			"password": encrypted,
			"playlists": []
			});

			usuario.save(function (err, s1) {
			  if (err) return console.error(err);
			});
			req.session.errors = {}
			res.redirect('/user/login')	
		}
	})
  }
}

//Cambiar la contraseña
exports.update = function(req,res,next){


	var password = req.body.password
	var old = req.body.old

	if (password == ''){
		req.session.errors = {"message": ''+ new Error('Invalid password')}
			res.redirect('/user/edit')
	} else {	

	  	var user = track_model.Users.findOne( { name: req.session.user.name }, function (err, user) {
	  	if (err){ 

		  	console.log('incorrecto')
		  	req.session.errors = [{"message":'Error: '+error}]
		  	res.redirect("/user/edit")
		  	return console.error(err);
	  	} else if (user){
	  		console.log(user)
	  		
	  		var contra =  encryptor.decrypt(user.password)

	  		console.log(contra)
		 	if(contra == req.body.old ){
		  		console.log("entraaaa")
		  		user.password = encryptor.encrypt(password)
		  		user.save()
			  	res.redirect("/user/profile")
		  	} else { 
		  		req.session.errors = {"message": ''+ new Error('Wrong password')}
		  		res.redirect("/user/edit")
		  	}
	  	} else {
		  	req.session.errors = {"message": ''+ new Error('Wong username')}
		  	res.redirect("/user/edit")
		}

	});	

	}
}
//Borrar usuario
exports.elimina = function(req,res,next){
		console.log(req.session.user)
	  track_model.Users.remove({name: req.session.user.name}, function(err,user){
	  	console.log(user)
	  	
	  	next()
	  }); 
}

//Lista de usuarios
exports.list = function(req,res){
	track_model.Users.find(function (err, users) {
	  if (err) return console.error(err);
	  console.log('here they are')
	  console.log(users);
	  res.render('users/index', {users: users});
	})
}

//Página de inicio de sesión
exports.signin = function(req,res){
	console.log(req.session.errors)
	var errors = req.session.errors || {}
	req.session.errors = {};
	res.render('users/login', {errors: errors})
}

//Inicio de sesión
exports.login = function(req,res){
	var user = track_model.Users.find( { name: req.body.nombre }, function (err, user) {
	  	if (err){ 

		  	console.log('usuario incorrecto')
		  	req.session.errors = [{"message":'Error: '+error}]
		  	res.redirect("/user/login")
		  	return console.error(err);
	  	} else if (user && user.length > 0 ){
	  		console.log(user)
	  		
	  		var contra =  encryptor.decrypt(user[0].password)

	  	
		 	if(contra == req.body.password ){
		  		console.log("entraaaa")
			 	req.session.user = {id:user[0].id, name:user[0].name}

			  	res.redirect(req.session.redir.toString());
		  	} else { 
		  		req.session.errors = {"message": ''+ new Error('Wrong password')}
		  		res.redirect("/user/login")
		  	}
	  	} else {
		  	req.session.errors = {"message": ''+ new Error('Wong username')}
		  	res.redirect("/user/login")
		}

	});	
}
 
//Perfil de usuario
exports.user = function(req,res){
	var user = req.session.user
	console.log(user)
	res.render('users/profile',{user: user})
}

//Página de cambio de contraseña
exports.changePassword = function(req, res) { 
	var errors = req.session.errors || {}
	req.session.errors = {};
	// res.render('users/login', {errors: errors})
 res.render('users/edit'), {errors: errors};
}