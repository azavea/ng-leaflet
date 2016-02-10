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