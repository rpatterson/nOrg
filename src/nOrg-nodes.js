const nodes = {
  "Subject": "My Projects",
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
        "Subject": "Corge project task",
        "Message-ID": "<3@foo.com>",
        "Corge-Property": "Corge Property"},
       {"$basename": "grault",
        "Subject": "Grault project task",
        "Message-ID": "<4@foo.com>"},
       {"$basename": "garply",
        "Subject": "Garply project task",
        "Message-ID": "<5@foo.com>"}
   ]},
  {"$basename": "qux",
   "Subject": "Qux Project",
   "Message-ID": "<6@foo.com>"}
]};

export default nodes;
