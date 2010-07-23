StartTest(function(t) {
    
    var async0 = t.beginAsync()
    
    //======================================================================================================================================================================================================================================================
    t.diag('Sanity')
    
    t.ok(KiokuJS.Test, "KiokuJS.Test is here")
    t.ok(KiokuJS.Backend.CouchDB, "KiokuJS.Backend.CouchDB is here")
    
    
    new KiokuJS.Test({
        t       : t,
        
        init    : function () {
            
            
            
            return KiokuJS.connect({
                backend : new KiokuJS.Backend.CouchDB({
                    host    : 'localhost',
                    
                    dbName  : 'KiokuJS.Backend.CouchDB.' + new Date().getTime()
                })
            })
        }
        
    }).runAllFixtures().andThen(function () {
        
        t.endAsync(async0)
        
        t.done()
    })
})    