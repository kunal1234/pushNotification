var push = require('web-push');
 
//var rootCas = require('ssl-root-cas/latest').create();
 
//rootCas.addFile(__dirname + '/ssl/01-cheap-ssl-intermediary-a.pem').addFile(__dirname + '/ssl/02-cheap-ssl-intermediary-b.pem');
 
// will work with all https requests will all libraries (i.e. request.js)
//require('https').globalAgent.options.ca = rootCas;



app.get('/', function (req, res) {
	var vapidKeys = {
	  publicKey: 'BLb6aIeyzqzi58NGwfM5IjDw01bsJEbdQM4jHSjnYs83uEURDKR27Pw4TtlSelvEGzkVdyIMlU3RVd2KVYSAgcg',
	  privateKey: '0DC1Cgn1KN_fC9yHIFO4ePwA-7PpLIn95jfxYv-Fv60'
	}

	push.setVapidDetails('mailto:test@gmail.com', vapidKeys.publicKey, vapidKeys.privateKey);

	let sub = {"endpoint":"https://fcm.googleapis.com/fcm/send/e8_28gjzbls:APA91bGso4yVoPllgGG0O9XXesWiD3WWYofl6R6DDxBNWQ6RPJFjOfnmujyYol6SqRTHHOtcjpmpuiVIYWVbE8GumouZznF0HA9XPrI4_XhVBsVQaBBb9OG9EtqPSvEuops-wP4ftsvb","expirationTime":null,"keys":{"p256dh":"BKF7ROX3qTxJ5NHMNCEkCu0XZL_0y0nX7eF-ZETgtEZ7cwCYABBTadD30DV8VJNS9TvspGFjpdoBDtVyoP-P-0o","auth":"SEjWPbBwUlF7TQAGEu18cA"}};
	push.sendNotification(sub, "Test Message");
	res.send('Notification Sent!');
});

