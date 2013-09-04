angular.module('nOrg', ['ui.bootstrap', 'ui.keypress'
])

  .controller('NOrgCtrl', function NOrgCtrl($scope, $http, $log) {
    $scope.controlName = 'NOrgCtrl';

    $scope.keymap = {
      'tab': 'toggleNode($event)',
      'h': 'toggleHeaders($event)',

      'down': 'cursorDown($event)',
      'up': 'cursorUp($event)',
      'right': 'cursorRight($event)',
      'left': 'cursorLeft($event)'
    };
    $scope.keymap_aliases = {
      'j': 'down',
      'k': 'up',
      'w': 'up',
      's': 'down',
      'a': 'left',
      'd': 'right'
    };
    for (var alias in $scope.keymap_aliases) {
      $scope.keymap[alias] = $scope.keymap[$scope.keymap_aliases[alias]];
    }
    $scope.keydown = {};
    for (var key in $scope.keymap) {
      if (key.length === 1) {
        $scope.keydown[key.toUpperCase().charCodeAt()] = $scope.keymap[key];
      } else {
        $scope.keydown[key] = $scope.keymap[key];
      }}


    $http.get('app/nodes.json').success(function loadNode(node) {
      // Load the initial nodes JSON
      $scope.node = node;
    });
  })

  .controller('NOrgNodeCtrl', function NOrgNodeCtrl ($scope) {
    $scope.controlName = 'NOrgNodeCtrl';

    $scope.toggle = function toggle($event) {
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
