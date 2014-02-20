
var oracle = require("oracle");

var connectData = { "hostname": "cis550project.cxremdqhabpu.us-west-2.rds.amazonaws.com", "user": "hangfei", "password": "carrot88", "database": "PENNTR" };
//var connectData = { "hostname": "cis550proj2.cxremdqhabpu.us-west-2.rds.amazonaws.com", "user": "hangfei", "password": "carrot13", "database": "PENNTR" };


function Post(username, post, time) {
  this.user = username;
  this.post = post;
  if (time) {
    this.time = time;
  } else {
    this.time = new Date();
  }
};
module.exports = Post;


// not useful
Post.prototype.save = function save(callback) {
	var post = {
	  user: this.user,
	  post: this.post,
	  time: this.time,
	};
	console.log('Greet the DBMS.');
	oracle.connect(connectData, function(err, connection) {
    if ( err ) {
    	console.log('User.prototype.save: DBMS connection failed.');
    	console.log(err);
    } else {
    	console.log('User.prototype.save: DBMS connection established.');
	  	connection.execute("INSERT INTO USERS (username) VALUES ('"+post.user + "')", 
	  			   [], 
	  			   function(err, results) {
  	    if ( err ) {
  	    	console.log('User.prototype.save: DBMS Execution Error.');
  	    	console.log(err);
  	    } else {
  	    	connection.close(); // done with the connection
  	    	console.log(results);
  	    	callback(err, user);
  	    	console.log(user);
  	    	console.log('User.prototype.save: Callback and connection closed.');
  	    }
	  	}); // end: connection.execute
    }
	}); // end: oracle.connect
}; // end: User.prototype.save

	
	
// get the pics for index page
Post.get = function get(username, callback){
oracle.connect(connectData, function(err, connection) {
		console.time("getindexpage");
    if ( err ) {
    	console.log("User.get error.");
    	console.log(err);
    } else {
    	console.log("User.get: connected to DBMS adn check "+username);
    	var posts = [];
        var NYLakes = null;
        var NJLakes = null;
	  	// selecting user
        //select id, c.url, p.boardname, p.username, p.contentid, c.cached, avg(r.rating) as score from rating r, content c, pin p where  r.contentid = c.id  and c.type = 'photo' and p.contentid = c.id group by c.id, c.url, boardname, p.username, p.contentid , c.cached order by score desc
        // select p.contentid, p.username, p.boardname, c.URL , c.cached, count(*) as count from content c, pin p where c.type = 'photo' and p.contentid = c.id group by c.URL, p.contentid ,c.cached, p.username, p.boardname having count(p.contentid) > 1
        connection.execute("select p.contentid, p.username, p.boardname, c.cached from content c, pin p where p.contentid = c.id and c.cached = '1' and c.url LIKE '%.jpg' and type = 'photo' group by   p.boardname, p.contentid, p.username,  c.cached",
	  			   [], 
	  			   function(err, results) {
	  	    if ( err ) {
	  	    	console.log("User.get: DBMS Execution Error.");
	  	    	console.log(err);
	  	    } else {
	  	    	if (1) {
		  	    	console.log("POst.get: fetch data for main page. size:" + results.length);
		  	    	NYLakes = results;
		  	    	NJLakes = results;
		  	    	posts = results;
		  	    	complete();
	  	    	}
	  	    	else {
	  	    		console.log("User.get: username could be used.");
		  	    	connection.close(); // done with the connection
		  	    	callback('', null);
	  	    	}
	  	    }
	  	}); // end connection.execute
        
	    function complete() {
        if (NYLakes !== null && NJLakes !== null) { 
        	connection.close(); // done with the connection
			  	console.log("User.get_user_photo: complete, callback results:");
			  	console.log(posts);
			  	callback('', posts);
		console.timeEnd("getindexpage");

        }
	    }
    }
  }); // end oracle.connect	
};  // end User.get
	


