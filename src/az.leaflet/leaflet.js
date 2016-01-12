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
            scope.options = scope.options || {};
            var opts = angular.extend({}, defaults, scope.options);
            var map = new L.map(element[0], opts);

            controller.setMap(map);
            AZLeafletData.setMap(map, attrs.id);

            // TODO: Delete map on scope.$destroy
            // TODO: Add event to trigger a map.invalidateSize()

            scope.$on('$destroy', onScopeDestroy);
            scope.$on('az.leaflet.invalidatesize', onInvalidateSize);

            function onInvalidateSize() {
                $timeout(function () {
                    map.invalidateSize();
                });
            }

            function onScopeDestroy() {
                map.remove();
                AZLeafletData.deleteMap(attrs.id);
            }
        }
    }

    angular.module('az.leaflet')
        .directive('azLeaflet', azLeaflet);

})(angular);