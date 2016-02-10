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