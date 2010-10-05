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
    
    '020_fixture_object_graph.t.js',
    '030_fixture_refresh.t.js',
    '040_fixture_update.t.js',
    '050_fixture_remove.t.js',
    '060_fixture_traits.t.js',
    '070_fixture_intrinsic.t.js',
    '080_fixture_immutable.t.js',
    '090_fixture_lazy.t.js',
    
    '100_search_basic.t.js',
    
    '200_fixture_feature_overwrite.t.js',
    '300_fixture_stressload_tree.t.js'
)
