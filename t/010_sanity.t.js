StartTest(function(t) {
    
    var async0 = t.beginAsync()
    
    use('KiokuJS.Backend.CouchDB', function () {
        
        //======================================================================================================================================================================================================================================================
        t.diag('Sanity')
        
        t.ok(KiokuJS.Backend.CouchDB, "KiokuJS.Backend.CouchDB is here")
        
        t.endAsync(async0)
        
        t.done()
    })
})    