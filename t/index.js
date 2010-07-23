var Harness

if (typeof process != 'undefined' && process.pid) {
    require('Task/Test/Run/NodeJSBundle')
    
    Harness = Test.Run.Harness.NodeJS
} else 
    Harness = Test.Run.Harness.Browser.ExtJS
        
    
var INC = [ '../lib', '/jsan' ]


Harness.configure({
	title 	: 'KiokuJS.Backend.CouchDB Test Suite',
    
    preload : Joose.is_NodeJS ? [
        'Task.KiokuJS.Backend.CouchDB.NodeJSPrereq',
        {
            text : "JooseX.Namespace.Depended.Manager.my.INC = " + JSON.stringify(INC)
        },
        'Task.KiokuJS.Backend.CouchDB.Test'
        
    ] : [
        'Task.KiokuJS.Backend.CouchDB.WebPrereq',
        {
            text : "JooseX.Namespace.Depended.Manager.my.INC = " + Ext.encode(Harness.absolutizeINC(INC))
        },
        'Task.KiokuJS.Backend.CouchDB.Test'
    ]
})


Harness.start(
	'010_sanity.t.js',
    '020_fixtures.t.js'
)
