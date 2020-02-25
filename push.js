var push = require('web-push');
var express = require('express');
var path = require("path");
var app = express();
var bodyParser = require("body-parser");
const MongoClient = require('mongodb').MongoClient;
app.use(express.static('./'))

var port = process.env.PORT || 8080;


app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());


/*const uri = "mongodb+srv://admin-user:admin-user@webpushdb-6hegz.gcp.mongodb.net/test?retryWrites=true&w=majority";
MongoClient.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true}, (err, clien) => {
  const collection = client.db("web-push-db").collection("users");
  // perform actions on the collection object
  console.log("connected");
  var ins = {
				subscriber : 'Test',
				is_dinner : false,
				is_time : false
			} 
  collection.insertOne(ins, function(err, res){
	  console.log(err);
  })
  client.close();
});
*/
const uri = "mongodb+srv://admin-user:admin-user@webpushdb-6hegz.gcp.mongodb.net/test?retryWrites=true&w=majority";


app.post('/subscriber', function(req, res){
		(async function() {
		  await insertSubscriber(req.body);
		  res.end("yes");
		})();
});


app.get('/send-notification', function (req, res) {
		
	(async function() {
		var subscribers = await getAllSubscriber();
	  
		var vapidKeys = {
		  publicKey: 'BLb6aIeyzqzi58NGwfM5IjDw01bsJEbdQM4jHSjnYs83uEURDKR27Pw4TtlSelvEGzkVdyIMlU3RVd2KVYSAgcg',
		  privateKey: '0DC1Cgn1KN_fC9yHIFO4ePwA-7PpLIn95jfxYv-Fv60'
		}
			
		push.setVapidDetails('mailto:test@gmail.com', vapidKeys.publicKey, vapidKeys.privateKey);
	  
	  for (const subscriber of subscribers) {
		console.log(JSON.parse(subscriber.userId));
		push.sendNotification(JSON.parse(subscriber.userId), "Would you like to have Dinner tonight !!");
	  }
	  
	  res.send("Notification Sent!");
	})();
});

app.get('/',function(req,res){
  res.sendFile(path.join(__dirname+'/index.html'));
  //__dirname : It will resolve to your project folder.
});



//Insert document to db collection
function insertSubscriber(myobj){
	return new Promise(resolve => {
		MongoClient.connect(uri,{ useUnifiedTopology: true }, function(err, database) {
		  if (err) throw err;
		  var databaseCollection = database.db("web-push-db");
		  databaseCollection.collection("users").insertOne(myobj, function(err, res) {
			if (err) throw err;
			console.log("1 document inserted");
			resolve();
			database.close();
		  });
		});
	});
};

//Get All document from db collection
function getAllSubscriber(){
	return new Promise(resolve => {
		MongoClient.connect(uri,{ useUnifiedTopology: true }, function(err, database) {
		  if (err) throw err;
		  var databaseCollection = database.db("web-push-db");
		  databaseCollection.collection("users").find({}).toArray(function(err, result) {
			if (err) throw err;
			resolve(result);
			database.close();
		  });
		});
	})
}


app.listen(port, function() {
    console.log('Our app is running  ' + port);
});
