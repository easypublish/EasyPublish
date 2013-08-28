************
Easy Publish
************

Easy Publish is a simplied tool for publishing metadata into the `Learning Registry`_.


The CouchApp Version
====================

This is a modified version of the original Easy Publish tool, built as a `Kanso`_ CouchApp to
simplify login and management of publishing credentials.


Installation
============

1.  Install a `Learning Registry Node`_.


2.  Install `Node.js`_.

3.  Install `Kanso Tools`_.

4.  Clone Easy Publish:
    
    .. code-block:: bash
    
        git clone https://github.com/jimklo/EasyPublish.git
        cd EasyPublish
        git checkout -b couchapp origin/couchapp       

5.  Install Kanso dependencies

    .. code-block:: bash

        kanso install

6.  Create an ssh connection to your `Learning Registry Node`_ ensuring you have a 
    local port forward mapping to the CouchDB on the node.

    .. code-block:: bash

        ssh lradmin@lrdev.local -L8984:localhost:5984

7.  Install Kanso app

    .. code-block:: bash

        kanso push http://localhost:8984/apps

8.  Access Easy Publish in your web browser

    .. code-block:: bash

        http://lrdev.local/apps/_design/EasyPublish/index.html



.. _Learning Registry: http://learningregistry.org
.. _Learning Registry Node: http://docs.learningregistry.org/en/latest/install/index.html
.. _Kanso: http://kan.so
.. _Kanso Tools: http://kan.so/install
.. _Node.js: http://nodejs.org

