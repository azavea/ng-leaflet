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
