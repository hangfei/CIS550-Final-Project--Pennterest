var mongodb = require('./db');
var oracle = require("oracle");

var connectData = { "hostname": "cis550project.cxremdqhabpu.us-west-2.rds.amazonaws.com", "user": "hangfei", "password": "carrot88", "database": "PENNTR" };



function User(user){
    this.name = user.name;
    this.password = user.password;
};

module.exports = User;

// save the user to the DBMS
User.prototype.save = function save(callback) {
  var user = {
      name: this.name,
      password: this.password,
  };
  console.log('Greet the DBMS.');
  oracle.connect(connectData, function(err, connection) {

	    if ( err ) {
	    	console.log('DBMS connection failed.');
	    	console.log(err);
	    } else {
	    	console.log('DBMS connection established.');
		  	// selecting rows
	    	//INSERT INTO login_user(user_id, password, email) values(4, '" +user.name+"', '3@nju')"
		  	connection.execute("Select * from users", 
		  			   [], 
		  			   function(err, results) {
		  	    if ( err ) {
		  	    	console.log('DBMS Execution Error.');
		  	    	console.log(err);
		  	    } else {
		  	    	connection.close(); // done with the connection
		  	    	console.log(results);
		  	    	callback(err, " ");
		  	    	console.log('Callback and connection closed.');
		  	    }
		  	}); // end: connection.execute
	    }
	  }); // end: oracle.connect
}; // end: User.prototype.save

// get the user from DBMS. For verification of new user.
User.get = function get(username, callback){
oracle.connect(connectData, function(err, connection) {
    if ( err ) {
    	console.log("User.get error.");
    	console.log(err);
    } else {
    	console.log("User.get: connected to DBMS");
	  	// selecting rows
	  	connection.execute("SELECT USER_ID FROM LOGIN_USER WHERE USER_ID = '1'", 
	  			   [], 
	  			   function(err, results) {
	  	    if ( err ) {
	  	    	console.log(err);
	  	    } else {
			
	  	    	connection.close(); // done with the connection
	  	    	console.log(results);
	  	    }
	  	}); // end connection.execute
    }
  }); // end oracle.connect	
	callback('', null);
};  // end: User.get
