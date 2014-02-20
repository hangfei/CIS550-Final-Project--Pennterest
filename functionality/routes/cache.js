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
var request = require('request');
var http = require('http');

// oracle
var oracle = require("oracle");
var connectData = { "hostname": "cis550project.cxremdqhabpu.us-west-2.rds.amazonaws.com", "user": "hangfei", "password": "carrot88", "database": "PENNTR" };
//var connectData = { "hostname": "cis550proj2.cxremdqhabpu.us-west-2.rds.amazonaws.com", "user": "hangfei", "password": "carrot13", "database": "PENNTR" };



// cache pictures
exports.cache = function (err, callback) {
  // connected oracle, query the data that need to cached
  oracle.connect(connectData, function(err, connection) {
    if ( err ) {
    	console.log('Query cache: DBMS connection failed.');
    	console.log(err);
    } else {
  	console.log('Query Cahce: DBMS connection established.');
  	// query for pictures that pinned several times
  	connection.execute("select p.contentid,  c.URL , c.cached, count(*) as count from content c, pin p where c.type = 'photo' and p.contentid = c.id group by c.URL, p.contentid ,c.cached having count(p.contentid) > 1", 
  			   [], function(err, results) {
	    if ( err ) {
	    	console.log('Query cache: DBMS Execution Error.');
	    	console.log(err);
	    } else {
  	  	MongoClient.connect('mongodb://127.0.0.1:27017/test', function(err, db) {
				  if(!err) {
				    console.log("We are connected");
				  }
				  console.log("the szie we want to cache: "+results.length);
				  var cached_img = [];		  

	  			results.forEach(function(item) {
	  			  async(item,db,  function(result){
	  			    cached_img.push(result);
	  			    if(cached_img.length == results.length) {
	  			      final();
	  			    }
	  			  });
	  			});
  
	  			function final() { 
	  				connection.close(); // done with the connection
	  				console.log('Done the parallel call!!!', results); 
	  				callback('', cached_img);
	  			};
	  	  }); //end mongonConnection
	  	  	
	  	  function async(arg, db, callback) {
	  		  console.log('write and read:  \''+arg.CONTENTID+'\', return 1 sec later');
	  		  var fileId = arg.CONTENTID+'.txt';
				  var url_to_cache = arg.URL;
				  var gridStore = new GridStore(db, fileId, 'w');
				  gridStore.open(function(err, gridStore) {
	          http.get(url_to_cache, function (response) {
      	  		response.setEncoding('binary');
      	  		var image2 = '';
      	  		response.on('data', function(chunk){
      	  	    image2 += chunk;
      	  	  });
        	  		
        	  	response.on('end', function() {
	              image = new Buffer(image2,"binary");
                // Write some data to the file
                gridStore.write(image, function(err, gridStore) {
                  assert.equal(null, err);
                  // Close (Flushes the data to MongoDB)
                  gridStore.close(function(err, result) {
                    assert.equal(null, err);
                    GridStore.read(db, fileId, function(err, fileData) {
                    console.log('Done, writing local images for testing purposes');
                    console.log("File length is " +fileData.length);
                    console.log('Really done');   
                    img3 = new Buffer(fileData.toString('base64'));
                    // update the content's cache info: set to 1 for mongo pic
                    connection.execute("UPDATE content SET cached= '1' WHERE id = " + arg.CONTENTID , 
                    		[], 
                    		function(err, results2) { 
                  	  if(err) {
                  		  console.log(err);
                  	  }
                  	  console.log("Update cached: "+arg.CONTENTID+ " results:" +results2);
                  	  console.log(results2);
                    }); // end: connection for cache updates
                    //console.log(fileData._id);
                    console.log("Done write file:" + fileId);
                    NJLakes = img3;
                    callback(img3);
                    });
                  });
                }); //end: gridStore.write
  	  		});	// end: response
        });
		  });//end gridStore.open	
	  	  //setTimeout(function() { callback(arg * 2); }, 1000);		  		  
	  }	// end async
	  	  console.log('Query cache: Callback and connection closed.');
	  	}
	  	}); // end: connection.execute
    }
  }); // end: oracle.connect
};


//fetch one pictures
exports.fetch_one = function (err, contentid, callback) {
	MongoClient.connect('mongodb://127.0.0.1:27017/test', function(err, db) {
	  if(!err) {
	    console.log("We are connected");
	  }
	  var fileId = contentid + '.txt';
	  console.log('cache.fetch_one: try fetch fileId pic:'+fileId);
  	// Create a new instance of the gridstore
    GridStore.read(db, fileId, function(err, fileData) { 
  	  if(err) {
  		  console.log(fileId + " : " + err);
  		  callback(err, null);
  	  }
  	  else {
        console.log('Done, writing local images for testing purposes');
        console.log('Really done');
        callback('', fileData);
  	  }
    }); // end gridStore.read					  
	}); //end mongonConnection
};

//fetch pictures
exports.fetch = function (err, callback) {
MongoClient.connect('mongodb://127.0.0.1:27017/test', function(err, db) {
			  if(!err) {
			    console.log("We are connected");
			  }
			  var urls = [];
			  urls[0] = 'ourexamplefiletowrite2.txt';
			  urls[1] = 'ourexamplefiletowrite.txt';
			  // Create a new instance of the gridstore
			  var results = [];
			  var NYLakes = [];  
			  var count = 0;			 
			  for(var i = 0; i < 2; i++) {
				  var fileId = urls[i];
		          GridStore.read(db, fileId, function(err, fileData) {       	
		        	  
                       console.log('Done, writing local images for testing purposes');
                       console.log("File length is " +fileData.length);
                       console.log('Really done');
                       img3 = new Buffer(fileData.toString('base64'));
                       console.log(fileData._id);
                       console.log(img3);
                       results[count] = img3;
                       count++;
                       if(count >= 2) {
                     	  callback('', results);
                       }
	              	}); // end gridStore.read					  
			  }
			  
       		    function complete() {
       		    	console.log('NYlakes');
       		    	console.log(NYLakes);
     		        if (NYLakes[0] !== null && NYLakes[1] !== null) { 
     		        	console.log('complete');
	     				  	console.log(results);
	     				  	callback('', results);
     		        }
     		    }                    
		}); //end mongonConnection
};
