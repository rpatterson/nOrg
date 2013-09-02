angular.module('nOrg', ['ui.bootstrap', 'ui.keypress'
])

  .controller('NOrgCtrl', function NOrgCtrl($scope, $http, $log) {
    $scope.controlName = 'NOrgCtrl';

    $scope.reserved_headers = {"Subject": true, "Message-ID": true};
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
      if ($scope.cursorScope.$last) {
        $log.debug("Cannot move cursor after the last child node.");
        // TODO to next parent
      } else {
        $scope.cursorTo($scope.cursorScope.$parent.$$nextSibling.$$childHead);
      }};

    $scope.cursorUp = function cursorUp($event) {
      if ($scope.cursorScope.$first) {
        $log.debug("Cannot move cursor before the first child node.");
        // TODO to prev parent
      } else {
        $scope.cursorTo($scope.cursorScope.$parent.$$prevSibling.$$childHead);
      }};

    $scope.cursorRight = function cursorRight($event) {
      if ($scope.cursorScope.node.children.length === 0) {
        $log.debug("Cannot move cursor down into a node without children.");
      } else {
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
    if (typeof $scope.parentNode.parentNode != "undefined") {
      $scope.promotable = true;
    }
    $scope.childHeadNode = undefined;
    if ($scope.$first) {
      $scope.parentNode.childHeadNode = $scope;
    }
      
    $scope.nodeScope = function nodeScope() {
      return $scope;
    };

    // Sibling processing
    $scope.siblings = $scope.parentNode.node.children;
    if (! $scope.$first) {
      $scope.demotable = true;
      $scope.movableUp = true;
    }
    if (! $scope.$last) {
      $scope.movableDown = true;
    }

    // Generate a valid HTML ID and CSS selector from the message
    // ID using base64 encoding
    $scope.id = window.btoa($scope.node.headers["Message-ID"]).slice(0, -1);

    // A list of header names that the UI will care about
    $scope.headersCollapsed = true;
    $scope.header_keys = [];
    for (var key in $scope.node.headers) {
      if (!(key in $scope.reserved_headers)) {
        $scope.header_keys.push(key);
      }}
    $scope.headers = {};        // header scopes


    // Moving nodes

    $scope.demote = function demote() {
      // Demote a node if appropriate
      if ($scope.$first) {
        throw new Error("Cannot promote first sibling!");
      }
      
      $scope.siblings[$scope.$index - 1].children.push($scope.node);
      $scope.siblings.splice($scope.$index, 1);
    };

    $scope.promote = function promote() {
      // Promote a node if appropriate
      if (typeof $scope.parentNode.siblings == "undefined") {
        throw new Error("Cannot promote nodes without parents!");
      }
      $scope.parentNode.siblings.splice(
        $scope.parentNode.$index + 1, 0, $scope.node);
      $scope.parentNode.node.children.splice($scope.$index, 1);
    };

    $scope.moveUp = function moveUp() {
      // Move a node up relative to it's siblings if appropriate
      if ($scope.$first) {
        throw new Error("Cannot move first nodes up!");
      }

      var new_next = $scope.siblings[$scope.$index - 1];
      $scope.siblings.splice($scope.$index - 1, 2, $scope.node, new_next);
    };

    $scope.moveDown = function moveDown() {
      // Move a node down relative to it's siblings if appropriate
      if ($scope.$last) {
        throw new Error("Cannot move last nodes down!");
      }

      var new_previous = $scope.siblings[$scope.$index + 1];
      $scope.siblings.splice($scope.$index, 2, new_previous , $scope.node);
    };
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
