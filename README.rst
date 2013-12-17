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

4.  Clone Easy Publish Data Service:
    
    .. code-block:: bash
    
        git clone https://github.com/easypublish/EasyPublish-DataServices.git

5.  Clone Easy Publish:
    
    .. code-block:: bash
    
        git clone https://github.com/easypublish/EasyPublish.git     

6.  Install Kanso dependencies

    .. code-block:: bash

        cd EasyPublish-DataServices
        kanso install
        cd ../EasyPublish
        kanso install

7.  Create an ssh connection to your `Learning Registry Node`_ ensuring you have a 
    local port forward mapping to the CouchDB on the node. You should probably use a different
    terminal session to do this.

    .. code-block:: bash

        ssh lradmin@lrdev.local -L8984:localhost:5984

8.  Install Kanso app

    .. code-block:: bash

        cd ../EasyPublish-DataServices
        kanso push http://localhost:8984/resource_data
        cd ../EasyPublish
        kanso push http://localhost:8984/apps


9.  Access Easy Publish in your web browser

    .. code-block:: bash

        http://lrdev.local/apps/_design/EasyPublish/index.html


Configuration Notes
===================

If you would like to configure 'pretty URLs', a reverse proxy must be configured to redirect to CouchDB's _rewrite service.

NGINX config sample
-------------------

The following rewrite and location should be added to your existing Learning Registry NGINX configuration within the existing `server` block.

    .. code-block:: nginx

        server {

            rewrite /(apps/EasyPublish)$ /$1/ redirect;

            location ~ /apps/EasyPublish {
                rewrite /apps/EasyPublish/(.*) /apps/_design/EasyPublish/_rewrite/$1 break;
                proxy_pass http://127.0.0.1:5984;
                proxy_redirect off;
                proxy_set_header Host $host;
                proxy_set_header X-Real-IP $remote_addr;
                proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
                proxy_set_header X-Forwarded-Ssl on;
            }

        }

.. _Learning Registry: http://learningregistry.org
.. _Learning Registry Node: http://docs.learningregistry.org/en/latest/install/index.html
.. _Kanso: http://kan.so
.. _Kanso Tools: http://kan.so/install
.. _Node.js: http://nodejs.org

