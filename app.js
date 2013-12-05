
/**
 * Module dependencies.
 */

var express = require('express');
var routes = require('./routes');  //文件夹形式的本地模块
//var user = require('./routes/user');
var http = require('http');
var path = require('path');
var engine = require('ejs-locals');
var app = express();
var crypto = require('crypto');
var flash = require('connect-flash');

//set database
//var MongoStore = require('connect-mongo')(express);
var settings = require('./settings');
var oracle = require("oracle");

var connectData = { "hostname": "cis550project.cxremdqhabpu.us-west-2.rds.amazonaws.com", "user": "hangfei", "password": "carrot88", "database": "PENNTR" };
console.log("stsart");
oracle.connect(connectData, function(err, connection) {
	console.log("stsart");
    if ( err ) {
    	console.log(err);
    } else {
	  	// selecting rows
	  	connection.execute("SELECT * FROM  users", 
	  			   [], 
	  			   function(err, results) {
	  	    if ( err ) {
	  	    	console.log(err);
	  	    } else {
	  	    	connection.close(); // done with the connection
	  	    	//console.log(results);
	  	    }
	
	  	}); // end connection.execute
    }
  }); // end oracle.connect

// all environments
app.set('port', process.env.PORT || 3000);
//configure
app.configure(function(){
	//why do i need this sentences?
  app.engine('ejs', engine);
	app.set('views', __dirname + '/views'); 
	app.set('view engine', 'ejs'); 

	app.use(express.bodyParser()); 
	app.use(express.methodOverride()); 
	app.use(express.cookieParser());
	app.use(express.session({secret: '1234567890QWERTY'}));
	
	//app.use(app.router);
  app.use(flash());
  //because of dynamic helper, put this back
  //app.use(app.router);
	//app.use(express.router(routes)); 
  app.use(express.static(__dirname + '/public'));
});

//?




//flash module test
//
/*
app.get('/', function(req, res){
  res.render('index', { message: req.flash('info') });
});
//?
//
app.get('/flash', function(req, res){
  req.flash('info', 'Hi there!')
  res.redirect('/');
});*/

//useful(don't delete)

//app.engine('ejs', engine);
//app.set('views', __dirname + '/views');
//app.set('view engine', 'ejs');

/*
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.json());
app.use(express.urlencoded());
app.use(express.methodOverride());*/


//app.use(app.router);
//app.use(express.static(path.join(__dirname, 'public')));

// development only
if ('development' == app.get('env')) {
  app.use(express.errorHandler());
}



//routes table，如果路由规则不负责的话，可以写在这。
//如果路由规则太复杂，最好还是分开，写到index里面去
//app.get('/', routes.index);		//route to routes.index if user input '/'
//app.get('/users', user.list);  //routes to routes.users if user input'../users'

//app.dynamicHelpers
/*
app.use(function(req, res, next){
    res.locals.user = req.session.user;
    res.locals.err = req.session.error;                                         
    // console.log("err" ,  req.session.error);                                         
    next();
});*/


app.use(function(req, res, next){
  var error = req.flash('error');
  var success = req.flash('success');
  //
  res.locals.user = req.session.user;
  res.locals.error = error.length ? error : null;
  res.locals.success = success ? success : null;
  next();
});
//另外一个版本
/*
app.use(function(req, res, next){
  res.locals.user = req.session.user;
  var err = req.flash('error');
  if(err.length)
    res.locals.error = err;
  else
    res.locals.error = null;
  var succ = req.flash('success');
  if(succ.length)
    res.locals.success = succ;
  else
    res.locals.success = null;
  next();
});*/
app.use(app.router);

routes(app);

http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});
