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
        }

        /**
         * Get a promise reference to the map object created by the directive
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
            $timeout(function() {
                map.invalidateSize();
            }, 0);
        }
    }

    angular.module('az.leaflet')
        .controller('AZLeafletController', LeafletController);
})();