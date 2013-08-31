angular.module('nOrg', ['ui.bootstrap'
])

  .controller('NOrgCtrl', function NOrgCtrl ($scope, $rootScope, $http, $log) {
    $http.get('app/nodes.json').success(function (node) {
      // Load the initial nodes JSON
      $scope.node = node;
    });

    $scope.setCursor = function (scope) {
      // Move the cursor to the given node
      $rootScope.cursor = scope || $scope;
    };


    $scope.keymap = {
      9: function ($event) {          // tab
        if (! $scope.cursor.node.children.length) {
          $log.debug("Cannot expand/collapse nodes without children.");
        } else {
          $scope.cursor.collapsed = ! $scope.cursor.collapsed;
          $event.preventDefault();
        }},

      38: function () {         // up arrow
        if (typeof $scope.cursor.siblings[
          $scope.cursor.$index - 1] == "undefined") {
          $log.debug("Cannot move cursor before the first child node.");
        } else {
          $scope.setCursor(
            $scope.cursor.siblings[$scope.cursor.$index - 1].scope);
        }},
      40: function () {         // down arrow
        if (typeof $scope.cursor.siblings[
          $scope.cursor.$index + 1] == "undefined") {
          $log.debug("Cannot move cursor after the last child node.");
        } else {
          $scope.setCursor(
            $scope.cursor.siblings[$scope.cursor.$index + 1].scope);
        }},
      39: function () {         // right arrow
        if (typeof $scope.cursor.node.children[0] == "undefined") {
          $log.debug("Cannot move cursor down into a node without children.");
        } else {
          if ($scope.cursor.collapsed) {
            $scope.cursor.collapsed = false;
          }
        $scope.setCursor($scope.cursor.node.children[0].scope);
        }},
      37: function () {         // left arrow
        if (typeof $scope.cursor.parent.parent == "undefined") {
          $log.debug("Cannot move cursor above the top.");
        } else {
        $scope.setCursor($scope.cursor.parent);
        }},

      72: function () {          // h for collapse/expand headers
        if (! $scope.cursor.header_keys.length) {
          $log.debug(
            "Cannot expand/collapse headers for nodes without headers.");
        } else {
          $scope.cursor.headersCollapsed = ! $scope.cursor.headersCollapsed;
        }}
    };
    $scope.keymapAliases = {
      74: 40, 75: 38,  // j/k -> down/up
      87: 38, 83: 40, 65: 37, 68: 39  // w/s/a/d -> up/down/left/right
    };
    for (var from in $scope.keymapAliases) {
      $scope.keymap[from] = $scope.keymap[$scope.keymapAliases[from]];
    }
    $scope.handleKeydown = function ($event) {
      var handler = $scope.keymap[$event.keyCode];
      if (typeof handler != "undefined") {
        handler($event);
      }
    };
  })

  .controller('NOrgNodeCtrl', function NOrgCtrl ($scope, $rootScope) {
    $scope.reserved_headers = {"Subject": true, "Message-ID": true};

    if (typeof $rootScope.cursor == "undefined") {
      // Cursor defaults to first node
      $rootScope.cursor = $scope;
    }
    $scope.node.scope = $scope;

    // Parent/Children processing
    $scope.collapsed = true;
    $scope.parent = $scope.$parent.$parent.$parent;
    $scope.siblings = $scope.parent.node.children;
    $scope.node.children = $scope.node.children || [];
    if (typeof $scope.parent.parent != "undefined") {
      $scope.promotable = true;
    }

    // Sibling processing
    if ($scope.$index > 0) {
      $scope.demotable = true;
      $scope.movableUp = true;
    }
    if ($scope.$index < $scope.siblings.length - 1) {
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

    $scope.demote = function () {
      // Demote a node if appropriate
      if ($scope.$index === 0) {
        throw new Error("Cannot promote first sibling!");
      }
      
      var new_parent = $scope.siblings[$scope.$index - 1];
      new_parent.children.push($scope.node);
      $scope.siblings.splice($scope.$index, 1);
    };

    $scope.promote = function () {
      // Promote a node if appropriate
      if (typeof $scope.parent.siblings == "undefined") {
        throw new Error("Cannot promote nodes without parents!");
      }
      $scope.parent.siblings.splice($scope.parent.$index + 1, 0, $scope.node);
      $scope.parent.node.children.splice($scope.$index, 1);
    };

    $scope.moveUp = function () {
      // Move a node up relative to it's siblings if appropriate
      if ($scope.$index === 0) {
        throw new Error("Cannot move first nodes up!");
      }

      var new_next = $scope.siblings[$scope.$index - 1];
      $scope.siblings.splice($scope.$index - 1, 2, $scope.node, new_next);
    };

    $scope.moveDown = function () {
      // Move a node down relative to it's siblings if appropriate
      if ($scope.$index == $scope.siblings.length - 1) {
        throw new Error("Cannot move last nodes down!");
      }

      var new_previous = $scope.siblings[$scope.$index + 1];
      $scope.siblings.splice($scope.$index, 2, new_previous , $scope.node);
    };

    $scope.isCursor = function () {
      return $scope.cursor === $scope;
    };
  });

//NOrgCtrl.$inject = ['$scope', '$http'];
