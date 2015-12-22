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

  // it('should load config module', function() {
  //   expect(hasModule('az.leaflet.config')).to.be.ok;
  // });


  // it('should load filters module', function() {
  //   expect(hasModule('az.leaflet.filters')).to.be.ok;
  // });



  // it('should load directives module', function() {
  //   expect(hasModule('az.leaflet.directives')).to.be.ok;
  // });



  // it('should load services module', function() {
  //   expect(hasModule('az.leaflet.services')).to.be.ok;
  // });
});