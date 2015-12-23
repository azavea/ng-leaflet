(function (angular) {

  // Create all modules and define dependencies to make sure they exist
  // and are loaded in the correct order to satisfy dependency injection
  // before all nested files are concatenated by Gulp

  angular.module('az.leaflet', []);

})(angular);

(function () {
    'use strict';

    function LeafletComponent() {
        return LeafletComponentFactory;
        /**
         * Return a new LeafletComponent directive definition object
         * for use in a directive definition
         *
         * Override component.onMapReady(map) to configure the map
         *
         * See examples/002-basic-directive.html for an example
         */
        function LeafletComponentFactory(directive) {
            var component = angular.extend({}, {
                restrict: 'E',
                require: '^azLeaflet',
                scope: true,
                onMapReady: angular.noop
            }, directive);
            // Assign after creation so that the proper component.onMapReady
            // exists in link function below
            component.link = link;
            return angular.extend({}, component, directive);

            function link(scope, element, attrs, controller) {
                controller.getMap().then(component.onMapReady);
            }
        }
    }

    angular.module('az.leaflet')
        .factory('AZLeafletComponentFactory', LeafletComponent);
})();

(function () {
    'use strict';

    /** Provides access to the leaflet map object instantiated by the directive */
    /*@ngInject*/
    LeafletController.$inject = ["$timeout", "$q"];
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
(function () {
    'use strict';

    /**
     * LeafletData stores references to L.map objects instantiated by the az-leaflet directive.
     */
    /*@ngInject*/
    LeafletData.$inject = ["$log", "$q"];
    function LeafletData($log, $q) {
        var maps = {};

        var module = {
            getMap: getMap,
            setMap: setMap
        };
        return module;

        /**
         * Check the mapId for validity, and if not provided, return the only mapId in LeafletData
         * or throw an error
         *
         * @param  {object} d     cache object, where keys are mapIds and values are L.map instances
         * @param  {string} mapId The map id to lookup, optional.
         * @return {string}       Requested mapId
         */
        function obtainEffectiveMapId(d, mapId) {
            var id;
            var i;
            if (!angular.isDefined(mapId)) {
                if (Object.keys(d).length === 1) {
                    for (i in d) {
                        if (d.hasOwnProperty(i)) {
                            id = i;
                        }
                    }
                } else if (Object.keys(d).length === 0) {
                    id = 'main';
                } else {
                    $log.error('[azavea-ng-leaflet] - You have more than 1 map on the DOM, ' +
                               'you must provide the map ID to the LeafletData.getMap call');
                }
            } else {
                id = mapId;
            }
            return id;
        }

        function setResolvedDefer(d, mapId) {
            var id = obtainEffectiveMapId(d, mapId);
            d[id].resolvedDefer = true;
        }

        function getUnresolvedDefer(d, mapId) {
            var id = obtainEffectiveMapId(d, mapId);
            var defer;

            if (!angular.isDefined(d[id]) || d[id].resolvedDefer === true) {
                defer = $q.defer();
                d[id] = {
                    defer: defer,
                    resolvedDefer: false
                };
            } else {
                defer = d[id].defer;
            }
            return defer;
        }

        function getDefer(d, mapId) {
            var id = obtainEffectiveMapId(d, mapId);
            var defer;

            if (!angular.isDefined(d[id]) || d[id].resolvedDefer === false) {
                defer = getUnresolvedDefer(d, mapId);
            } else {
                defer = d[id].defer;
            }
            return defer;
        }

        /**
         * Save map to LeafletData with the given id
         * @param {L.map} map   Map object to save
         * @param {string} scopeId Unique string key to save the map with
         */
        function setMap(map, scopeId) {
            var defer = getUnresolvedDefer(maps, scopeId);
            defer.resolve(map);
            setResolvedDefer(maps, scopeId);
        }

        /**
         * Get map with the given id. If only one map is saved to LeafletData, the id can be omitted
         * and getMap will return the only map object it is caching.
         *
         * @param  {string} scopeId Optional. Id of map to retrieve from LeafletData
         * @return {promise}        resolved with the ol.Map object
         */
        function getMap(scopeId) {
            var defer = getDefer(maps, scopeId);
            return defer.promise;
        }
    }

    angular.module('az.leaflet')
    .service('AZLeafletData', LeafletData);
})();
(function() {
    'use strict';

    /**
     * Provides defaults for new maps created using the azLeaflet directive.
     *
     * Defaults can be changed at config time via LeafletDefaults.setDefaults()
     */
    /*@ngInject*/
    function LeafletDefaultsProvider() {
        var svc = this;
        var defaults = {
            center: [0,0],
            zoom: 1,
            crs: L.CRS.EPSG3857
        };

        /**
         * Update defaults by merging user-set defaults into defaults object
         * @param {LeafletDefaults} newDefaults
         */
        svc.setDefaults = function (newDefaults) {
            angular.merge(defaults, newDefaults);
        };

        svc.$get = LeafletDefaults;

        /** Read-only wrapper around defaults */
        /*@ngInject*/
        function LeafletDefaults() {
            var module = {
                get: get
            };
            return module;

            /**
             * Return a copy of the current set of defaults
             * @return {LeafletDefaults}
             */
            function get() {
                return angular.extend({}, defaults);
            }
        }
    }

    angular.module('az.leaflet')
        .provider('AZLeafletDefaults', LeafletDefaultsProvider);
})();
(function (angular) {
    'use strict';

    /*@ngInject*/
    azLeaflet.$inject = ["$log", "AZLeafletDefaults", "AZLeafletData"];
    function azLeaflet($log, AZLeafletDefaults, AZLeafletData) {
        var module = {
            restrict: 'E',
            scope: false,
            transclude: true,
            replace: true,
            template: '<div class="azavea-ng-leaflet-map"><div ng-transclude></div></div>',
            controller: 'AZLeafletController',
            controllerAs: 'leaflet',
            bindToController: true,
            link: link
        };
        return module;

        function link(scope, element, attrs, controller) {
            // Reset width/height if set into the new replaced elements
            if (attrs.width) {
                element.css('width', attrs.width);
            }
            if (attrs.height) {
                element.css('height', attrs.height);
            }

            var defaults = AZLeafletDefaults.get();
            var map = new L.map(element[0], defaults);

            controller.setMap(map);
            AZLeafletData.setMap(map, attrs.id);

            // TODO: Delete map on scope.$destroy
            // TODO: Add event to trigger a map.invalidateSize()
        }
    }

    angular.module('az.leaflet')
        .directive('azLeaflet', azLeaflet);

})(angular);