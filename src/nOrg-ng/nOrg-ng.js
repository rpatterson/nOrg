// Globals
var angular = angular;
var nOrg = nOrg;
angular.module('nOrg', ['ui.bootstrap', 'ui.keypress'])

  .controller('NOrgCtrl', function NOrgCtrl($scope, $http, $modal, $log) {
    var help;
    
    $scope.controlName = 'NOrgCtrl';

    $http.get('../nOrg-nodes.json').success(function loadNode(object) {
      // Load the initial nodes JSON
      $scope.node = nOrg.defaults.newRoot(object);
    });

    $scope.newSibling = function newSibling($event) {
      if (this.node.$cursorIndex !== undefined) {
        $event.target.parentElement.parentElement.parentElement
          .lastElementChild.firstElementChild.lastElementChild.focus();
      } else {
        this.node.$cursorObject.newSibling({}, $event);
      }
    };

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
 
    $scope.applyCursor = function applyCursor(method, $event, args) {
      var params = [$event];
      if ($event) {
        $event.stopPropagation();
        $event.preventDefault();
      }
      if (args) {
        args.forEach(function pushParam(arg) {
          params.push(arg);
        });
      }
      try {
        this.node.$cursorObject[method].apply(this.node.$cursorObject, params);
      } catch (exception) {
        return false;
      }
      return true;
    };

    $scope.keydown = {
      'tab': 'node.toggle($event)',
      'shift-tab': 'node.toggleProperties($event)',

      'down': 'node.cursorDown($event)',
      'up': 'node.cursorUp($event)',    
      'right': 'node.cursorRight($event)', 
      'left': 'node.cursorLeft($event)',   

      'shift-down': 'applyCursor("moveDown", $event)',
      'shift-up': 'applyCursor("moveUp", $event)',
      'shift-right': 'applyCursor("demote", $event)',
      'shift-left': 'applyCursor("promote", $event)',

      'shift-enter': 'newSibling($event)',
      'ctrl-shift-enter': 'newProperty($event)',
      
      'ctrl-shift-191': 'openHelp()'
    };

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
