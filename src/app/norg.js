angular.module('nOrg', [
])

  .controller('NOrgCtrl', function NOrgCtrl ($scope, $http) {
    var reserved_headers = {"Subject": true, "Message-ID": true};
    $scope.listChildren = function (parent) {
      var children;
      if (typeof parent == "undefined") {
        children = $scope.children;
      } else {
        children = parent.children;
      }

      // Process nodes adding utility attributes deduced from the raw JSON
      for (var idx in children) {
        var child = children[idx];

        // Parent/Children processing
        child.parent = parent;
        child.siblings = children;
        child.children = child.children || [];
        if (typeof child.parent != "undefined") {
          child.promotable = true;
        }

        // Sibling processing
        child.index = parseInt(idx, 10);
        if (child.index > 0) {
          child.demotable = true;
        }
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

        }
      return children;
    };
    $http.get('app/nodes.json').success(function (data) {
      // Load the initial nodes JSON
      $scope.children = data;
    });

    $scope.demote = function (node) {
      // Demote a node if appropriate
      if (node.index === 0) {
        throw new Error("Cannot promote first sibling!");
      }
      
      var parent = node.siblings[node.index - 1]
      parent.children.push(node);
      node.parent = parent;
      node.siblings.splice(node.index, 1);
      node.siblings = node.parent.children;
      node.index = 0;

      if (node.index == 0) {
        node.demotable = false;
      }
    };

    $scope.promote = function (node) {
      // Promote a node if appropriate
      if (typeof node.parent == "undefined") {
        throw new Error("Cannot promote nodes without parents!");
      }
      var old_parent = node.parent;
      node.parent = node.parent.parent;
      old_parent.siblings.splice(old_parent.index + 1, 0, node);
      old_parent.children.splice(node.index, 1);
      node.index = old_parent.index + 1;

      if (typeof node.parent == "undefined") {
        node.promotable = false;
      }
    };
  });

//NOrgCtrl.$inject = ['$scope', '$http'];
