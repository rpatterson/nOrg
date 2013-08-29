angular.module('nOrg', [
])

  .controller('NOrgCtrl', function NOrgCtrl ($scope, $http) {
    var reserved_headers = {"Subject": true, "Message-ID": true};
    $scope.listChildren = function (parent) {
      // Generate a filter function closure with access to the parent
      // reference
      var previous;
      return function (node) {
        // Process nodes as they are rendered adding utility
        // attributes deduced from the raw JSON.

        // Parent/Children processing
        node.parent = parent;
        node.children = node.children || [];
        node.previous = previous;
        node.classes = [];
        if (typeof node.previous != "undefined") {
          node.classes.push('demotable');
        }

        // Generate a valid HTML ID and CSS selector from the message
        // ID using base64 encoding
        node.id = window.btoa(node.headers["Message-ID"]).slice(0, -1);

        // A list of header names that the UI will care about
        node.header_keys = [];
        for (var key in node.headers) {
          if (!(key in reserved_headers)) {
            node.header_keys.push(key);
          }}

        previous = node;
        return true;
      };
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
      children.splice(children.indexOf(node), 1);

      node.parent = node.previous;
      if (node.previous.children.length == 1) {
        node.previous = undefined;
        node.classes.splice(node.classes.indexOf("demotable"), 1);
      } else {
        node.previous = node.parent.children[-2];
      }
    };

    $scope.promote = function (node) {
      // Promote a node if appropriate
      if (typeof node.parent == "undefined") {
        throw new Error("Cannot promote nodes without parents!");
      }
      previous = node.parent;
      node.parent = node.parent.parent;
      if (typeof node.parent == "undefined") {
        children = $scope.children;
      } else {
        children = node.parent.children;
      }
      children.splice(children.indexOf(previous) + 1, 0, node);
      previous.children.splice(previous.children.indexOf(node), 1);

      if (typeof node.parent == "undefined") {
        node.classes.splice(node.classes.indexOf("promotable"), 1);
      }
    };
  });

//NOrgCtrl.$inject = ['$scope', '$http'];
