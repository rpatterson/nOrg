// Globals
var angular = angular;
var nOrg = nOrg;
angular.module('nOrg', ['ui.bootstrap', 'ui.keypress'])

  .controller('NOrgCtrl', function NOrgCtrl($scope, $http, $log) {
    $scope.controlName = 'NOrgCtrl';

    $scope.keydown = {
      'tab': 'node.toggle($event)',
      '72': 'node.toggleHeaders($event)', // h

      'down 74 83': 'node.cursorDown($event)', // j, s
      'up 75 87': 'node.cursorUp($event)',     // k, w
      'right 68': 'node.cursorRight($event)',  // d
      'left 65': 'node.cursorLeft($event)',    // a

      'shift-down shift-74 shift-83': // j, s
      'node.callCursor("moveDown", $event)',
      'shift-up shift-75 shift-87':   // k, w
      'node.callCursor("moveUp", $event)',
      'shift-right shift-68':         // d
      'node.callCursor("demote", $event)',
      'shift-left shift-65':          // a
      'node.callCursor("promote", $event)'
    };

    $http.get('app/nodes.json').success(function loadNode(node) {
      // Load the initial nodes JSON
      $scope.node = nOrg.newRoot(node);
    });
  })

  .directive('norgCursor', function norgCursor() {
    return function (scope, element, attrs) {
      attrs.$observe('norgCursor', function (newValue) {
        if (newValue === 'true') {
          element[0].focus();
        }
      });
    };
  });

//NOrgCtrl.$inject = ['$scope', '$http'];
