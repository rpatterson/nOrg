==========
Principles
==========

Most of the design principles are taken from what makes the `Emacs`_
organizing mode, `org-mode`_, great to work with and so powerful to
use.  Originally, I think it was valuable that `org-mode`_ files were
just specially formatted plain text `org-mode`_ just built on that
format like other `Emacs modes`_.  As the `org-mode`_ feature set
became much more powerful, however, the complexity of the format made
`org-mode`_ files unreadable as plain text and makes the software much
more difficult to work with.  Also, having all the power of
`org-mode`_ bound to `Emacs`_ greatly limits the options for
integrating it with other systems or extending it.  Finally, there are
several pieces of `org-mode`_ that have grown organically which could
be much more powerful if they were more abstracted and flexible.  For
all these reasons, the design principles are largely similar to
`org-mode`_ but seek to clearly define a simple core format or
protocol.

hierarchy of nodes: flexible, arbitrary, and inexpensive
    It should be easy to make child nodes, move nodes up and down the
    hierarchy, and in general capture free-form content structures and
    relationships.  This is the core that most makes `org-mode`_ so
    awesome.

hierarchy mixed with or independent of directory tree
    When working on a project, the files containing node content may
    be tied to the project directory structure such that the node
    files live next to the parts of the project they relate to.  This
    supports managing projects alongside the project content,
    e.g. managing a software project alongside the source code.  In
    the case where node hierarchy is *not* related to project content,
    hidden directories may also be used to contain that portion of the
    node hierarchy.  Both approaches can be mixed in the same hierarchy.

nodes contain arbitrary structured data: fields/properties
    At a minimum, a node contains a ``Subject`` field which serves as
    the node's title or short description.  But nodes may contain
    other fields.  Some other fields are fixed as a part of the core
    field set and are similar to those used in emails.  There may also
    be arbitrary fields which correspond to `org-mode properties`_.

property definitions are controlled in the node hierarchy
    When using arbitrary fields as properties containing structured
    data, the structure of the data in that field is controlled by
    other fields or properties which override each other going up the
    node hierarchy much like an object-oriented class hierarchy.

properties may aggregate arbitrarily
    Some core/fixed fields and arbitrary properties may also define
    how they are aggregated up the hierarchy or across history.  This
    includes summing duration times such as time worked or time
    estimates but may also include other arbitrary ways to aggregate
    structured data up a node hierarchy.  This is inspired by the
    minimal handling of `org-mode clocktime`_ and `org-mode effort
    estimates`_.

nodes may contain unstructured content: e.g. body text
    While the treatment of structured node content is very important,
    the most important design principle is that the tool gets out of
    the way of capturing arbitrary content.  As such, nodes may
    contain at least one unstructured content area, possibly more.
    These may correspond to `MIME parts`_.

nodes are files
    Every node is a file such that tracking node content changes,
    structured or otherwise, across history can be reviewed more
    discretely.

node content is text/diffable
    All node content should be in a format as human-readable as
    possible, including both the fixed and arbitrary structured data
    in fields and/or properties.  In other words, definitions of
    structured data and their aggregation should trade readability
    over parse-ability where possible.  This facilitates reviewing or
    analysing structured data across history.

history managed through version control
    Many of the other design principles are in support of this
    principle, that node content should have no regard for history but
    should be in a format in which history can be easily reflected and
    used.


.. _`MIME parts`: http://en.wikipedia.org/wiki/Multipurpose_Internet_Mail_Extensions#Multipart_messages

.. _`Emacs`: http://www.gnu.org/software/emacs/
.. _`Emacs modes`: http://www.gnu.org/software/emacs/manual/html_node/emacs/Modes.html#Modes

.. _`org-mode`: http://orgmode.org/
.. _`org-mode properties`: http://orgmode.org/org.html#Properties-and-Columns
.. _`org-mode clocktime`: http://orgmode.org/org.html#Clocking-work-time
.. _`org-mode effort estimates`: http://orgmode.org/org.html#Effort-estimates
