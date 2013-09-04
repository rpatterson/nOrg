angular.module('nOrg', ['ui.bootstrap', 'ui.keypress'
])

  .controller('NOrgCtrl', function NOrgCtrl($scope, $http, $log) {
    $scope.controlName = 'NOrgCtrl';

    $scope.keydown = {
      'tab': 'toggleNode($event)',
      72: 'toggleHeaders($event)', // h

      'down': 'node.cursorDown($event)',
      'up': 'node.cursorUp($event)',
      'right': 'node.cursorRight($event)',
      'left': 'node.cursorLeft($event)'
    };
    $scope.keydown_aliases = {
      74: 'down',               // j
      75: 'up',                 // k
      87: 'up',                 // w
      83: 'down',               // s
      65: 'left',               // a
      68: 'right'               // d
    };
    for (var alias in $scope.keydown_aliases) {
      $scope.keydown[alias] = $scope.keydown[$scope.keydown_aliases[alias]];
    }

    $http.get('app/nodes.json').success(function loadNode(node) {
      // Load the initial nodes JSON
      $scope.node = nOrg.newRoot(node);
    });

    $scope.toggleNode = function toggleNode($event) {
      $scope.node.toggle($event);
      $event.preventDefault();
    };
    $scope.toggleHeaders = function toggleHeaders($event) {
      $scope.node.toggleHeaders($event);
      $event.preventDefault();
    };
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
