// Globals
var angular = angular;
var nOrg = nOrg;
angular.module('nOrg', ['ui.bootstrap', 'ui.keypress'])

  .controller('NOrgCtrl', function NOrgCtrl($scope, $http, $modal, $log) {
    var help;
    
    $scope.controlName = 'NOrgCtrl';

    $scope.keydown = nOrg.keydown;

    $http.get('../nOrg-nodes.json').success(function loadNode(object) {
      // Load the initial nodes JSON
      $scope.node = nOrg.newRoot(object);
    });

    $scope.newProperty = function newProperty($event) {
      var property = prompt('New property name', '');
      if ($event) {
        $event.stopPropagation();
      }
      if (! property) {
        return;
      }
      this.node.$cursorObject.$newProperty(property, '', $event);
    };

    $scope.newSibling = function newSibling($event) {
      if (this.node.$cursorIndex !== undefined) {
        $event.target.parentElement.parentElement.parentElement
          .lastElementChild.firstElementChild.lastElementChild.focus();
      } else {
        this.node.$cursorObject.newSibling({}, $event);
      }
    };

    $scope.keydown = nOrg.keydown;

    $scope.openHelp = function openHelp() {
      if (typeof help == "undefined") {
        help = $modal.open({
          templateUrl: 'nOrg-help.tpl.html',
          controller: NOrgCtrl});
        help.result.finally(function closeHelp() {
          help = undefined;
        });
      } else {
        help.dismiss();
      };
    };
  })

  .directive('norgFocus', function norgFocus($timeout) {
    return function (scope, element, attrs) {
      attrs.$observe('norgFocus', function (newValue) {
        if (newValue === 'true') {
          // Use $timeout to avoid triggering a digest while one is in progress
          // https://docs.angularjs.org/error/$rootScope/inprog#triggering-events-programmatically
          $timeout(function setFocus() {
            element[0].focus();
          });
        }
      });
    };
  });

//NOrgCtrl.$inject = ['$scope', '$http'];
