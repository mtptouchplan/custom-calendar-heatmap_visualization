looker.plugins.visualizations.add({
    create: function(element, config) {
      element.innerHTML = "<h3>Hello, Looker!</h3>";
    },
    updateAsync: function(data, element, config, queryResponse, details, done) {
      // Just display a static message, ignoring data for now
      element.innerHTML = "<h3>Hello, Looker! Your custom viz is working.</h3>";
      done();
    }
  });
  