// get the boards photos of all users and recommendation for this user
Post.get_home = function get(username, callback){
oracle.connect(connectData, function(err, connection) {
		console.time("gethomepage");
  if ( err ) {
  	console.log("User.get_home error.");
  	console.log(err);
  } else {
  	console.log("User.get_home: connected to DBMS adn check "+username);
  	var posts = [];
    var NYLakes = null;
    var NJLakes = null;
  	connection.execute("select c.cached, p.contentid, p.boardname, p.username, min(c.url) URL from users u, board b, pin p, content c where c.url LIKE '%.jpg' and u.username = b.username and p.contentid = c.id and p.boardname = b.name and c.type = 'photo' group by  p.username, p.contentid,  c.cached, p.boardname",
  			   [], 
  			   function(err, results) {
	    if ( err ) {
	    	console.log("User.get_home: DBMS Execution Error.");
	    	console.log(err);
	    } else {
	    	if (1) {
  	    	console.log("POst.get_home: fetch data");
	    		console.log(results);
  	    	NYLakes = results;
  	    	posts[0] = results;
  	    	complete();
	    	}
	    	else {
	    		console.log("User.get_home: username could be used.");
  	    	connection.close(); // done with the connection
  	    	console.log(results.length);	
  	    	callback('', null);
	    	}
	    }
  	}); // end connection.execute
	
  	// query recommendation
  	connection.execute("select id as contentid, url, cached, avgscore from content c, (select contentid, avg(score) avgscore from (((select CONTENTID, AVG(RATING) SCORE from RATING r, content c where r.contentid = c.id and c.type = 'photo' group by CONTENTID)UNION (select CONTENTID, 0.8*AVG(RATING) SCORE from BEFRIEND F, RATING R, content c where F.USERNAME = '" + username + "' and F.FRIEND = R.USERNAME and c.id = r.contentid and c.type = 'photo' group by CONTENTID ))UNION(select r.contentid, avg(rating) SCORE from users u, interests i, rating r, content c, (select * from tag t, content c where c.id = t.contentid) t3 where u.username = i.username and i.interest LIKE t3.tagname and r.contentid = t3.contentid and c.id = r.contentid and c.type = 'type' group by r.contentid)) t5 group by contentid ORDER BY avgscore desc) t9 where t9.contentid = c.id and c.type = 'photo' group by id, url, cached, avgscore order by avgscore desc",
  			   [], 
  			   function(err, results) {
  	    if ( err ) {
  	    	console.log("User.get_home: DBMS Execution Error.");
  	    	console.log(err);
  	    } else {
  	    	if (1) {
						console.log("123username: " + username);
  	    		console.log("!!!!!!get_home: fetch recommendaiton success.");
  	    		console.log(results);
	  	    	NJLakes = results;
	  	    	posts[1] = results.slice(0, 10);
	  	    	complete();
  	    	}
  	    	else {
  	    		console.log("User.get_home: username could be used.");
	  	    	connection.close(); // done with the connection
	  	    	callback('', null);
  	    	}
  	    }
  		}); // end connection.execute
	  	
	    function complete() {
        if (NYLakes !== null && NJLakes !== null) { 
        	connection.close(); // done with the connection
			  	console.log("User.get_home: complete, callback results:");
			  	console.log(posts);
			  	callback('', posts);
		console.timeEnd("gethomepage");

        }
	    }
    }
  }); // end oracle.connect	
};  // end User.get



Post.get_user_photos = function get(username, callback){
	oracle.connect(connectData, function(err, connection) {
    if ( err ) {
    	console.log("User.get_user_photo error.");
    	console.log(err);
    } else {
    	console.log("User.get: connected to DBMS adn check "+username);
    	var posts = [];
        var NYLakes = null;
        var NJLakes = null;
	  	connection.execute("select p.username, p.boardname, c.url from users u, board b, pin p, content c where u.username = b.username and p.contentid = c.id and p.boardname = b.name and c.type = 'photo' and u.username = '" + username + "'",
	  			   [], 
	  			   function(err, results) {
  	    if ( err ) {
  	    	console.log("User.get_user_photo: DBMS Execution Error.");
  	    	console.log(err);
  	    } else {
  	    	if (1) {
  	    		console.log("get_user_photo: success.");
  	    		NYLakes = results;
	  	    	posts.push(results);
	  	    	complete();
  	    	}
  	    	else {
  	    		console.log("User.get_user_photo: username could be used.");
	  	    	connection.close(); // done with the connection
	  	    	callback('', null);
  	    	}
  	    }
  	}); // end connection.execute

	  	// query recommendation
	  	connection.execute("select * from content c, (select contentid, avg(score) avgscore from (((select CONTENTID, AVG(RATING) SCORE from RATING r, content c where r.contentid = c.id and c.type = 'photo' group by CONTENTID)UNION (select CONTENTID, AVG(RATING) SCORE from BEFRIEND F, RATING R, content c where F.USERNAME = 'jacknich' and F.FRIEND = R.USERNAME and c.id = r.contentid and c.type = 'photo' group by CONTENTID ))UNION(select r.contentid, avg(rating) SCORE from users u, interests i, rating r, content c, (select * from tag t, content c where c.id = t.contentid) t3 where u.username = i.username and i.interest LIKE t3.tagname and r.contentid = t3.contentid and c.id = r.contentid and c.type = 'type' group by r.contentid)) t5 group by contentid ORDER BY avgscore desc) t9 where t9.contentid = c.id and c.type = 'photo'",
	  			   [], 
	  			   function(err, results) {
  	    if ( err ) {
  	    	console.log("User.get_user_photo: DBMS Execution Error.");
  	    	console.log(err);
  	    } else {
  	    	if (1) {
  	    		console.log("Fetch recommendaiton success.");
	  	    	NJLakes = results;
	  	    	posts.push(results);
	  	    	complete();
  	    	}
  	    	else {
  	    		console.log("User.get_user_photo: username could be used.");
	  	    	connection.close(); // done with the connection
	  	    	callback('', null);
  	    	}
  	    }
	  	}); // end connection.execute
	  	
	  	function complete() {
        if (NYLakes !== null && NJLakes !== null) { 
        	connection.close(); // done with the connection
			  	console.log("User.get_user_photo: complete, callback results:");
			  	console.log(posts);
			  	callback('', posts);
		    }
		  } // end: complete
	  }
	}); // end oracle.connect	
};  // end User.get



