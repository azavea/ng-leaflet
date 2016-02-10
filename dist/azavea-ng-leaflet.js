(function (angular) {

  // Create all modules and define dependencies to make sure they exist
  // and are loaded in the correct order to satisfy dependency injection
  // before all nested files are concatenated by Gulp

  angular.module('az.leaflet', []);

})(angular);

/**
 * @ngdoc directive
 * @name az.leaflet.directive:azLeafletCenter
 * @restrict 'E'
 * @requires az.leaflet.directive:azLeaflet
 * @scope
 *
 * @description
 * Helper directive to two-way bind the leaflet map center/zoom, must be nested within an
 * {@link az.leaflet.directive:azLeaflet azLeaflet} directive
 *
 * @param {L.LatLng} center - Center of map, watched for changes
 * @param {Integer} zoom - Zoom level of map, watched for changes
 * @param {L.ZoomPanOptions=} options - Zoom/Pan options object to use to control the zoom/pan
 */
(function () {
    'use strict';

    /*@ngInject*/
    function azLeafletCenter() {
        var module = {
            restrict: 'E',
            scope: {
                center: '=',
                zoom: '=',
                options: '='
            },
            require: '^azLeaflet',
            link: function (scope, element, attrs, controller) {

                if (scope.options === null || scope.options === undefined) {
                    scope.options = {};
                }

                scope.$watch('center', onWatchCenter);
                scope.$watch('zoom', onWatchZoom);

                function onWatchCenter(newCenter) {
                    if (newCenter && newCenter.lat && newCenter.lng) {
                        controller.getMap().then(function (map) {
                            map.setView(newCenter, scope.zoom, scope.options);
                        });
                    }
                }

                function onWatchZoom(newZoom) {
                    if (newZoom && newZoom > 0) {
                        controller.getMap().then(function (map) {
                            map.setView(scope.center, newZoom, scope.options);
                        });
                    }
                }
            }
        };
        return module;
    }

    angular.module('az.leaflet')
    .directive('azLeafletCenter', azLeafletCenter);

})();

/**
 * @ngdoc service
 * @name az.leaflet.factory:AZLeafletComponentFactory
 *
 * @description
 * This is purely a helper method to generate new Angular Directive Definition Objects for
 * new azLeaflet directives that the user may want to create.
 *
 * TODO: Document the onMapReady property of the DDO
 *
 * @param {Object} directive - Directive Definition Object that extends the
 *                             AZLeafletComponentFactory defaults
 */
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
    LeafletController.$inject = ["$timeout", "$q"];
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
/**
 * @ngdoc service
 * @name  az.leaflet.service:AZLeafletData
 *
 * @description
 * Handles storage and retrieval of {@link http://leafletjs.com/reference.html#map-class L.map}
 * objects instantiated via {@link az.leaflet.directive:azLeaflet azLeaflet} directive
 */
