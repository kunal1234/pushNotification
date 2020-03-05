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

app.get('/send-email', function (req, res) {
	sendEmailNotification();
	res.send("Email Sent!!");
});

app.get('/',function(req,res){
  res.sendFile(path.join(__dirname+'/index.html'));
  //__dirname : It will resolve to your project folder.
});


var reminderJob = new CronJob('0 12-20/1 * * 1-5', function() {
  sendNotification(pushOptions);
}, null, true, 'Asia/Kolkata');
reminderJob.start();


var resetJob = new CronJob('0 12 * * 1-5', function() {
  resetSubscriber();
}, null, true, 'Asia/Kolkata');
resetJob.start();


var SendEmailConfirmation = new CronJob('45 16 * * 1-5', function() {
  sendEmailNotification();
}, null, true, 'Asia/Kolkata');
SendEmailConfirmation.start();


//Send notification function
async function sendNotification(pushOptions) {
		var subscribers = await getAllSubscriber();
	  
		var vapidKeys = {
		  publicKey: 'BLb6aIeyzqzi58NGwfM5IjDw01bsJEbdQM4jHSjnYs83uEURDKR27Pw4TtlSelvEGzkVdyIMlU3RVd2KVYSAgcg',
		  privateKey: '0DC1Cgn1KN_fC9yHIFO4ePwA-7PpLIn95jfxYv-Fv60'
		}
		
		push.setVapidDetails('mailto:test@gmail.com', vapidKeys.publicKey, vapidKeys.privateKey);

		for (const subscriber of subscribers) {
			if(subscriber.subscribed && !subscriber.dinnerDone && subscriber.email === "kunal.bendekar@cgi.com"){
				var options = JSON.stringify(pushOptions);
				console.log("test" + options);
				console.log("test" + JSON.parse(subscriber.subscription));
				push.sendNotification(JSON.parse(subscriber.subscription), options);	
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
	return new Promise(resolve => {
		MongoClient.connect(uri,{ useUnifiedTopology: true }, function(err, database) {
			if (err) throw err;
			var databaseCollection = database.db("web-push-db");
			var myquery = { email: userObj.email};
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
			var newvalues = { $set: {"isDinner.tiffin_dinner": false, "isDinner.fruit_bowl": false, dinnerDone:false} };
			
			databaseCollection.collection("subscriber").updateMany(myquery, newvalues, function(err, res) {
				if (err) throw err;
				console.log(res.result.nModified + " document(s) updated");
				resolve({"status":res.result.nModified});				
				database.close();
		  });
		});
	})
}

// Capitalize String
function capitalizeFirstLetter(str) {
    str = str.split(" ");
    for (var i = 0, x = str.length; i < x; i++) {
        str[i] = str[i][0].toUpperCase() + str[i].substr(1);
    }
    return str.join(" ");
}


//Send Email for the day
async function sendEmailNotification(){
	
	var subscribers = await getAllSubscriber();
	
	var date_ob = new Date();
	
	// current date
	// adjust 0 before single digit date
	var date = ("0" + date_ob.getDate()).slice(-2);

	// current month
	var month = ("0" + (date_ob.getMonth() + 1)).slice(-2);
	
	// current year
	var year = date_ob.getFullYear();
	
	var tableRow = "<tr><th align='left' bgcolor='#ffff00'>Date: "+date + "-" + month + "-" + year+"</th><th align='left' bgcolor='#ffff00'></th></tr><tr><th align='left' bgcolor='#51e7ff'>Email</th><th align='left' bgcolor='#51e7ff'>Dinner Choice</th></tr>";
	
	for (const subscriber of subscribers) {
		if(subscriber.subscribed && (subscriber.isDinner.tiffin_dinner || subscriber.isDinner.fruit_bowl)){
			if(subscriber.isDinner.tiffin_dinner){
				var dinnerChoice = "Dinner";
			}
			if(subscriber.isDinner.fruit_bowl){
				var dinnerChoice = "Fruit Bowl";
			}
			
			var fullName = subscriber.email;
			fullName = fullName.split('@')[0].split('.');
			fullName = fullName[0] +' '+ fullName[ fullName.length-1 ]

			tableRow = tableRow + "<tr><td align='left'>"+capitalizeFirstLetter(fullName)+"</td><td align='left'>"+dinnerChoice+"</td></tr>"
		}
	}
		
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
	  subject: date + "-" + month + "-" + year + ' Dinner confirmation list',
	  html: `<table width="400" border="1" cellpadding="5" cellspacing="0">`+tableRow+`</table>`
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
