'use strict';

describe('az.leaflet azLeaflet directive spec', function() {

  beforeEach(module('az.leaflet'));

  describe('test az-leaflet directive', function () {
    var $compile;
    var $rootScope;
    beforeEach(inject(function (_$compile_, _$rootScope_) {
        $compile = _$compile_;
        $rootScope = _$rootScope_;
    }));

    it('should set no width/height by default', function () {
      var scope = $rootScope.$new();
      var element = $compile('<az-leaflet></az-leaflet>')(scope);
      expect(element.css('width')).toEqual('0px');
      expect(element.css('height')).toEqual('0px');
    });

    it('should set a default css class on the element', function () {
      var scope = $rootScope.$new();
      var element = $compile('<az-leaflet></az-leaflet>')(scope);
      expect(element.hasClass('azavea-ng-leaflet-map')).toBe(true);
    });

    it('should set the width style if width attr is provided', function () {
      var scope = $rootScope.$new();
      var element = $compile('<az-leaflet width="100%"></az-leaflet>')(scope);
      expect(element.css('width')).toEqual('100%');
    });

    it('should set the height style if height attr is provided', function () {
      var scope = $rootScope.$new();
      var element = $compile('<az-leaflet height="100%"></az-leaflet>')(scope);
      expect(element.css('height')).toEqual('100%');
    });
  });
});