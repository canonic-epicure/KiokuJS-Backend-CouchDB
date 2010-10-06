StartTest(function(t) {
    
//    var async0 = t.beginAsync()
    
    //======================================================================================================================================================================================================================================================
    t.diag('Sanity')
    
    t.ok(KiokuJS.Test, "KiokuJS.Test is here")
    t.ok(KiokuJS.Backend.CouchDB, "KiokuJS.Backend.CouchDB is here")
    
    
    var async1 = t.beginAsync()
    
            
    var backend = new KiokuJS.Backend.CouchDB({
        host    : 'local',
        port    : 1234,
        prefix  : 'db',
        
        dbName  : 'test'
//        dbName  : 'kiokujs-backend-couchdb-' + new Date().getTime()
    })
            
//    backend.__createDB().andThen(function () {
        
        var handle = KiokuJS.connect({
            backend : backend
        })
        
        var scope = handle.newScope()
        
        scope.storeAs({ 'kiokumeta' : KiokuJS.meta }).except(function (e) {

            console.log(e)
        
            debugger
            
            t.done()
            
            t.endAsync(async1)
        
        }).andThen(function () {
            
            console.log('success')
            
            t.endAsync(async1)
            
            t.done()
        })
//    })
    
//    
//        },
//        
//        cleanup : function (handle, t) {
//            handle.backend.__deleteDB().now()
//        }
//        
//    }).runAllFixtures().andThen(function () {
//        
//        t.endAsync(async0)
//        
//        t.done()
//    })
})    

