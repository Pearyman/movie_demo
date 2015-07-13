// Models
var Movie = require('../models/movie');
var User = require('../models/user');
var _=require('underscore');




module.exports = function(app){
	//#######
	// Middleware for Routes 
	//#######
	app.use(function(req,res,next){
		var _user = req.session.user;
		if(_user){
			app.locals.user = _user;
		}
		next();
	});

	//#######
	// routes 
	//#######
	//-- index
	app.get('/',function(req,res){
		console.log('Session !!!');
		console.log(req.session.user);



		Movie.fetch(function(err,movies){
			if(err){
				console.log(err);
			}
			res.render('index',{
				title:'Movie Index',
				movies: movies
			});
		});

	});
	//-- List 
	app.get('/list',function(req,res){
		Movie.fetch(function(err,movies){
			if(err){
				console.log(err);
			}
			res.render('list',{
				title:'Movie 列表',
				movies:movies
			})


		});

	});
	// admin list 
	app.get('/admin/list',function(req,res){
		Movie.fetch(function(err,movies){
			if(err){
				console.log(err);
			}
			res.render('list',{
				title:'Movie 列表',
				movies:movies
			})


		});

	});

	//-- admin
	app.get('/admin/movie',function(req,res){
		

		res.render('admin',{
			title:'movies 后台录入',
			movie:{
			// 	// director:'hihi',
			// 	// title:'hoho',
			// 	// language:'EN',
			// 	// country:'CN',
			// 	// summary:'catcat',
			// 	// flash:'http://player.youku.com/player.php/sid/XMTI2NjA4MzU1Ng==/v.swf',
			// 	// poster:'http://img4.duitang.com/uploads/item/201207/08/20120708234648_dwQuG.thumb.600_0.jpeg',
			// 	// year:2010
				
			}
		});

	});

	// -- admin list
	app.get('/admin/update/:id',function(req,res){
		var id = req.params.id;
		console.log(id);
		if(id){
			Movie.findById(id,function(err,movie){
				if(err){
					console.log(err);
				}
				res.render('admin',{
					title:'Moive 后台',
					movie:movie
				});
			});
		}

	});
	//-- admin post
	app.post('/admin/movie/new',function(req,res){
		//console.log(req.body.movie);
		//bodyParser extended = true  -> is the key !!!
		var id = req.body.movie._id;
		var movieObj = req.body.movie;
		
		var _movie;
		if(id){
			Movie.findById(id,function(err,movie){
				if(err){
					console.log(err);
				}
				_movie = _.extend(movie,movieObj);
				_movie.save(function(err,movie){
					if(err){
						console.log(err);
					}
					res.redirect('/movie/'+movie._id);
				});
			});

		} else {
			_movie = new Movie({
				director:movieObj.director,
				title:movieObj.title,
				language:movieObj.language,
				country:movieObj.country,
				summary:movieObj.summary,
				flash:movieObj.flash,
				poster:movieObj.poster,
				year:movieObj.year
				

			});
			_movie.save(function(err,movie){
				if(err){
					console.log(err);
				}
				res.redirect('/movie/'+movie._id);
			});


		}

	})

	//-- detail
	app.get('/movie/:id',function(req,res){
		var id = req.params.id;
		Movie.findById(id,function(err,movie){
			if(err){
				console.log(err);
			}
			var movieTitle ='Movie '+ movie.title || '';
			res.render('detail',{
				title:movieTitle,
				movie:movie

			});

		});

	});

	// delete movie in the list
	app.delete('/admin/list',function(req,res){
		var id = req.query.id;
		console.log('hahha '+id);
		if(id){
			Movie.remove({_id:id},function(err,movie){
				if(err){
					console.log(err);
				} else {
					res.json({success:1});
				}

			});

		}


	})

	// user controller route
	// --- signup
	app.post('/user/signup',function(req,res){
		var _user = req.body.user;
		

		// see if user exist
		User.findOne({name:_user.name},function(err,user){
			if(err){
				console.log(err);
			}
			if(user){
				return res.redirect('/');
			} else{
				var newUser = new User(_user);
				newUser.save(function(err,user){
					if(err){
						console.log(err);
					}
					// console.log(user);
					res.redirect('/admin/userList');
				});
			}
		});


	});

	//--- signin  /user/signin
	app.post('/user/signin',function(req,res){
		var _user = req.body.user;
		var name = _user.name;
		var password = _user.password;

		User.findOne({name:name})
			.select('name password')
			.exec(function(err,user){
			if(err){
				console.log(err);
				console.log('001');
			}
			if(!user){
				return res.redirect('/');
			} 
			user.comparePassword(password,function(err,isMatch){
				if(err){
					console.log(err);
					console.log('002');
				}
				if(isMatch){
					req.session.user = user;
					return res.redirect('/');
				} else{
					console.log('Wrong Password!');
				}


			});
			// console.log(user);
		 //    var isVaild = user.comparePassword(password);
	  //   	if(isVaild){
	  //   		console.log('Right Password!');
	  //   		return res.redirect('/');
	  //   	} else{
	  //   		console.log('Wrong Password!');
	  //   	}
		});

	});

	//-- User List 
	app.get('/admin/userList',function(req,res){
		User.fetch(function(err,users){
			if(err){
				console.log(err);
			}
			res.render('userList',{
				title:'User 列表',
				users:users
			})


		});
	});

	// -- logout /logout
	app.get('/logout',function(req,res){

		delete req.session.user;
		delete app.locals.user;
		res.redirect('/');

	});

};