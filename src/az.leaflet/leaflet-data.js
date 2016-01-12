(function () {
    'use strict';

    /**
     * LeafletData stores references to L.map objects instantiated by the az-leaflet directive.
     */
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

        function deleteMap(scopeId) {
            var id = obtainEffectiveMapId(maps, scopeId);
            $log.info(maps, id);
            delete maps[id];
        }
    }

    angular.module('az.leaflet')
    .service('AZLeafletData', LeafletData);
})();