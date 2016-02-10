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
