StartTest(function(t) {
    
    var async0 = t.beginAsync()
    
    //======================================================================================================================================================================================================================================================
    t.diag('Sanity')
    
    t.ok(KiokuJS.Test, "KiokuJS.Test is here")
    t.ok(KiokuJS.Backend.CouchDB, "KiokuJS.Backend.CouchDB is here")
    
    
    new KiokuJS.Test({
        t       : t,
        
        fixtures    : [ 'AnimatePacket' ],
        
        connect : function () {
            
            var backend = new KiokuJS.Backend.CouchDB({
                dbURL   : 'http://local/5984/kiokujs-backend-couchdb-' + new Date().getTime()
            })
            
            backend.__createDB().andThen(function () {
                
                this.CONTINUE(backend)
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