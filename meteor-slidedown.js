/*
Turning gist markdown into slide shows.

Talk title
==========

WAT?
![Lobster](/lobster-cat.jpg)

- Points
- Need
- Bullets
*/

// Collection is shared between client and server
Decks = new Meteor.Collection('Decks');

if (Meteor.isClient) {

  initAccounts();

  var routes = [
    {name: 'home', fn: showHomepage }, // path = /
    {name: 'user', fn: showUser },     // path = /:username
    {name: 'show', fn: showDeck },     // path = /:username/:deckId
    {name: 'edit', fn: showEditor }    // path = /:username/:deckId/edit
  ];

  var path = getPath();

  var route = routes[path.length];
  
  Meteor.startup(function () {
    
    // Let CSS do the grunt work of altering the layout for a given path.
    $('body').addClass(route.name);

    // DO IT.
    route.fn(path);
  });

  Deps.autorun(function() {
    subscribeToCurrentDeck();
  });

  // Deps.autorun(function () {
  //   loadGithubProfileAndGists();
  // });
  
  // Meteor.subscribe('userData', function(){
  //   console.log('Got userData', Meteor.user());
  // });

  Template.preview.content = function () {
    return getCurrentDeck();
  };

  Template.preview.rendered = function () {
    // console.log('Rendered', this);
    addSections(this.firstNode);
    
    if ($('body').hasClass('show')) {
      createStack();
    }
  };

  Template.editor.events({
    'keyup .src' : function (event) {
      console.log('Keydown in .src', event.currentTarget.value);
      setCurrentDeck(event.currentTarget.value);
    }
  });

  Template.editor.value = function(){
    return getCurrentDeck();
  };
}

// DO magic... we need to eval the markdown, find h1, h2, and add section elements around them...
// - Don't mess with the raw src... we need a processed src, assuming we want to use the standard showdown parser.

function addSections(el) {
  $(el).find('h1,h2,p,ol,ul').wrap('<section class="slide">');

  var images = $(el).find('img').hide();

  images.each(function (index, img){
    var $img = $(img);
    
    // console.log('Image to background',$img.attr('src'), $img.parent());

    // TODO: wat is the find parent method that takes a selector called?
    $img.closest('.slide').addClass('image').css('background-image', 'url(' + $img.attr('src') + ')');
  });
}

function initAccounts () {
  Accounts.ui.config({
    requestPermissions: {
      github: ['gist']
    }
  });
}


// GET /
function showHomepage () {
  // TODO: render homepage template.
}

// GET /:username
function showUser() {
  console.warn('TODO: show user');
}

// GET /:username/:id
function showDeck (path) {
  console.log('Show deck', path);
  findDeck(path);

}

// GET /:username/:id/edit
function showEditor (path) {
  console.log('Show editor', path);
  findDeck(path);
}

function findDeck (path, cb) {
  var deckId = path[1];

  if (!deckId) {
    return console.log('Cannot find Deck ID', path);
  }

  Session.set('deckId', deckId);
}


// Cannot call github raw from XHR. No Cors. Use api.
function loadDeckFromGist (username, gistId) {
  // Meteor.http.get('https://gist.github.com/'+username+'/'+gistId+'/raw', function (err, response) {
  //   if(err) { 
  //     console.log('Failed to load gist', username, gistId);
  //     return;
  //   }

  //   Decks.insert({ _id: gistId, markdown: response.data }, function(err, doc) {
  //     Session.set('deckId', doc._id);
  //   });
  // })
}

function createNewDeck () {
  Decks.insert({markdown:'Talk Title\n=========='}, function(err, deckId){

    Session.set('deckId', deckId);

    setPath(deckId, '/edit/'+ deckId);

    console.log('Created new deck', deckId);
  });
}

// temp helper, we're gonna replace session with a shared collection later
function getCurrentDeck () {
  var deckId = Session.get('deckId');
  var deck = Decks.findOne(deckId);
  if (deck){
    return deck.markdown;  
  }
}

function setCurrentDeck (src){
  var deckId = Session.get('deckId');
  var deck = Decks.findOne(deckId);
  console.log('Setting deck', src, deck);
  if (deck){
    Decks.update(deckId, {markdown: src});
  }
}

function getPath() {
  var path = window.location.pathname;
  
  console.log('Found path', path);

  if (!path || path.length < 2) { 
    return [];
  }

  // remove the first slash
  path = path.substring(1);

  return path.split('/');
}

function setPath(name, path) {
  history.pushState({}, name, path);
}

// Called reactively when deckId changes
function subscribeToCurrentDeck () {
  
  var deckId = Session.get('deckId');

  if (!deckId) { return }

  Meteor.subscribe('oneDeck', deckId, function(){
    console.log('Subcribed to oneDeck', deckId, Decks.find().fetch());

    if (deckId && !Decks.findOne(deckId) ){
      console.warn("TODO: load gist from github");
    }
  });
}

function loadGithubProfileAndGists() {

  var user = Meteor.user();
    
  if (!user || !user.services.github.accessToken) {
    console.log('No accessToken for', user);
    return;
  }
  
  // We need to get the users login before we can get their gists.
  github.gists.authenticatedUser(function (err, response) {
    if (err || !response.data) {
      return;
    }
    
    console.log('Updating user profile', response);
    
    Meteor.users.update(user._id, { $set: { profile: response.data} });

    if (Meteor.user().gists) {
      // TODO: updating the profile causes this to re-run, ans so we infinite looping.
      return;
    }

    github.gists.list(response.data.login, function (err, response) {
      if (err || !response.data) {
        return;
      }  
      console.log('Updating user gists', response);
      Meteor.users.update(user._id, { $set: { 'profile.gists': response.data} });
    });
  });
}

if (Meteor.isServer) {
  Meteor.startup(function () {
    // code to run on server at startup
  });

  Meteor.publish('oneDeck', function(deckId){
    return Decks.find(deckId);
  });

  Meteor.publish("userData", function () {
    return Meteor.users.find({_id: this.userId}, {fields: {'services.github': 1 }});
  });

  // Accounts.onCreateUser(function (options, user) {

  //   console.log('onCreateUser', options, user);

  //   if (options.profile) {
  //     user.profile = options.profile;
  //   }

  //   github.gists.authenticatedUser(function (response) {
  //     console.log('Updating user profile', response.data);
  //     if (response.data) {
  //       user.profile = response.data;
  //     }
  //   });

  //   return user;
  // });
}
