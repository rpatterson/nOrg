// Globals
var angular = angular;
var nOrg = nOrg;
angular.module('nOrg', ['ui.bootstrap', 'ui.keypress'])

  .controller('NOrgCtrl', function NOrgCtrl($scope, $http, $log) {
    $scope.controlName = 'NOrgCtrl';

    $scope.keydown = {
      'tab': 'node.toggle($event)',
      'shift-tab': 'node.toggleProperties($event)', // h

      'down': 'node.cursorDown($event)', // j, s
      'up': 'node.cursorUp($event)',     // k, w
      'right': 'node.cursorRight($event)',  // d
      'left': 'node.cursorLeft($event)',    // a

      'shift-down': 'node.applyCursor("moveDown", $event)',
      'shift-up': 'node.applyCursor("moveUp", $event)',
      'shift-right': 'node.applyCursor("demote", $event)',
      'shift-left': 'node.applyCursor("promote", $event)',

      'shift-enter': 'node.applyCursor("newSibling", $event, [{}])'
    };

    $http.get('../nOrg-nodes.json').success(function loadNode(node) {
      // Load the initial nodes JSON
      $scope.node = nOrg.newRoot(node);
    });
  })

  .directive('norgFocus', function norgFocus() {
    return function (scope, element, attrs) {
      attrs.$observe('norgFocus', function (newValue) {
        if (newValue === 'true') {
          element[0].focus();
        }
      });
    };
  });

//NOrgCtrl.$inject = ['$scope', '$http'];
