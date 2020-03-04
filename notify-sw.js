self.addEventListener('push', function(e) {
	console.log(e);
	
	var options = {
		body: "This is Body",
		vibrate: [100, 50, 100]
	}
	e.waitUntil(self.registration.showNotification("Test Message 1", options));
});

/*var title = "";

var options = {
		body: "",
		vibrate: [100, 50, 100],
		icon: 'https://lh5.ggpht.com/8J9XJ8SvK0sWknfjDguzTxebgiYbgz-D0L-EG5Lm0-EdmYApN-H4Ewabh-X3nJw4hn0=w300',
		image: '/dinner.jpg',
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
		
	}
*/	
registration.showNotification(title, options)


self.addEventListener('notificationclick', function(event) {
	console.log(1)
  event.notification.close();
  if (event.action === 'dinnerYes') {
    orderDinner();
  }
  if (event.action === 'dinnerNo') {
	updateUserOrder({"isDinner.tiffin_dinner": false, "isDinner.fruit_bowl": false});
  }
  if (event.action === 'fruitBowl') {
    updateUserOrder({"isDinner.tiffin_dinner": false, "isDinner.fruit_bowl": true});
  }
  if (event.action === 'tiffinDinner') {
    updateUserOrder({"isDinner.tiffin_dinner": true, "isDinner.fruit_bowl": false});
  }
}, false);



function orderDinner(){
	var title = "What would you like to have in dinner?";

	var options = {
			body: "",
			vibrate: [100, 50, 100],
			icon: 'https://lh5.ggpht.com/8J9XJ8SvK0sWknfjDguzTxebgiYbgz-D0L-EG5Lm0-EdmYApN-H4Ewabh-X3nJw4hn0=w300',
			image: '/dinner.jpg',
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
		
	registration.showNotification(title, options);
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
