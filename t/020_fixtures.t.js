StartTest(function(t) {
    
    var async0 = t.beginAsync()
    
    use([ 'KiokuJS.Test' ], function () {
        
        //======================================================================================================================================================================================================================================================
        t.diag('Sanity')
        
        t.ok(KiokuJS.Test, "KiokuJS.Test is here")
        
        new KiokuJS.Test({
            t       : t,
            
            init    : function () {
                return KiokuJS.connect({
                    backend : new KiokuJS.Backend.Hash()
                })
            }
            
        }).runAllFixtures().then(function () {
            
            t.endAsync(async0)
            
            t.done()
            
        }).now()
    })
})    