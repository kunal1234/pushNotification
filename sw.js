self.addEventListener('push', function(e) {
	var options = {
		body: "This is Body",
		vibrate: [100, 50, 100]
	}
	e.waitUntil(self.registration.showNotification("Test Message 1", options));
})
