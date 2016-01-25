'use strict';

describe('az.leaflet AZLeafletController spec', function() {

  beforeEach(module('az.leaflet'));

  var LeafletController;
  var $scope;
  var $timeout;

  describe('test AZLeafletController', function () {
    beforeEach(inject(function ($controller, $rootScope, _$timeout_) {
      $timeout = _$timeout_;
      $scope = $rootScope.$new();
      LeafletController = $controller('AZLeafletController', {$scope: $scope});
      $scope.$apply();
    }));
  });
});
