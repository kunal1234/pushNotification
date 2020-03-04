var pushData;
self.addEventListener('push', function(e) {
	pushData = JSON.parse(e.data.text());
	e.waitUntil(self.registration.showNotification(pushData.titles.title1, pushData.dinnerNotification));
});


self.addEventListener('notificationclick', function(event) {
  event.notification.close();
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
}, false);



function orderDinner(){
	self.registration.showNotification(pushData.titles.title2, pushData.optionsNotification);
}

function updateUserOrder(orderStatus){
	orderStatus['email'] = "kunal.bendekar@cgi.com";
	fetch(location.origin+'/update-subscriber', {
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
		console.log('Request succeeded with JSON response', data);
	})
	.catch(function(err) {
		console.log('Fetch Error :-S', err);
	});
}
