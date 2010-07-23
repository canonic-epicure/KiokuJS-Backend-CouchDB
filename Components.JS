COMPONENTS = {
	// a comment
	
	"Core" : [
		"KiokuJS.Backend.CouchDB.Node",
        "KiokuJS.Backend.CouchDB"
	],
	
    
    "WebPrereq" : [
    	"jsan:Task.KiokuJS.WebPrereq",
        "jsan:Task.HTTP.Request.Provider.Web"
    ],
    
    
    "NodeJSPrereq" : [
        "jsan:Task.KiokuJS.NodeJSPrereq",
        "jsan:Task.HTTP.Request.Provider.NodeJS"
    ],
    
    
    "Test" : [
        "jsan:Task.KiokuJS.Test",
        "+Core"
    ]
}