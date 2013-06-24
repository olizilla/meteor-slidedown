// Collection is shared between client and server
var Decks = new Meteor.Collection('Decks');

if (Meteor.isClient) {
  
  var path = getPath();
  
  if (path && (path[0] === 'edit' || path[0] === 'show')){
    Session.set('mode', path[0]);

    var deckId = path[1];
    Session.set('deckId', deckId);

    console.log('Loading', deckId);

    Meteor.startup(function () {
      $('body').addClass(path[0]);
    })

  } else {
    // Create new...

    Decks.insert({markdown:'Talk Title\n=========='}, function(err, deckId){
      Session.set('deckId', deckId);
      setPath(deckId, '/edit/'+ deckId);
    });
    console.log('Creating new deck');
  }

  Deps.autorun(function(){
    var deckId = Session.get('deckId');
    Meteor.subscribe('oneDeck', deckId, function(){
      console.log('Subcribed to oneDeck', Decks.find().fetch());
      // if ($('.src').val() === ''){
      //   $('.src').val(getCurrentDeck());
      // }
    });
  });

  Template.preview.content = function () {
    return getCurrentDeck();
  };

  Template.preview.rendered = function () {
    // console.log('Rendered', this);
    addSections(this.firstNode);
  };

  Template.editor.events({
    'keyup .src' : function (event) {
      console.log('Keydown in .src', event.currentTarget.value);
      setCurrentDeck(event.currentTarget.value);
    }
  });

  Template.editor.value = function(){
    return getCurrentDeck()
  }
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
    $img.parent().parent().addClass('image').css('background-image', 'url(' + $img.attr('src') + ')');
  });
}

/*
Talk title
==========

WAT?
![Lobster](/lobster-cat.jpg)

- Points
- Need
- Bullets

What's all the fuss about?

*/


// temp helper, we're gonna replace session with a shared collection later
function getCurrentDeck () {
  // return Session.get('src');
  var deck = Decks.findOne();
  if (deck){
    return deck.markdown;  
  }
}

function setCurrentDeck (src){
  var deck = Decks.findOne();
  console.log('Setting deck', src, deck)
  if (deck){
    Decks.update({_id: deck._id}, {markdown: src});
  }
}

function getPath() {
  var path = window.location.pathname;
  
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








if (Meteor.isServer) {
  Meteor.startup(function () {
    // code to run on server at startup
  });

  Meteor.publish('oneDeck', function(deckId){
    return Decks.find(deckId);
  });
}

