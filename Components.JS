COMPONENTS = {
	// a comment
	
	"Core" : [
		"KiokuJS.Backend.CouchDB.Node",
        "KiokuJS.Backend.CouchDB"
	],
    
    
    "Prereq" : [
        "jsan:Task.KiokuJS.Prereq",
        "jsan:Task.HTTP.Request.Provider.Auto"
    ],
	
    
    "PureWebPrereq" : [
    	"jsan:Task.KiokuJS.PureWebPrereq",
        "jsan:Task.HTTP.Request.Provider.Web"
    ],
    
    
    "PureNodeJSPrereq" : [
        "jsan:Task.KiokuJS.PureNodeJSPrereq",
        "jsan:Task.HTTP.Request.Provider.NodeJS"
    ],
    
    
    "Test" : [
        "jsan:Task.KiokuJS.Test",
        "+Core"
    ]
}

