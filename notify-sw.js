var pushData;
var fired = false;
self.addEventListener('push', function(e) {
	pushData = JSON.parse(e.data.text());
	if(!fired){
		e.waitUntil(self.registration.showNotification(pushData.titles.title1, pushData.dinnerNotification));
		fired = true;
	}
});


self.addEventListener('notificationclick', function(event) {
	event.notification.close();
	fired = false;
	if (event.action === 'dinnerYes') {
		orderDinner();
	}
	if (event.action === 'dinnerNo') {
		updateUserOrder({"isDinner.tiffin_dinner": false, "isDinner.fruit_bowl": false, dinnerDone:true});
	}
	if (event.action === 'fruitBowl') {
		updateUserOrder({"isDinner.tiffin_dinner": false, "isDinner.fruit_bowl": true, dinnerDone:true});
	}
	if (event.action === 'tiffinDinner') {
		updateUserOrder({"isDinner.tiffin_dinner": true, "isDinner.fruit_bowl": false, dinnerDone:true});
	}
	if (!event.action) {
		clients.openWindow(pushData.endpointURL).then(windowClient => windowClient ? windowClient.focus() : null)
	}
}, false);


function orderDinner(){
	self.registration.showNotification(pushData.titles.title2, pushData.optionsNotification);
}


function updateUserOrder(orderStatus){
	orderStatus['email'] = pushData.email;
	fetch(pushData.endpointURL+'/update-subscriber', {
		method: 'post',
		headers: {
		  "Content-type": "application/json"
		},
		body: JSON.stringify(orderStatus)
	})
	.then((response) => {
		return response.json();
	})
	.then(function (data) {
		console.log('Request succeeded with JSON response', data.status);

		if(data.status === "expired"){
			var dataObj = {
							body: "",
							icon: 'https://push-notification-web.herokuapp.com/images/icon.png',
							vibrate: [200, 100, 200],
							tag: 'renotifyagain',
							renotify: true
						} 
			self.registration.showNotification("Sorry, we could not receive your dinner order request now. Please try to order in between 12:30 pm to 4:30 pm only", dataObj)
		}
	})
	.catch(function(err) {
		console.log('Fetch Error :-S', err);
	});
}
