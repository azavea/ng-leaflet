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