(function () {
    'use strict';

    /*@ngInject*/
    LeafletData.$inject = ["$log", "$q"];
    function LeafletData($log, $q) {
        var maps = {};

        var module = {

            getMap: getMap,
            setMap: setMap,
            deleteMap: deleteMap
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
         * @ngdoc function
         * @name  az.leaflet.service:AZLeafletData#setMap
         * @methodOf  az.leaflet.service:AZLeafletData
         *
         * @description
         * Save map to AZLeafletData with the given id
         *
         * @param {L.map} map - Map object to save
         * @param {String} scopeId - Unique string key to save the map with, use this id to retrieve
         *                           later with getMap()
         */
        function setMap(map, scopeId) {
            var defer = getUnresolvedDefer(maps, scopeId);
            defer.resolve(map);
            setResolvedDefer(maps, scopeId);
        }

        /**
         * @ngdoc function
         * @name  az.leaflet.service:AZLeafletData#getMap
         * @methodOf  az.leaflet.service:AZLeafletData
         *
         * @description
         * Get map with the given id. If only one map is saved to AZLeafletData, the id can be
         * omitted and getMap will return the only map object it is caching.
         *
         * @param  {String=} scopeId - Id of map to retrieve from AZLeafletData. Optional if
         *                             there is only one initialized map.
         * @return {Promise} Resolves with the requested L.map object
         */
        function getMap(scopeId) {
            var defer = getDefer(maps, scopeId);
            return defer.promise;
        }

        /**
         * @ngdoc function
         * @name  az.leaflet.service:AZLeafletData#deleteMap
         * @methodOf  az.leaflet.service:AZLeafletData
         *
         * @description
         * Remove the map with id from the AZLeafletData cache.
         *
         * DOES NOT remove the map from the DOM or do any other associated cleanup tasks
         *
         * @param  {String=} scopeId - Id of map to delete from AZLeafletData. Optional if
         *                             there is only one initialized map.
         */
        function deleteMap(scopeId) {
            var id = obtainEffectiveMapId(maps, scopeId);
            $log.info(maps, id);
            delete maps[id];
        }
    }

    angular.module('az.leaflet')
    .service('AZLeafletData', LeafletData);
})();
/**
 * @ngdoc object
 * @name az.leaflet.provider:AZLeafletDefaultsProvider
 *
 * @description
 *
 * AZLeafletDefaults provides the default
 * {@link http://leafletjs.com/reference.html#map-options L.MapOptions} object for each new map
 * that is instantiated via the directive
 */
(function() {
    'use strict';

    /*@ngInject*/
    function LeafletDefaultsProvider() {
        var svc = this;
        var defaults = {
            center: [0,0],
            zoom: 1,
            crs: L.CRS.EPSG3857
        };

        /**
         * @ngdoc function
         * @name  az.leaflet.provider:AZLeafletDefaultsProvider#setDefaults
         * @methodOf az.leaflet.provider:AZLeafletDefaultsProvider
         *
         * @description
         * Extend the default AZLeafletDefaults object
         *
         * Default object is:
         * ```
         * var defaults = {
         *     center: [0,0],
         *     zoom: 1,
         *     crs: L.CRS.EPSG3857
         * };
         * ```
         *
         * @param {L.MapOptions} newDefaults - L.MapOptions object to extend the built-in
         *                                     defaults with
         */
        svc.setDefaults = function (newDefaults) {
            angular.merge(defaults, newDefaults);
        };

        svc.$get = LeafletDefaults;

        /**
         * @ngdoc service
         * @name az.leaflet.service:AZLeafletDefaults
         */
        /*@ngInject*/
        function LeafletDefaults() {
            var module = {
                get: get
            };
            return module;

            /**
             * @ngdoc function
             * @name az.leaflet.service:AZLeafletDefaults#get
             * @methodOf az.leaflet.service:AZLeafletDefaults
             *
             * @return {L.MapOptions} Shallow copy of the current AZLeafletDefaults
             */
            function get() {
                return angular.extend({}, defaults);
            }
        }
    }

    angular.module('az.leaflet')
        .provider('AZLeafletDefaults', LeafletDefaultsProvider);
})();
/**
 * @ngdoc directive
 * @name az.leaflet.directive:azLeaflet
 * @restrict 'E'
 * @scope
 *
 * @description
 * Instantiate a new leaflet map on the element, with options, which are not watched for changes
 *
 * A class azavea-ng-leaflet-map is added to the root Leaflet map element
 *
 * This directive does not handle addition of any basemaps, etc. This must all be done in
 * child directives. See `./examples` directory of the source for a detailed example.
 *
 * @param {String=} width - Width of map in px or percentage
 * @param {String=} height - Height of map in px or percentage
 * @param {Object=} options - Default map options to instantiate map with.
 *                            If not provided, {@link az.leaflet.service:AZLeafletDefaults} is used.
 */
(function (angular) {
    'use strict';

    /*@ngInject*/
    azLeaflet.$inject = ["$log", "$timeout", "AZLeafletDefaults", "AZLeafletData"];
    function azLeaflet($log, $timeout, AZLeafletDefaults, AZLeafletData) {
        var module = {
            restrict: 'E',
            scope: {
                options: '@'
            },
            transclude: true,
            replace: true,
            template: '<div class="azavea-ng-leaflet-map"><div ng-transclude></div></div>',
            controller: 'AZLeafletController',
            controllerAs: 'l',
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
            var options = angular.fromJson(attrs.options) || {};
            var opts = angular.extend({}, defaults, options);
            var map = new L.map(element[0], opts);

            controller.setMap(map);
            AZLeafletData.setMap(map, attrs.id);

            scope.$on('$destroy', onScopeDestroy);

            /**
             * @ngdoc event
             * @name az.leaflet.directive:azLeaflet#az.leaflet.invalidatesize
             * @eventOf az.leaflet.directive:azLeaflet
             *
             * @description
             *
             * Trigger `'az.leaflet.invalidatesize'` in your application code to trigger a L.map.invalidateSize()
             * call on the next $digest cycle
             */
            scope.$on('az.leaflet.invalidatesize', controller.invalidateMapSize);

            function onScopeDestroy() {
                map.remove();
                AZLeafletData.deleteMap(attrs.id);
            }
        }
    }

    angular.module('az.leaflet')
        .directive('azLeaflet', azLeaflet);

})(angular);