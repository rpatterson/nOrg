// Globals
var angular = angular;
var nOrg = nOrg;
angular.module('nOrg', ['ui.bootstrap', 'ui.keypress'])

  .controller('NOrgCtrl', function NOrgCtrl($scope, $http, $log) {
    $scope.controlName = 'NOrgCtrl';

    $scope.keydown = nOrg.keydown;

    $http.get('../nOrg-nodes.json').success(function loadNode(node) {
      // Load the initial nodes JSON
      $scope.node = nOrg.newRoot(node);
    });

    $scope.newProperty = function newProperty($event) {
      this.node.$cursorObject.$newProperty(this.property);
      this.property = '';
    };

    $scope.newSibling = function newSibling($event) {
      if (this.node.$cursorIndex !== undefined) {
        $event.target.parentElement.parentElement.parentElement
          .lastElementChild.firstElementChild.lastElementChild.focus();
      } else {
        this.node.$cursorObject.newSibling();
      }
    };
  })

  .controller('NOrgKeyMap', function NOrgCtrl($scope, $http, $log) {
    $scope.controlName = 'NOrgCtrl';

    $scope.keydown = nOrg.keydown;
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
