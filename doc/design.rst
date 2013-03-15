==========
Principles
==========

At its core, this software aims to define a simple, re-usable and
extensible format which can be used to describe projects, thoughts,
tasks, collaboration, delegation and many other purposes.  To that
end, it's important to define and describe the principles guiding that
format.

hierarchy of nodes: flexible, arbitrary, and inexpensive
    It should be easy to make child nodes, move nodes up and down the
    hierarchy, and in general capture free-form content structures and
    relationships.  This is the core that most makes `org-mode`_ so
    awesome.

nodes have history
    Nodes may change variously throughout the lifetime of the
    hierarchy and that change history may be reviewed and used for
    other operations.  This is provided with some inconsistency by
    `org-mode`_.

nodes have a lifetime unique identity
    Since it should be easy both to move nodes around and to change a
    node's title/subject and it's important to track node history,
    each node has a unique identity that is constant throughout that
    node's history.  This is provided by a property in `org-mode`_ but
    inconsistently used.

hierarchy mixed with or independent of directory tree
    When working on a project, the files containing node content may
    be tied to the project directory structure such that the node
    files live next to the parts of the project they relate to.  This
    supports managing projects alongside the project content,
    e.g. managing a software project alongside the source code.  In
    the case where node hierarchy is *not* related to project content,
    hidden directories may also be used to contain that portion of the
    node hierarchy.  Both approaches can be mixed in the same
    hierarchy.  This is something that `org-mode`_ can't realistically
    provide given that a whole tree is contained in one file.

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
    node hierarchy much like an object-oriented class hierarchy.  This
    is provided only in parts by `org-mode`_ and isn't as consistent
    or flexible as it would need to be to do many structured data
    operations on a tree.

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
    discretely.  This is the primary departure from `org-mode`_ in
    which a whole hierarchy is in a file.

node content is text/diffable
    All node content should be in a format as human-readable as
    possible, including both the fixed and arbitrary structured data
    in fields and/or properties.  In other words, definitions of
    structured data and their aggregation should trade readability
    over parse-ability where possible.  This facilitates reviewing or
    analyzing structured data across history.  This is somewhat
    possible with `org-mode`_ though through a variety of different
    formats and structures which have to be parsed making it hard to
    make use of.

history managed through version control
    Node content should have no regard for history but should be in a
    format in which history can be easily reflected and used.  Many of
    the other design principles are in support of this.

nodes are like emails
    To ease integration with other systems and since emails and email
    queues are often used as todo/task lists, the node format should
    be as email-like as possible and a node should be able to be sent
    as an email by only adding headers.

collaboration through cryptography
    Nodes may be assigned to entities, be they individuals, groups,
    etc..  Assignment is not considered *accepted*, however, unless
    the assignment is cryptographically signed by one of a set of
    configured identities.

Derivation and Deviation from `org-mode`_
=========================================

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
`org-mode`_ but seek to clearly define a simple core format.


======
Format
======

The following describes and defines a format that serves the principles.

nodes formatted as `MIME messages`_
    Each node formatted as one `MIME message`_.
    
node fields and properties are `MIME header fields`_
    Fields used by the core software should re-use standard header
    fields as much as possible.  Where a field is clearly specific to
    the core software, it will begin with a 'NORG-' prefix.  Arbitrary
    node properties should begin with the 'PROPERTY-' prefix.  Do not
    use the ``X-`` prefix as the `'X-' prefix has became a problem
    itself`_ rather than helping.

nodes are files
    TODO nodes are file in a project hierarchy with an extension
    TODO node hierarchy may be contained in a hidden directory
    TODO the node corresponding to a directory in a project hierarchy

non-textual MIME parts are separate files next to node
    In the hidden directory *or* in the project directory.

node state graphs
    ??? model just the next states possible through fields/properties
    or explicitly model transitions as well?  It's my experience that
    defining transitions is a less-than-fruitful cognitive burden.

node identity through the `Message-Id field`_
    TODO ensure uniqueness from lazy ``Message-ID``s from emails

node field sets may be signed as *fixed* by entities
    Stored in a lower MIME part, preferably last, are cryptographic
    signatures of a set of node fields and other MIME parts.  These
    serve to *lock* those fields and parts for those entities
    signaling the need for reviewing changes by those entities.  Which
    fields/parts are locked can be configured on a per-entity basis
    and inherited up the hierarchy, where those configurations are
    also cryptographically signed.


.. _`MIME parts`: http://en.wikipedia.org/wiki/Multipurpose_Internet_Mail_Extensions#Multipart_messages
.. _`Message-Id field`: http://tools.ietf.org/html/rfc5322#section-3.6.4
.. _`'X-' prefix has become a problem itself`: http://tools.ietf.org/html/rfc6648

.. _`Emacs`: http://www.gnu.org/software/emacs/
.. _`Emacs modes`: http://www.gnu.org/software/emacs/manual/html_node/emacs/Modes.html#Modes

.. _`org-mode`: http://orgmode.org/
.. _`org-mode properties`: http://orgmode.org/org.html#Properties-and-Columns
.. _`org-mode clocktime`: http://orgmode.org/org.html#Clocking-work-time
.. _`org-mode effort estimates`: http://orgmode.org/org.html#Effort-estimates
