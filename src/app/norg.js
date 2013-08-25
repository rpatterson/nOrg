angular.module( 'nOrg', [
])

.controller( 'NOrgCtrl', function NOrgCtrl ( $scope, $location ) {
    var reserved_headers = {"Subject": true, "Message-ID": true};
    $scope.sanitizeNode = function(node) {
      node.id = window.btoa(node.headers["Message-ID"]).slice(0, -1);

      node.header_keys = [];
      for (var key in node.headers) {
        if (!(key in reserved_headers)) {
          node.header_keys.push(key);
        }}
      
      return true;
    };
    $scope.projects = [
      {"path": "/foo.nod",
       "headers": {"Subject": "Foo Project",
                   "Message-ID": "<1@foo.com>"}
      },
      {"path": "/bar/.nod",
       "headers": {"Subject": "Bar Project",
                   "Message-ID": "<2@foo.com>",
                   "Bar-Property": "Bar Property"},
       "children": [
         {"path": "/bar/corge.nod",
          "headers": {"Subject": "Corge Node",
                      "Message-ID": "<3@foo.com>",
                      "Corge-Property": "Corge Property"}},
         {"path": "/bar/grault.nod",
          "headers": {"Subject": "Grault Node",
                      "Message-ID": "<4@foo.com>"}},
         {"path": "/bar/garply.nod",
          "headers": {"Subject": "Garply Node",
                      "Message-ID": "<5@foo.com>"}}
       ]},
      {"path": "/qux/.nod/.nod",
       "headers": {"Subject": "Qux Project",
                   "Message-ID": "<6@foo.com>"}
      }
    ];
})

;

