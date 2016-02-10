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