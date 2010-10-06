StartTest(function(t) {
    
    var async0 = t.beginAsync()
    
    //======================================================================================================================================================================================================================================================
    t.diag('Sanity')
    
    t.ok(KiokuJS.Test, "KiokuJS.Test is here")
    t.ok(KiokuJS.Backend.CouchDB, "KiokuJS.Backend.CouchDB is here")
    
    
    new KiokuJS.Test({
        t       : t,
        
        fixtures    : [ 'ObjectGraph' ],
        
        connect : function () {
            
            var handle = new KiokuJS.Backend.CouchDB({
                host    : 'local',
                port    : 1234,
                prefix  : 'db',
                
                dbName  : 'kiokujs-backend-couchdb-' + new Date().getTime()
            })
            
            handle.__createDB().andThen(function () {
                
                this.CONTINUE(handle)
            })
        },
        
        cleanup : function (handle, t) {
            handle.__deleteDB().now()
        }
        
    }).runAllFixtures().andThen(function () {
        
        t.endAsync(async0)
        
        t.done()
    })
})    