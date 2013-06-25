Keep it Simple Slides
=====================

Slides decks, as markdown, backed by github gists.

The main use case is showing existing gists as slideshows...
Should be able to take any markdown though.

1. Convert markdown HTML + slide markers
2. Display as slideshow
3. Provide a markdown editor.
4. Load markdown from gists.
5. Save markdown to gist.


So whats our data model?

We can have decks without gists and decks with gists

/ 
- welcome to slide down, log in with github, or create a new slide deck.

/anonymous/:id 
- load or create deck
  - load starts slideshow
  - create flips us into edit mode.

/username/:id
- load or create deck
  - load starts slideshow
  - create flips us into edit mode, redirect to /username/:id/edit

/username/:id/edit
- load or die.
- Textarea allows markdown editing and slide preview.


load attempts to load from server, then github, then die.

1. Anonymous + No deck
- Create new deck
- Redirect to /anonymous/:deckId

2. User + No deck
- Show gist list.

3. 


Data
----
We only want to publish the current users info and the current deck to the client.
So we need to add the service tokens to the user data, as autopublish was doing that for us.


User story
----------

- New slide deck: /anonymous/5850901
- Edit, preview, show.
- Save...
  - Login with github
  - Create gist

Find gist url, paste in, create slideshow.

Dealing with edits?
1. Log in to edit... only user can edit. No multiplayer editing, without consent.
2. Edit an anonymous fork.

Seems like version 1 makes most sense.

How gist works
--------------

Gists created by /anonymous are just that... anonymously created gists, anonymous is a special case user with no index page.
They remain forkable if you want to associate it with your user.

https://gist.github.com/anonymous/5850901

