const nodes = {
  "Subject": "nOrg Root Node",
  "$children": [
    {"$basename": "foo",
     "Subject": "Foo Project",
     "Message-ID": "<1@foo.com>"},
    {"$basename": "bar",
     "Subject": "Bar Project",
     "Message-ID": "<2@foo.com>",
     "Bar-Property": "Bar Property",
     "Node-State": "TODO",
     "$children": [
       {"$basename": "corge",
        "Subject": "Corge Node",
        "Message-ID": "<3@foo.com>",
        "Corge-Property": "Corge Property"},
       {"$basename": "grault",
        "Subject": "Grault Node",
        "Message-ID": "<4@foo.com>"},
       {"$basename": "garply",
        "Subject": "Garply Node",
        "Message-ID": "<5@foo.com>"}
   ]},
  {"$basename": "qux",
   "Subject": "Qux Project",
   "Message-ID": "<6@foo.com>"}
]};

export default nodes;
