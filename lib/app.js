exports.rewrites = [
    {
        from: "ddoc",
        to: "_show/kanso/_design/EasyPublish"
    },
    {
        from: "css/*",
        to: "css/*"
    },
    {
        from: "js/*",
        to: "js/*"
    },
    {
        from: "img/*",
        to: "img/*"
    },
    {
        from: "lib/*",
        to: "lib/*"
    },
    {
        from: "modules.js",
        to: "modules.js"
    },
    {
        from: "template.csv",
        to: "template.csv"
    },
    {
        from: "tests.html",
        to: "tests.html"
    },
    {
        from: "",
        to: "index.html"
    }
];


exports.shows = {
    kanso: function( doc, req ) {
        if (doc.kanso) {
            delete doc.kanso.config._url;
            delete doc.kanso.config._utils;
        }

        return {
            body: JSON.stringify(doc.kanso || {}),
            headers: {
                "Content-Type": "application/json"
            }
        }
    }
}