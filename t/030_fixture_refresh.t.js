StartTest(function(t) {
    
    var async0 = t.beginAsync()
    
    //======================================================================================================================================================================================================================================================
    t.diag('Sanity')
    
    t.ok(KiokuJS.Test, "KiokuJS.Test is here")
    t.ok(KiokuJS.Backend.CouchDB, "KiokuJS.Backend.CouchDB is here")
    
    
    new KiokuJS.Test({
        t       : t,
        
        fixtures    : [ 'Refresh' ],
        
        connect : function () {
            
            var backend = new KiokuJS.Backend.CouchDB({
                host    : 'local',
                port    : 1234,
                prefix  : 'db',
                
                dbName  : 'kiokujs-backend-couchdb-' + new Date().getTime()
            })
            
            backend.createDB().andThen(function () {
                
                this.CONTINUE(KiokuJS.connect({
                    backend : backend
                }))
            })
        },
        
        cleanup : function (handle, t) {
            handle.backend.deleteDB().now()
        }
        
    }).runAllFixtures().andThen(function () {
        
        t.endAsync(async0)
        
        t.done()
    })
})    