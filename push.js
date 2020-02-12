var push = require('web-push');

var vapidKeys = {
  publicKey: 'BA47TgiRKF9UarT9GTpn6aVE7qhCZZ3lLUnw5GFpgfF0To7Yd_IQoDSoNDRO1tbTugyY_ZZ2EiVYoqtInpjb_Lk',
  privateKey: 'ksrIRY3lpqtX94vLVibqvl4Jbgb1GczTVdTsdZidqdU'
}

push.setVapidDetails('mailto:test@gmail.com', vapidKeys.publicKey, vapidKeys.privateKey);

let sub = {};
push.sendNotification(sub, "Test Message")