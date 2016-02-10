/**
 * @ngdoc controller
 * @name az.leaflet.controller:AZLeafletController
 *
 * @description
 * The controller for the AZLeaflet directive, which provides direct access to the
 * L.map object instantiated for that map. Should only be accessed in child directives
 * via the link function's `controller` argument.
 */
(function () {
    'use strict';

    /** Provides access to the leaflet map object instantiated by the directive */
    /*@ngInject*/
    function LeafletController($timeout, $q) {
        var ctl = this;
        var _map = null;
        initialize();

        function initialize() {
            _map = $q.defer();

            ctl.getMap = getMap;
            ctl.setMap = setMap;
            ctl.invalidateMapSize = invalidateMapSize;
        }

        /**
         * @ngdoc function
         * @name az.leaflet.controller:AZLeafletController#getMap
         * @methodOf az.leaflet.controller:AZLeafletController
         *
         * @description
         * Get a promise reference to the map object created by the directive
         *
         * @return {Promise} Resolves with an L.map object
         */
        function getMap() {
            return _map.promise;
        }

        /** Sets the map object for this controller. Call only once, on directive creation
         * @param {L.map} map The L.map object to use on this controller.
         */
        function setMap(map) {
            _map.resolve(map);

            // This helps in some situations where the map isn't initially rendered correctly due
            // to the container size being changed.
            invalidateMapSize();
        }

        function invalidateMapSize() {
            if (!_map) {
                return;
            }
            $timeout(function() {
                _map.invalidateSize();
            }, 0);
        }
    }

    angular.module('az.leaflet')
        .controller('AZLeafletController', LeafletController);
})();