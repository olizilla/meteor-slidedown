// Encapsulate the api gubbins.
github = {};

github.gists = {

	api: 'https://api.github.com',

	queue: [],

	throttle: 1000 * 1, // 1 second between requests

	list: function (username, cb) {
		this.get(this.api + '/users/' + username + '/gists', cb);
	},

	single: function (gistId, cb) {
		this.get(this.api + '/gists/' + gistId, cb);
	},

	//TODO: belongs elsewhere...
	authenticatedUser: function (cb) {
		this.get(this.api + '/user', cb);
	},

	get: function get (url, opts, cb) {
		
		if(typeof opts === 'function'){ 
			cb = opts;
			opts = {};
		}

		cb = cb || function () { console.log(arguments); };

		if(Meteor.user()){
			var token = Meteor.user().services.github.accessToken;
			opts.access_token = token;
		}

		this.queue.push(function () {

			console.log('Requesting:', url, opts);

			// TODO: Handle blocked & throttled error responses.
			Meteor.http.get(url, { params: opts }, function (error, response) {

				console.log('GOT:', response.statusCode, url);

				if(!response.data){ // bad ju ju
					var errorMsg = "Response lacks requisit data";
					console.log(errorMsg, response);
					cb(errorMsg);
				}

				cb(error, response);
			});    
		});

		console.log('Queued request', url, opts);

		if(!this.queueIntervalId){ // Start the fans.
			this.startRequestQueue();
		}
	},

	startRequestQueue: function(){
		if (github.gists.queueIntervalId) { return }

		return github.gists.queueIntervalId = Meteor.setInterval(function () {

			var nextRequest = github.gists.queue.shift();

			if(nextRequest){

				nextRequest();
			}

		}, github.gists.throttle);
	}
};
