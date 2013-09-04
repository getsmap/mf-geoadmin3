(function() {
  goog.provide('ga_layermanager_directive');

  goog.require('ga_browsersniffer_service');
  goog.require('ga_map_service');

  var module = angular.module('ga_layermanager_directive', [
    'pascalprecht.translate',
    'ga_browsersniffer_service',
    'ga_map_service'
  ]);

  /**
   * Filter for the gaLayermanager directive's ngRepeat. The filter
   * reverses the array of layers so layers in the layer manager UI
   * have the same order as in the map.
   */
  module.filter('gaReverse', function() {
    return function(items) {
      return items.slice().reverse();
    };
  });

  module.directive('gaLayermanager',
      ['gaLayers', 'gaBrowserSniffer', function(gaLayers, gaBrowserSniffer) {
        return {
          restrict: 'A',
          replace: true,
          templateUrl: 'components/layermanager/partials/layermanager.html',
          scope: {
            map: '=gaLayermanagerMap'
          },
          link: function(scope, element, attrs) {
            var map = scope.map;

            scope.mobile = gaBrowserSniffer.mobile;

            // The ngRepeat collection is the map's array of layers. ngRepeat
            // uses $watchCollection internally. $watchCollection watches the
            // array, but does not shallow watch the array items! The array
            // items are OpenLayers layers, we don't want Angular to shallow
            // watch them.

            scope.layers = map.getLayers().getArray();

            // layerFilter is the ngRepeat filter. We filter out background
            // layers and preview layers.
            scope.layerFilter = function(layer) {
              var id = layer.get('id');
              var isBackground = !!gaLayers.getLayer(id) &&
                  gaLayers.getLayerProperty(id, 'background');
              var isPreview = layer.preview;
              return !isBackground && !isPreview;
            };

            scope.getLayerLabel = function(layer) {
              var label;
              var id = layer.get('id');
              if (gaLayers.getLayer(id)) {
                // BOD layer
                label = gaLayers.getLayerProperty(id, 'label');
              } else {
                // Non-BOD layer
                label = layer.get('label');
              }
              return label;
            };

            scope.removeLayerFromMap = function(layer) {
              map.removeLayer(layer);
            };

            scope.moveLayer = function(layer, delta) {
              var index = scope.layers.indexOf(layer);
              var layersCollection = scope.map.getLayers();
              layersCollection.removeAt(index);
              layersCollection.insertAt(index + delta, layer);
            };

            // prevent li’s horizontal scrolling for mobiles
            element.on('touchmove', 'li', function(e) {
              e.preventDefault();
            });

            // Toggle layer tools for mobiles
            element.on('click', '.icon-gear', function() {
              var layertools = $(this).closest('li').find('.layertools');
              layertools.toggleClass('folded');
              $(this).closest('ul').find('.layertools').each(function(i, el) {
                if (el != layertools[0]) {
                  $(el).addClass('folded');
                }
              });
            });

          }
        };
      }]
  );
})();

