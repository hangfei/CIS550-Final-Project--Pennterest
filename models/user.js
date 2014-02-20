
// user model
var oracle = require("oracle");
var connectData = { "hostname": "cis550project.cxremdqhabpu.us-west-2.rds.amazonaws.com", "user": "hangfei", "password": "carrot88", "database": "PENNTR" };
//var connectData = { "hostname": "cis550proj2.cxremdqhabpu.us-west-2.rds.amazonaws.com", "user": "hangfei", "password": "carrot13", "database": "PENNTR" };

function User(user){
  this.name = user.name;
  this.password = user.password;
};

module.exports = User;

// save the user to the DBMS
// what's prototype?
User.prototype.save = function save(callback) {
  var user = {
    name: this.name,
    password: this.password,
  };
  console.log('User.prototype.save: Greet the DBMS.');
  oracle.connect(connectData, function(err, connection) {
    if ( err ) {
    	console.log('User.prototype.save: DBMS connection failed.');
    	console.log(err);
    } else {
    	console.log('User.prototype.save: DBMS connection established.');
	  	// If new user allowed, insert the user into the DBMS
    	//INSERT INTO login_user(user_id, password, email) values(4, '" +user.name+"', '3@nju')"
	  	connection.execute("INSERT INTO USERS (USERNAME, PASSWORD) VALUES ('"+user.name + "', '"+user.password+"')", 
	  			   [], 
	  			   function(err, results) {
  	    if ( err ) {
  	    	console.log('User.prototype.save: DBMS Execution Error.');
  	    	console.log(err);
  	    } else {
  	    	connection.close(); // done with the connection
  	    	callback(err, user);
  	    	console.log('User.prototype.save:' + user);
  	    	console.log('User.prototype.save: Callback and connection closed.');
  	    }
	  	}); // end: connection.execute
    } // end: else
	  }); // end: oracle.connect
}; // end: User.prototype.save

// get the user from DBMS. For verification of new user or login
User.get = function get(username, callback){
oracle.connect(connectData, function(err, connection) {
    if ( err ) {
    	console.log("User.get error.");
    	console.log(err);
    } else {
    	console.log("User.get: connected to DBMS adn check "+username);
	  	// selecting user
	  	connection.execute("select username, password FROM USERS where username = '"+username+"'", 
	  			   [], 
	  			   function(err, results) {
  	    if ( err ) {
  	    	console.log("User.get: DBMS Execution Error.");
  	    	console.log(err);
  	    } else {
  	    	if (results.length) {
	  	    	console.log("User.get: username could not be used.");
	  	    	connection.close(); // done with the connection
	  	    	console.log(results);	
	  	    	var user_returned = {
	  	    		name : results[0].USERNAME,
	  	    		password : results[0].PASSWORD
	  	    	};
	  	    	var user = new User(user_returned); 
	  	    	callback(err, user);
	  	    	console.log('callback resutls:' + user);
  	    	}
  	    	else {
  	    		console.log("User.get: username could be used.");
	  	    	connection.close(); // done with the connection	
	  	    	callback('', null);
  	    	}
  	    }
	  	}); // end: connection.execute
    } //end: else
  }); // end: oracle.connect	
};  // end: User.get
