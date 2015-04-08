(function (document) {
  'use strict';

  // Grab a reference to our auto-binding template
  // and give it some initial binding values
  // Learn more about auto-binding templates at http://goo.gl/Dx1u2g
  var app = document.querySelector('#app');

  var firstRun = function() {
    console.log('Our app is ready to rock!');

    // add some data-binding variables to the bound template
    app.appName = 'Demo App';
    app.listViewConfig = [];
    app.listViewAttributes = {};

    // initialize and show YouTube list first
    initListViewYouTube();
    initUserConfigParameters();
  };

  // Listen for template bound event to know when bindings
  // have resolved and content has been stamped to the page
  app.addEventListener('template-bound', function() {
    firstRun();

    app.feedSourceSelected = function(event, detail, sender) {
      var selected = detail.item.attributes.name.value;

      if (selected === 'youtube') {
        initListViewYouTube();
      } else if (selected === 'welt') {
        initListViewRSS();
      }
      initUserConfigParameters();
    };
  });

  // event callback which is invoked when the radio button is tapped/clicked
  app.itemChanged = function(event, detail, sender) {
    var propName = sender.attributes['data-prop'].value;  // propName has changed
    app.listViewAttributes[propName] = sender.value;
  };

  // configures the user input fields with the default values
  var initUserConfigParameters = function() {
    var publishedProps = PhListView.prototype.publish;
    var validPropValues = {
      feed: 'any URL',
      handleAs: 'rss || json || xml (depends on URLs response type)',
      viewType: 'default || compact',
      sortByDateAsc: 'true || false'
    };

    var arr = [];
    for (var propName in publishedProps) {
      arr.push({ name: propName, value: app.listViewAttributes[propName], validPublishValues: validPropValues[propName] });
    }
    app.listViewConfig = arr;
  };

  // inits the component with an example RSS feed
  var initListViewRSS = function() {
    app.listViewAttributes = {
        feed: 'http://www.welt.de/wirtschaft/webwelt/?service=Rss',
        handleAs: 'rss',
        viewType: 'default',
        sortByDateAsc: 'true'
    };
  };

  // inits the component with an example / custom XML feed
  var initListViewYouTube = function() {
    // Configure how to handle the response and return the result array
    app.$.listView.setResponseParseFunc(function (response) {
      var xmlNodeTree = response.querySelectorAll('entry'); // we only use the <entry>s

      var entries = [];
      for (var i = 0; i < xmlNodeTree.length; i++) {
        var node = xmlNodeTree[i];
        var media = node.querySelector('group');

        entries.push({
          title: node.querySelector('title').textContent,
          date: node.querySelector('published').textContent,
          link: node.querySelector('link[rel="alternate"]').getAttribute('href'),
          rating: node.querySelector('rating').getAttribute('average'),
          viewCount: node.querySelector('statistics').getAttribute('viewCount'),
          category: media.querySelector('category').getAttribute('label'),
          description: media.querySelector('description').textContent,
          duration: media.querySelector('duration').getAttribute('seconds'),
          thumb: media.querySelectorAll('thumbnail')[0].getAttribute('url')
        });
      }

      return entries;
    });

    app.listViewAttributes = {
      feed: 'http://gdata.youtube.com/feeds/api/videos/',
      handleAs: 'xml',
      viewType: 'default',
      sortByDateAsc: false
    };
  };

// wrap document so it plays nice with other libraries
// http://www.polymer-project.org/platform/shadow-dom.html#wrappers
})(wrap(document));
