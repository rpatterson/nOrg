// Globals
var angular = angular;
var nOrg = nOrg;
angular.module('nOrg', ['ui.bootstrap', 'ui.keypress'])

  .controller('NOrgCtrl', function NOrgCtrl($scope, $http, $log) {
    $scope.controlName = 'NOrgCtrl';

    $scope.keydown = {
      'tab': 'node.toggle($event)',
      'shift-tab': 'node.toggleProperties($event)',

      'down': 'node.cursorDown($event)',
      'up': 'node.cursorUp($event)',    
      'right': 'node.cursorRight($event)', 
      'left': 'node.cursorLeft($event)',   

      'shift-down': 'node.applyCursor("moveDown", $event)',
      'shift-up': 'node.applyCursor("moveUp", $event)',
      'shift-right': 'node.applyCursor("demote", $event)',
      'shift-left': 'node.applyCursor("promote", $event)',

      'shift-enter': 'shiftEnter($event)'
    };

    $http.get('../nOrg-nodes.json').success(function loadNode(node) {
      // Load the initial nodes JSON
      $scope.node = nOrg.newRoot(node);
    });

    $scope.newProperty = function newProperty($event) {
      this.node.$cursorObject.$newProperty(this.property);
      this.property = '';
    };

    $scope.shiftEnter = function shiftEnter($event) {
      if (this.node.$cursorIndex !== undefined) {
        $event.target.parentElement.parentElement.parentElement
          .lastElementChild.firstElementChild.lastElementChild.focus();
      } else {
        this.node.$cursorObject.newSibling();
      }
    };
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
