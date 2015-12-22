'use strict';

describe('az.leaflet spec', function() {

  var module;
  var dependencies;
  dependencies = [];

  var hasModule = function(module) {
    return dependencies.indexOf(module) >= 0;
  };

  beforeEach(function() {
    // Get module
    module = angular.module('az.leaflet');
    dependencies = module.requires;
  });

  it('should test true === true', function () {
    expect(true).to.equal(true);
  });
});