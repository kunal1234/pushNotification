var push = require('web-push');
var express = require('express');
var app = express();
//var rootCas = require('ssl-root-cas/latest').create();
 
//rootCas.addFile(__dirname + '/ssl/01-cheap-ssl-intermediary-a.pem').addFile(__dirname + '/ssl/02-cheap-ssl-intermediary-b.pem');
 
// will work with all https requests will all libraries (i.e. request.js)
//require('https').globalAgent.options.ca = rootCas;
var port = process.env.PORT || 8080;


app.get('/', function (req, res) {
	var vapidKeys = {
	  publicKey: 'BLb6aIeyzqzi58NGwfM5IjDw01bsJEbdQM4jHSjnYs83uEURDKR27Pw4TtlSelvEGzkVdyIMlU3RVd2KVYSAgcg',
	  privateKey: '0DC1Cgn1KN_fC9yHIFO4ePwA-7PpLIn95jfxYv-Fv60'
	}

	push.setVapidDetails('mailto:test@gmail.com', vapidKeys.publicKey, vapidKeys.privateKey);

	let sub = {"endpoint":"https://fcm.googleapis.com/fcm/send/cZhxP0tu2oU:APA91bGp_4L3LlHHCmBXaNsJbJIX6AE3f95acX7ovurD6jlwRtDT_mi3k5dTL0C2ZYbhDCLu0vBKOgk_yb6dN0tCEBpRgx2dX1rRhvwVjNWuxVwXjGZWChmmBhBYoDR1KdR7CBr9cJFj","expirationTime":null,"keys":{"p256dh":"BImyrQx_3bSdaJ73aorASMF5LHSX3IskoVs8_hylgLYEsvpAlfbomCVkEwE1CjOz39TbhRJ29u2WLoHBlvQ570w","auth":"VjfZmB22jPPn81R6sQTsRw"}};
	push.sendNotification(sub, "Test Message");
	res.send('Notification Sent!');
});

app.listen(port, function() {
    console.log('Our app is running  ' + port);
});
