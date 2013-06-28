var fb = require('facebook');
var social = require('social_plus');

var win = Ti.UI.createWindow({
	title: 'Unified Status',
	backgroundColor: '#fff'
});

win.add(Ti.UI.createLabel({
	text : 'Post a message',
	top : 4,
	width: '90%',
	textAlign: Ti.UI.TEXT_ALIGNMENT_LEFT,
	font: {
	    fontSize: '22sp'
	}
}));

var txtStatus = Ti.UI.createTextArea({
	top: 15,
	maxLength: 140,
	height: 100,
	top: 37,
	width: '90%',
	borderWidth: 3,
	borderRadius: 4,
	borderColor: '#000',
	color: '#000',
	font: {
	    fontSize: '16sp'
	}
});

var lblCount = Ti.UI.createLabel({
	text: '0/140',
	top: 134,
	width: '90%',
	textAlign: Ti.UI.TEXT_ALIGNMENT_RIGHT
});

txtStatus.addEventListener('change', function(e) {
	lblCount.text = e.value.length + '/140';

	if (e.value.length > 120) {
		lblCount.color = '#ff0000';
	} else {
		lblCount.color = '#000'
	}

	btnPost.enabled = !(e.value.length === 0);
});

win.add(lblCount);
win.add(txtStatus);

var btnPost = Ti.UI.createButton({
	title: 'Post',
	top: 140,
	width: 150
});

win.add(btnPost);

win.addEventListener('click', function() {
	txtStatus.blur();
});

var bottomView = Ti.UI.createView({
	bottom: 4,
	width: '90%',
	height: Ti.UI.SIZE
});

var fbView = Ti.UI.createImageView({
	backgroundColor: '#3B5998',
	image: 'images/fb-logo-disabled.png',
	borderRadius: 4,
	width: 100,
	left: 10,
	height: 100
});

fbView.addEventListener('click', function() {
	toggleFacebook(!fb.loggedIn);
});

bottomView.add(fbView);

var twitView = Ti.UI.createImageView({
	backgroundColor: '#9AE4E8',
	image: 'images/twitter-logo-disabled.png',
	borderRadius: 4,
	width: 100,
	right: 10,
	height: 100
});

twitView.addEventListener('click', function() {
	toggleTwitter(!twitter.isAuthorized())
});

bottomView.add(twitView);

win.add(bottomView)


function toggleFacebook(isActive) {
	if (isActive) {
		if (!fb.loggedin) {
			fb.authorize();
		}
	} else {
		fb.logout();
	}
}

function toggleTwitter(isActive) {
	if (isActive) {
		if (!twitter.isAuthorized()) {
			 twitter.authorize(function() {
			 	twitView.image = 'images/twitter-logo.png';
			 });
		}
	} else {
		 twitter.deauthorize();
		 twitView.image = 'images/twitter-logo-disabled.png';
	}
}

function postFacebookStatus(status) {
	fb.requestWithGraphPath('me/feed', {
			message: status
		}, "POST", function(e) {
			if (e.success) {
				Ti.API.info("Success!  From FB: " + e.result);
			} else {
				if (e.error) {
					alert(e.error);
					Ti.API.debug(e);
				} else {
					alert("Unkown result from Facebook");
				}
			}
		}
	);
}

function postTwitterStatus(status) {
	twitter.share({
		message: status,
		success: function() {
			alert('Tweeted!');
		},
		error: function() {
			alert('ERROR from Twitter Tweeter');
		}
	});
}


/////////// FACEBOOK
fb.appid = Ti.App.Properties.getString('facebook.appid');
fb.permissions = ['publish_actions'];
fb.forceDialogAuth = true;

fb.addEventListener('login', function(e) {
    if (e.success) {
      	fbView.image = 'images/fb-logo.png';
        Ti.API.debug("http://graph.facebook.com/"+e.uid+"/picture");
      //  Ti.API.info(e);
    } else if (e.error) {
        alert(e.error);
    } else if (e.cancelled) {
        alert("Canceled");
    }
});

fb.addEventListener('logout', function(e) {
    fbView.image = 'images/fb-logo-disabled.png';
});

///////////////// TWITTER
var twitter = social.create({
	consumerSecret : Ti.App.Properties.getString('twitter.consumerSecret'),
	consumerKey : Ti.App.Properties.getString('twitter.consumerKey')
});

btnPost.addEventListener('click', function() {

	if (fb.loggedIn) {
		postFacebookStatus(txtStatus.value);
	}

	if (twitter.isAuthorized()) {
		postTwitterStatus(txtStatus.value);
	}

	txtStatus.blur();
	txtStatus.value = '';
	lblCount.text = '0/140';
});

win.open();