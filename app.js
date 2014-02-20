
/**
 * Module dependencies.
 */
var acctKey = 'lGE+WNnQRr2BpDbrndwA+ZPO8IuLaJ2LLuHzLQPcCS4';
var rootUri = 'https://api.datamarket.azure.com/Bing/Search';
var auth    = new Buffer([ acctKey, acctKey ].join(':')).toString('base64');
var request = require('request').defaults({
	  headers : {
	    'Authorization' : 'Basic ' + auth
	  }
	});

var express = require('express');
var routes = require('./routes');  
var http = require('http');
var path = require('path');
var engine = require('ejs-locals');
var app = express();
var crypto = require('crypto');
var flash = require('connect-flash');

//set database
var oracle = require("oracle");
var connectData = { "hostname": "cis550project.cxremdqhabpu.us-west-2.rds.amazonaws.com", "user": "hangfei", "password": "carrot88", "database": "PENNTR" };
//var connectData = { "hostname": "cis550proj2.cxremdqhabpu.us-west-2.rds.amazonaws.com", "user": "hangfei", "password": "carrot13", "database": "PENNTR" };
console.log("stsart111");

oracle.connect(connectData, function(err, connection) {
	console.log("Oracle connect: stsart");
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
	  	    }
	
	  	}); // end connection.execute
    }
  }); // end oracle.connect

// all environments
app.set('port', process.env.PORT || 3000);
//configure
app.configure(function(){
  app.engine('ejs', engine);
	app.set('views', __dirname + '/views'); 
	app.set('view engine', 'ejs'); 
	app.use(express.bodyParser()); 
	app.use(express.methodOverride()); 
	app.use(express.cookieParser());
	app.use(express.session({secret: '1234567890QWERTY'}));
  app.use(flash());
  app.use(express.static(__dirname + '/public'));
});


// development only
if ('development' == app.get('env')) {
  app.use(express.errorHandler());
}

app.use(function(req, res, next){
  var error = req.flash('error');
  var success = req.flash('success');
  //
  res.locals.user = req.session.user;
  res.locals.error = error.length ? error : null;
  res.locals.success = success ? success : null;
  next();
});

app.use(app.router);
routes(app);

http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});
