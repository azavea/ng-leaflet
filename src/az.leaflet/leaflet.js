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