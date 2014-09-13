var Harness

if (typeof process != 'undefined' && process.pid) {
    require('Task/Test/Run/NodeJSBundle')
    
    Harness = Test.Run.Harness.NodeJS
} else 
    Harness = Test.Run.Harness.Browser.ExtJS
        
    

Harness.configure({
	title 	: 'KiokuJS.Backend.CouchDB Test Suite',
    
    preload : [
        '../kiokujs-backend-couchdb-test.js'
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
    '081_fixture_animate_packet.t.js',
    '082_fixture_proxy.t.js',
    '090_fixture_lazy.t.js',

    '099_views.t.js',
    '100_search_basic.t.js',
    
    '200_fixture_feature_overwrite.t.js',
    '300_fixture_stressload_tree.t.js'
)
