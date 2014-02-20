// serach functionality for database pictures
var oracle = require("oracle");
var connectData = { "hostname": "cis550project.cxremdqhabpu.us-west-2.rds.amazonaws.com", "user": "hangfei", "password": "carrot88", "database": "PENNTR" };
//var connectData = { "hostname": "cis550proj2.cxremdqhabpu.us-west-2.rds.amazonaws.com", "user": "hangfei", "password": "carrot13", "database": "PENNTR" };

exports.searchImg = function (err, query, callback) {
  console.log('searchImg: Greet the DBMS. Try fetching search img.');
  oracle.connect(connectData, function(err, connection) {
    if ( err ) {
    	console.log('searchImg: DBMS connection failed.');
    	console.log(err);
    } else {
    	console.log('searchImg: DBMS connection established.');
    	console.log("searchImg: the query key word is: " + query);
	  	connection.execute("select * from tag t, content c where t.contentid = c.id and t.tagname LIKE '"+ query + "'", 
  			   [], 
  			   function(err, results) {
  	    if ( err ) {
  	    	console.log('searchImg: DBMS Execution Error.');
  	    	console.log(err);
  	    } else {
  	    	connection.close(); // done with the connection
  	    	console.log('searchImg-------');
  	    	callback(err, results);
  	    	console.log(results);
  	    	console.log('searchImg: Callback and connection closed. Results:' + results);
  	    	console.log('searchImg-------');
  	    }
	  	}); // end: connection.execute
    } // end: else
  }); // end: oracle.connect
};
