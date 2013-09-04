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


    $scope.nodeScope = function nodeScope() {
      return $scope;
    };


    // Root cursor state
    $scope.cursorTo = function cursorTo(scope) {
      if (typeof scope == "undefined") {
        scope = this;
      }
      if ($scope.cursorScope) {
        $scope.cursorScope.cursor = false;
      }
      scope.cursor = true;
      $scope.cursorScope = scope;
    };
    
    $scope.cursorDown = function cursorDown($event) {
      var scope = $scope.cursorScope;
      if (scope.node.children.length && (! scope.collapsed)) {
        return $scope.cursorTo(scope.childHeadNode);
      }
      while (scope.$last && scope.parentNode.parentNode) {
        scope = scope.parentNode;
      }
      if (scope.$last) {
        $log.debug("Cannot move cursor after the last node.");
      } else {
        $scope.cursorTo(scope.nextSiblingNode);
      }};

    $scope.cursorUp = function cursorUp($event) {
      var scope = $scope.cursorScope;
      if (scope.prevSiblingNode &&
          scope.prevSiblingNode.node.children.length &&
          (! scope.prevSiblingNode.collapsed)) {
        return $scope.cursorTo(scope.prevSiblingNode.childTailNode);
      }
      if (scope.$first) {
        if (scope.parentNode.parentNode) {
          $scope.cursorTo(scope.parentNode);
          } else {
            $log.debug("Cannot move cursor before the first node.");
          }
      } else {
        $scope.cursorTo(scope.prevSiblingNode);
      }};

    $scope.cursorRight = function cursorRight($event) {
      if ($scope.cursorScope.node.children.length === 0) {
        $log.debug("Cannot move cursor down into a node without children.");
      } else {
        $scope.cursorScope.collapsed = false;
        $scope.cursorTo($scope.cursorScope.childHeadNode);
      }};

    $scope.cursorLeft = function cursorLeft() {
      if (typeof $scope.cursorScope.parentNode.parentNode == "undefined") {
        $log.debug("Cannot move cursor above the top.");
      } else {
        $scope.cursorTo($scope.cursorScope.parentNode);
      }};


    // expand/collapse

    // node
    $scope.toggleNode = function toggleNode($event) {
      if (! $scope.cursorScope.node.children.length) {
        $log.debug("Cannot expand/collapse nodes without children.");
      } else {
        $scope.cursorScope.collapsed = ! $scope.cursorScope.collapsed;
        $event.preventDefault();
      }};

    // headers
    $scope.toggleHeaders = function toggleHeaders($event) {
      if (! $scope.cursorScope.header_keys.length) {
        $log.debug(
          "Cannot expand/collapse headers for nodes without headers.");
      } else {
        $scope.cursorScope.headersCollapsed = (
          ! $scope.cursorScope.headersCollapsed);
      }};
  })

  .controller('NOrgNodeCtrl', function NOrgNodeCtrl ($scope) {

    $scope.controlName = 'NOrgNodeCtrl';

    // Cursor initialization
    // child nodes must overrid parent to avoid scope inheritance
    // leaking the cursor down
    $scope.cursor = false;
    if (typeof $scope.cursorScope == "undefined") {
      // Cursor defaults to first node
      $scope.cursorTo($scope);
    }

    // Parent/Children processing
    $scope.collapsed = true;
    $scope.parentNode = $scope.$parent.nodeScope();
    $scope.node.children = $scope.node.children || [];

    $scope.childHeadNode = undefined;
    if ($scope.$first) {
      $scope.parentNode.childHeadNode = $scope;
    }

    $scope.childTailNode = undefined;
    $scope.prevSiblingNode = $scope.parentNode.childTailNode;
    if (typeof $scope.prevSiblingNode != "undefined") {
      $scope.prevSiblingNode.nextSiblingNode = $scope;
    }
    $scope.parentNode.childTailNode = $scope;
      
    $scope.nodeScope = function nodeScope() {
      return $scope;
    };

    // Sibling processing
    $scope.siblings = $scope.parentNode.node.children;

    // A list of header names that the UI will care about
    $scope.headersCollapsed = true;
    $scope.headers = {};        // header scopes
  })

  .controller('NOrgHeaderCtrl', function NOrgHeaderCtrl ($scope) {
    $scope.controlName = 'NOrgHeaderCtrl';

    $scope.value = $scope.node.headers[$scope.key];
    $scope.headers[$scope.key] = $scope;
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
