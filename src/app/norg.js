angular.module('nOrg', [
])

  .controller('NOrgCtrl', function NOrgCtrl ($scope, $http) {
    var reserved_headers = {"Subject": true, "Message-ID": true};
    $scope.listChildren = function (parent) {
      if (typeof parent == "undefined") {
        children = $scope.children;
      } else {
        children = parent.children;
      }

      // Process nodes adding utility attributes deduced from the raw JSON
      var previous;
      previous = undefined;
      for (var idx in children) {
        var child = children[idx];

        // Parent/Children processing
        child.parent = parent;
        child.children = child.children || [];

        // Sibling processing
        child.index = parseInt(idx, 10);
        child.previous = previous;
        if (typeof child.previous != "undefined") {
          child.demotable = true;
        }
        if (typeof child.parent != "undefined") {
          child.promotable = true;
        }

        // Generate a valid HTML ID and CSS selector from the message
        // ID using base64 encoding
        child.id = window.btoa(child.headers["Message-ID"]).slice(0, -1);

        // A list of header names that the UI will care about
        child.header_keys = [];
        for (var key in child.headers) {
          if (!(key in reserved_headers)) {
            child.header_keys.push(key);
          }}

        previous = child;
        }
      return children;
    };
    $http.get('app/nodes.json').success(function (data) {
      // Load the initial nodes JSON
      $scope.children = data;
    });

    $scope.demote = function (node) {
      // Demote a node if appropriate
      if (typeof node.previous == "undefined") {
        throw new Error("Cannot promote first sibling!");
      }
      node.previous.children.push(node);

      if (typeof node.parent == "undefined") {
        children = $scope.children;
      } else {
        children = node.parent.children;
      }
      children.splice(node.index, 1);
      node.index = 0;

      node.parent = node.previous;
      if (node.previous.children.length == 1) {
        node.previous = undefined;
        node.demotable = false;
      } else {
        node.previous = node.parent.children[-2];
      }
    };

    $scope.promote = function (node) {
      // Promote a node if appropriate
      if (typeof node.parent == "undefined") {
        throw new Error("Cannot promote nodes without parents!");
      }
      old_parent = node.parent;
      node.parent = node.parent.parent;
      if (typeof node.parent == "undefined") {
        siblings = $scope.children;
      } else {
        siblings = node.parent.children;
      }
      siblings.splice(old_parent.index + 1, 0, node);
      old_parent.children.splice(node.index, 1);
      node.index = old_parent.index + 1;

      if (typeof node.parent == "undefined") {
        node.promotable = false;
      }
    };
  });

//NOrgCtrl.$inject = ['$scope', '$http'];
