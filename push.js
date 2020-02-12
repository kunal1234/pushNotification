var push = require('web-push');

var vapidKeys = {
  publicKey: 'BA47TgiRKF9UarT9GTpn6aVE7qhCZZ3lLUnw5GFpgfF0To7Yd_IQoDSoNDRO1tbTugyY_ZZ2EiVYoqtInpjb_Lk',
  privateKey: 'ksrIRY3lpqtX94vLVibqvl4Jbgb1GczTVdTsdZidqdU'
}

push.setVapidDetails('mailto:test@gmail.com', vapidKeys.publicKey, vapidKeys.privateKey);

let sub = {"endpoint":"https://fcm.googleapis.com/fcm/send/e8_28gjzbls:APA91bGso4yVoPllgGG0O9XXesWiD3WWYofl6R6DDxBNWQ6RPJFjOfnmujyYol6SqRTHHOtcjpmpuiVIYWVbE8GumouZznF0HA9XPrI4_XhVBsVQaBBb9OG9EtqPSvEuops-wP4ftsvb","expirationTime":null,"keys":{"p256dh":"BKF7ROX3qTxJ5NHMNCEkCu0XZL_0y0nX7eF-ZETgtEZ7cwCYABBTadD30DV8VJNS9TvspGFjpdoBDtVyoP-P-0o","auth":"SEjWPbBwUlF7TQAGEu18cA"}};
push.sendNotification(sub, "Test Message")
