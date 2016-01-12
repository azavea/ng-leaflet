'use strict';

describe('az.leaflet AZLeafletComponentFactory spec', function() {

  beforeEach(module('az.leaflet'));

  var AZLeafletComponentFactory;
  var LeafletController;
  var defaultDDO = {
    restrict: 'E',
    require: '^azLeaflet',
    scope: true,
    onMapReady: angular.noop
  };
  var $scope;

  describe('test AZLeafletComponentFactory', function () {
    beforeEach(inject(function (_AZLeafletComponentFactory_, $controller, $rootScope) {
      AZLeafletComponentFactory = _AZLeafletComponentFactory_;
      $scope = $rootScope.$new();
      LeafletController = $controller('AZLeafletController', {$scope: $scope});
      $scope.$apply();
    }));

    it('should return at least the default directive definition object for a az-leaflet component', function () {
      var ddo = AZLeafletComponentFactory();
      expect(ddo).toEqual(jasmine.objectContaining(defaultDDO));
    });

    it('should allow for override of the default ddo', function () {
        var ddo = AZLeafletComponentFactory({
            onMapReady: onMapReady
        });
        expect(ddo.onMapReady).not.toEqual(defaultDDO.onMapReady);
        expect(ddo.onMapReady).toEqual(onMapReady);

        function onMapReady(map) {
            // do stuff with map
        }
    });

    // TODO: Figure out how to fixup this test
    // it('should call onMapReady eventually after the link function is called', function (done) {
    //     var ddo = AZLeafletComponentFactory({
    //         onMapReady: onMapReady
    //     });
    //     var element = $('<div></div>');
    //     var map = new L.map(element[0]);
    //     LeafletController.setMap(map);

    //     function onMapReady(map) {
    //         done();
    //     }

    //     console.log(LeafletController.getMap);
    //     ddo.link($scope, undefined, undefined, LeafletController);
    // });
  });
});