Post.get_user_photos_visitor = function get(username, callback){
	oracle.connect(connectData, function(err, connection) {
    if ( err ) {
    	console.log("User.get_user_photos_visitor error.");
    	console.log(err);
    } 
    else {
    	console.log("User.get_user_photos_visitor: connected to DBMS adn check "+username);
    	var posts = [];
      var NYLakes = null;
      var NJLakes = null;
	  	connection.execute("select contentid, name as boardname, url, b.username from content c, board b, pin p where c.id = p.contentid and b.username = p.username and p.username = '" + username + "'",
	  			   [], 
	  			   function(err, results) {
  	    if ( err ) {
  	    	console.log("User.get_user_photos_visitor: DBMS Execution Error.");
  	    	console.log(err);
  	    } else {
  	    	if (1) {
  	    		connection.close();
  	    		console.log("get_user_photos_visitor: success.");
	  	    	var post = results;
  	    		NYLakes = results;
  	    		NJLakes = results;
	  	    	posts[0] = results;
	  	    	complete();
  	    	}
  	    	else {
  	    		console.log("User.get_user_photos_visitor: username could be used.");
	  	    	connection.close(); // done with the connection	
	  	    	callback('', null);
  	    	}
  	    }
  	}); // end connection.execute
	  	
  	// helper function for two asynchronous callback
    function complete() {
        if (NYLakes !== null && NJLakes !== null) { 
			  	console.log("User.get_user_photos2: complete, callback results:");
			  	console.log(posts);
			  	callback('', posts);
        }
	    }
    }
  }); // end oracle.connect	
};  // end User.get



Post.get_board = function get(boardname, callback){
	oracle.connect(connectData, function(err, connection) {
	    if ( err ) {
	    	console.log("User.get_user_photo error.");
	    	console.log(err);
	    } else {
	    	console.log("User.get: connected to DBMS adn check "+boardname);
	    	var posts = [];
        var NYLakes = null;
        var NJLakes = null;
		  	connection.execute("select * from content c, board b, pin p where c.id = p.contentid and b.username = p.username and b.name = '" + boardname + "'",
		  			   [], 
		  			   function(err, results) {
	  	    if ( err ) {
	  	    	console.log("User.get_user_photo: DBMS Execution Error.");
	  	    	console.log(err);
	  	    } else {
	  	    	if (1) {
	  	    		console.log("get_board: success.");
	  	    		//console.log(results);
		  	    	var post = results;
	  	    		NYLakes = results;
	  	    		NJLakes = results;
		  	    	posts[0] = results;
		  	    	complete();
	  	    	}
	  	    	else {
	  	    		console.log("User.get_board: username could be used.");
		  	    	connection.close(); // done with the connection
		  	    	callback('', null);
	  	    	}
	  	    }
	  	}); // end connection.execute
		
	    function complete() {
	        if (NYLakes !== null && NJLakes !== null) { 
		        console.log("User.get_board: complete, callback results");
				  	console.log(posts);
				  	connection.close(); // done with the connection
				  	callback('', posts);
	        }
		    }
	    }
	  }); // end oracle.connect	
	};  // end User.get
