
// models
var User = require('../models/user.js');
var Post = require('../models/post.js');
var Cache = require('../routes/cache.js');

//network modules
var crypto = require('crypto');
var http = require('http');
var request = require('request');
var http = require('http');

// mongoDB caching
var MongoClient = require('mongodb').MongoClient;
var Db = require('mongodb').Db,
Server = require('mongodb').Server,
ReplSetServers = require('mongodb').ReplSetServers,
ObjectID = require('mongodb').ObjectID,
Binary = require('mongodb').Binary,
GridStore = require('mongodb').GridStore,
Grid = require('mongodb').Grid,
Code = require('mongodb').Code,
BSON = require('mongodb').pure().BSON,
assert = require('assert');
var MongoDB = require('mongodb');
var fs = require('fs');

// bing search
var acctKey = 'lGE+WNnQRr2BpDbrndwA+ZPO8IuLaJ2LLuHzLQPcCS4';
var rootUri = 'https://api.datamarket.azure.com/Bing/Search';
var auth    = new Buffer([ acctKey, acctKey ].join(':')).toString('base64');
var request = require('request').defaults({
  headers : {
    'Authorization' : 'Basic ' + auth
  }
});



// ******* Start ******
if (0) {
	
	Cache.cache(null, function(err, results) {
		console.log('***************end cache******');
	}); 
};
//use module.exports, then we could load directly
module.exports = function(app) {
  app.get('/', function(req, res) {
    Post.get(null, function(err, posts) {
      if (err) {
        posts = [];
      }
      res.render('index', {
        title: 'Indexpage',
        img: posts,
      });
    });
  });
	    
	app.get('/reg', checkNotLogin);
	app.get('/reg', function(req, res) { 
		res.render('reg', {
		title: 'tesss3_reg', 
		});
	}); 

	app.get('/test_page', checkNotLogin);
	app.get('/test_page', function(req, res) { 
		res.render('test_page', {
		title: 'test', 
		});
	}); 
	
	// test page for image caching
	app.get('/img', function(req, res){
		Cache.cache(null, function(err, results) {
	        res.render('img', {
	            title: 'hello',
	            img: results
	          });			
		});        
	}); //end get img

  app.get('/cache/', function(req, res) {
	  var query       = req.query.key;
	  console.log(req.query.key);
	  console.log('app.get(/cache/): ----------------------------');
   	console.log('Your cache string is: ' + query);	    
		Cache.fetch_one(null, query, function(err, results) {
			if(err) {
				console.log(err);
				res.send(500, err.message);
			}
			else {
	    	res.writeHead(200, {
	        'Content-Type': 'image/jpeg',
	  	    'Content-Length':results.length});
  		  console.log("File length is " +results.length);
  		  res.write(results, "binary");
  		  res.end(results,"binary");						
			}

		});  	
  }); // end: get
	  
	app.get('/bing', checkNotLogin);
	app.get('/bing', function(req, res) { 
		res.render('bing', {
		title: 'Bing Search', 
		});
	}); //end get bing
	
	//post request
	app.post('/bing', function(req, res) {
		  //var service_op  = req.body.service_op;
		  var query       = req.body.query;
		  // rest functionality
		  console.log("The query string is:" + query);
		  //
		  res.redirect('/bing/' + query);	//weird here: contents after + would be passed
	}); //end post

	var searchImg = require('../functionality/search_img.js');
	  app.get('/bing/:req', function(req, res) {
	  	  // search type: "Web" or "Image"
		  var service_op  = "Image";
		  var query       = req.params.req;
		  console.log('----------------------------');
	   	  console.log('Your search string is: ' + query);	    
		  searchImg.searchImg(null, query, function(err, results_db) {
			  request.get({
				    url : rootUri + '/' + service_op,
				    qs  : {
				      $format : 'json',
				      Query   : "'" + query + "'", // the single quotes are required!
				    }
				  }, function(err, response, body) {
				    if (err)
				      return res.send(500, err.message);
				    if (response.statusCode !== 200)
				      return res.send(500, response.body);
				    // JSON.parse to parse the results
				    var results_bing = JSON.parse(response.body);
				    console.log('results_db:' + results_db);
			        res.render('search_page', {
			            title: 'Search',
			            img_bing: results_bing.d.results,
			            img_db: results_db
			          });			    
				  }); // end: bing request.get				  	
			  }); // end: searchImg

	  }); // end: get

	app.post('/reg', checkNotLogin);   
	app.post('/reg', function(req, res) { 
		if (req.body['password-repeat'] != req.body['password']) {
			req.flash('error', 'Password does not match.');
			return res.redirect('/reg');
		} // end repeat password check
	
		var md5 = crypto.createHash('md5');
		// add extral string to password for security
		var password = md5.update((req.body.password+'carrot')).digest('base64');
	    var newUser = new User({
	        name: req.body.username,
	        password: password,
	    });
	    //check if user exist
		User.get(newUser.name, function(err, user) {
			if (user)
				err = 'Username already exists.';
			if (err) {
				req.flash('error', err); 
				return res.redirect('/reg');
			}
			newUser.save(function(err) {
				if (err) {
				req.flash('error', err); return res.redirect('/reg');
			}
			req.flash('success', 'Register successfully.'); res.redirect('/');
			req.session.user = newUser; // rememer the session
			}); 
		});
	}); //end app.post

  // if checkNotLogin true, execute next app.get; else exect checkNotLogin's if.
  app.get('/login', checkNotLogin);
  app.get('/login', function(req, res) {
    res.render('login', {
      title: 'User Login',
    });
  });	
	
  // if checkNotLogin true, execute next app.get; else exect checkNotLogin's if.
  app.post('/login', checkNotLogin);
  app.post('/login', function(req, res) {
    var md5 = crypto.createHash('md5');
    var password = md5.update((req.body.password+'carrot')).digest('base64');
    // get the user from DBMS
    User.get(req.body.username, function(err, user) {
      if (!user) {
        req.flash('error', 'User not exist.');
        return res.redirect('/login');
      }
      if (user.password != password) {
        req.flash('error', 'Password incorrect.');
        return res.redirect('/login');
      }
      req.session.user = user;
      req.flash('success', 'Login Successfully');
      res.redirect('/home');	// display different according to ejs/html
    });
  }); 
  
  // after login
  app.get('/home', function(req, res) {
	    Post.get_home(null, function(err, posts) {
	      if (err) {
	        posts = [];
	      }
	      res.render('home', {
	        title: 'Homepage',
	        img: posts[0],
	        posts_2: posts[1]
	      });
	    });
	 });
  
  // check not login
  app.get('/logout', checkLogin);
  app.get('/logout', function(req, res) {
    req.session.user = null;
    req.flash('success', 'Logout successfully.');
    res.redirect('/');
  });
  
  // post
  app.post('/post', checkLogin); 
  app.post('/post', function(req, res) {
	  var currentUser = req.session.user;
	  // set the fields of post. "time" is optional
	  var post = new Post(currentUser.name, req.body.post); 
	  // try to update the DBMS according to the fields of post
	  post.save(function(err) {
	  if (0) {
        req.flash('error', err); 
        return res.redirect('/');
	  }
	    req.flash('success', 'Post succesfully111'); 
	    res.redirect('/' + currentUser.name);
	  });
  });
  
  // display user's boards and photos
  app.get('/:user', function(req, res) { User.get(req.params.user, function(err, user) {
	  if (!user) {
		  req.flash('error', 'user not exits'); 
		  return res.redirect('/');
	  }
	  Post.get_user_photos(user.name, function(err, posts) {
	  if (err) { req.flash('error', err); 
	  return res.redirect('/');
      }
      res.render('user', {
        title: user.name,
        img: posts[0],
        posts2: posts[1]
      });
	  }); 
	  });
  }); 
  
  // 
  app.get('/u/:req', function(req, res) { 
  	console.log('get(/u/:req) start -----------------');
  	console.log(req.params.req);
  	var query = req.params.req;
  	if (typeof query == 'undefined' ) {
	  	console.log('Query undefined.');
		  req.flash('error', 'Query undefined.'); 
		  return res.redirect('/home');
  	}
  	else if (!query.length) {
  		console.log('Query empty');
		  req.flash('error', 'Query empty.'); 
		  return res.redirect('/home');  		
  	}
    Post.get_user_photos_visitor(query, function(err, posts) {
  	  if (err) { 
  	  	req.flash('error', err); 
  	  	return res.redirect('/');
  	  }
  	  // use length to check is not very safe
  	  console.log("posts[0].length:" + posts[0].length);
  	  if (posts[0].length == 0) {
  	  	console.log('User Not Exist.');
  		  req.flash('error', 'User Not Exist.'); 
  		  return res.redirect('/home');
  	  }
        res.render('user', {
          title: query,
          img: posts[0]
      });
  	}); 
  });  	
  
  app.get('/b/:req', function(req, res) { 
  	console.log('get(/b/:req) -----------------');
  	console.log(req.query);
  	console.log(req.params.req);
  	var query = req.params.req;
  	if (typeof query == 'undefined' ) {
	  	console.log('Query undefined.');
		  req.flash('error', 'Query undefined.'); 
		  return res.redirect('/home');
  	}
  	else if (!query.length) {
  		console.log('Query empty');
		  req.flash('error', 'Query empty.'); 
		  return res.redirect('/home');  		
  	}
    Post.get_board(req.params.req, function(err, posts) {
  	  if (err) { 
  	  	req.flash('error', err); 
  	  	return res.redirect('/');
      }
  	  console.log(posts.isEmptyObject);
  	  // use length to check is not very safe
  	  if (posts[0].length == 0) {
  		  req.flash('error', 'Board Not Foundd.'); 
  		  return res.redirect('/home');
  	  }
      res.render('board', {
        title: query,
        img: posts[0]
      });
  	}); 
  }); 
  
  
  
  console.log('all methods captured');  
}; // end module.exports



// functionality to help determine user status: login or not
// if req.session.user null, flash error. else no flash.
function checkLogin(req, res, next) {
  if (!req.session.user) {
    req.flash('error', 'Not login yet.');
    return res.redirect('/login');
  }
  next();
}

// if req.session.user not null, flash error; if null, no flash.
function checkNotLogin(req, res, next) {
  if (req.session.user) {
    req.flash('error', 'Already login.');
    return res.redirect('/');
  }
  next();
}

