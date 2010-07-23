COMPONENTS = {
	// a comment
	
	"Core" : [
		"KiokuJS.Backend.CouchDB.Node",
        "KiokuJS.Backend.CouchDB"
	],
	
    
    "WebBundle" : [
    	"jsan:Task.KiokuJS.WebBundle",
    	"+Core"
    ],
    
    
    "NodeJSBundle" : [
        "jsan:Task.KiokuJS.NodeJSBundle",
        "+Core"
    ],
    
    
    "WebTest" : [
        "+WebBundle",
        
        "jsan:Task.KiokuJS.Test"
    ],
    
    
    "NodeJSTest" : [
        "+NodeJSBundle",
        
        "jsan:Task.KiokuJS.Test"
    ]
}