// Collection is shared between client and server
// var Decks = new Meteor.Collection('Decks');

if (Meteor.isClient) {
  Template.preview.content = function () {
    return getCurrentDeck();
  };

  Template.preview.rendered = function () {
    // console.log('Rendered', this);
    addSections(this.firstNode);
  };

  Template.editor.events({
    'keyup #src' : function (event) {
      // console.log('Keydown in #src', event.currentTarget.value);
      setCurrentDeck(event.currentTarget.value);
    }
  });
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
  return Session.get('src');
}  
function setCurrentDeck (src){
  Session.set('src', src);
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
}

