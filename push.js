var push = require('web-push');
var express = require('express');
var path = require("path");
var app = express();
var bodyParser = require("body-parser");
var nodemailer = require('nodemailer');
const CronJob = require('cron').CronJob;
const MongoClient = require('mongodb').MongoClient;
app.use(express.static('./'))


var port = process.env.PORT || 8080;


app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(bodyParser.text());


//Notification Option
var pushOptions = {
			titles : {
				"title1":"Would you like to have Dinner tonight !!",
				"title2":"Would you like to order dinner tonight?"
			},
			dinnerNotification : {
				body: "",
				vibrate: [100, 50, 100],
				icon: 'https://push-notification-web.herokuapp.com/images/icon.png',
				image: 'https://push-notification-web.herokuapp.com/images/dinner.jpg',
				actions: [
					{
					  action: 'dinnerYes',
					  title: 'Yes'
					},
					{
					  action: 'dinnerNo',
					  title: 'No'
					}
				]
			},
			optionsNotification : {
				body: "",
				vibrate: [100, 50, 100],
				icon: 'https://push-notification-web.herokuapp.com/images/icon.png',
				image: 'https://push-notification-web.herokuapp.com/images/dinner.jpg',
				actions: [
					{
					  action: 'fruitBowl',
					  title: 'Fruit Bowl'
					},
					{
					  action: 'tiffinDinner',
					  title: 'Dinner'
					}
				]
			}			
		}


//MongoDB URL
const uri = "mongodb+srv://admin-user:admin-user@webpushdb-6hegz.gcp.mongodb.net/test?retryWrites=true&w=majority";

//Check User
app.post('/check-user', function(req, res){
		(async function() {
		  var userStatus = await checkUser(req.body);
		  res.json(userStatus);
		})();
});

//Insert New Subscriber
app.post('/subscriber', function(req, res){
		(async function() {
		  var addedUser = await updatedSubscriber(req.body);
		  res.json(addedUser);
		})();
});

app.post('/update-subscriber', function(req, res){
	console.log(req.body);
		(async function() {
		  await updatedSubscriber(JSON.stringify(req.body));
		  res.json({"status":"yes"});
		})();
});


app.get('/send-notification', function (req, res) {
	sendNotification(pushOptions);
	res.send("Notification Sent!");
});

app.get('/reset-subscriber', function (req, res) {
	resetSubscriber();
	res.send("All Subscriber has been reset for the day");
});

app.get('/',function(req,res){
  res.sendFile(path.join(__dirname+'/index.html'));
  //__dirname : It will resolve to your project folder.
});


var reminderJob = new CronJob('12 0-23/1 * * 1-5', function() {
  sendNotification(pushOptions);
}, null, true, 'Asia/Kolkata');
reminderJob.start();


var resetJob = new CronJob('0 12 * * 1-5', function() {
  resetSubscriber();
}, null, true, 'Asia/Kolkata');
resetJob.start();


//Send notification function
async function sendNotification(pushOptions) {
		var subscribers = await getAllSubscriber();
	  
		var vapidKeys = {
		  publicKey: 'BLb6aIeyzqzi58NGwfM5IjDw01bsJEbdQM4jHSjnYs83uEURDKR27Pw4TtlSelvEGzkVdyIMlU3RVd2KVYSAgcg',
		  privateKey: '0DC1Cgn1KN_fC9yHIFO4ePwA-7PpLIn95jfxYv-Fv60'
		}
		
		push.setVapidDetails('mailto:test@gmail.com', vapidKeys.publicKey, vapidKeys.privateKey);

		for (const subscriber of subscribers) {
			if(subscriber.subscribed && !subscriber.dinnerDone){
				pushOptions = JSON.stringify(pushOptions)
				push.sendNotification(JSON.parse(subscriber.subscription), pushOptions);	
			}
		}
		console.log("Notification Sent!");
	}
	


//Check if user already subscribed
function checkUser(email){
	return new Promise(resolve => {
		MongoClient.connect(uri,{ useUnifiedTopology: true }, function(err, database) {
		  if (err) throw err;
		  var databaseCollection = database.db("web-push-db");
		  databaseCollection.collection("subscriber").find({"email":email}).toArray(function(err, result) {
			if (err) throw err;
			if(result.length === 0){
				resolve({"status":"notAllowed"});
			} else{
				resolve({"status":result[0].subscribed});
			}
			resolve();
			database.close();
		  });
		});
	});
};


//Insert document to db collection
function insertSubscriber(myobj){
	return new Promise(resolve => {
		MongoClient.connect(uri,{ useUnifiedTopology: true }, function(err, database) {
		  if (err) throw err;
		  var databaseCollection = database.db("web-push-db");
		  databaseCollection.collection("subscriber").insertOne(JSON.parse(myobj), function(err, res) {
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
		  databaseCollection.collection("subscriber").find({}).toArray(function(err, result) {
			if (err) throw err;
			resolve(result);
			database.close();
		  });
		});
	})
}

//Update one document from db collection
function updatedSubscriber(userObj){
	userObj = JSON.parse(userObj);
	console.log(userObj);
	return new Promise(resolve => {
		MongoClient.connect(uri,{ useUnifiedTopology: true }, function(err, database) {
			if (err) throw err;
			var databaseCollection = database.db("web-push-db");
			var myquery = { email: userObj.email};
			console.log(userObj);
			if(userObj.subscribed === true || userObj.subscribed === undefined){
				var newvalues = { $set: userObj };
			} else {
				var newvalues = [
									{ $set: userObj },
									{ $unset: [ "subscription", "isDinner", "isTime", "dinnerDone", "timeDone" ] }
								]
			}
			databaseCollection.collection("subscriber").updateOne(myquery, newvalues, function(err, res) {
				if (err) throw err;
				console.log('updated' +  res.result.nModified);
				if(res.result.nModified !== 0){
					resolve({"status":"yes"});
				} else {
					resolve({"status":"no"});
				}				
				database.close();
		  });
		});
	})
}


//Update one document from db collection
function resetSubscriber(){
	return new Promise(resolve => {
		MongoClient.connect(uri,{ useUnifiedTopology: true }, function(err, database) {
			if (err) throw err;
			var databaseCollection = database.db("web-push-db");
			var myquery = { subscribed: true};
			var newvalues = { $set: {dinnerDone: false} };
			
			databaseCollection.collection("subscriber").updateMany(myquery, newvalues, function(err, res) {
				if (err) throw err;
				console.log(res.result.nModified + " document(s) updated");
				resolve({"status":res.result.nModified});				
				database.close();
		  });
		});
	})
}

//Send Email for the day
function sendEmail(){
	var transporter = nodemailer.createTransport({
	  service: 'gmail',
	  auth: {
		user: 'kunal.bendekar@gmail.com',
		pass: 'michelin@2020'
	  }
	});

	var mailOptions = {
	  from: 'kunal.bendekar@gmail.com',
	  to: 'kunal.taku@gmail.com',
	  subject: 'Sending Email using Node.js',
	  html: `<table style="width:100%">
			  <tr>
				<th>Firstname</th>
				<th>Lastname</th> 
				<th>Age</th>
			  </tr>
			  <tr>
				<td>Jill</td>
				<td>Smith</td> 
				<td>50</td>
			  </tr>
			  <tr>
				<td>Eve</td>
				<td>Jackson</td> 
				<td>94</td>
			  </tr>
			</table>`
	};

	transporter.sendMail(mailOptions, function(error, info){
	  if (error) {
		console.log(error);
	  } else {
		console.log('Email sent: ' + info.response);
	  }
	});
}


app.listen(port, function() {
    console.log('Our app is running  ' + port);
});
