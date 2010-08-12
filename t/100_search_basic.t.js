StartTest(function(t) {
    
    //======================================================================================================================================================================================================================================================
    t.diag('Sanity')
    
    t.ok(KiokuJS.Test, "KiokuJS.Test is here")
    t.ok(KiokuJS.Backend.CouchDB, "KiokuJS.Backend.CouchDB is here")
    t.ok(KiokuJS.Test.Person, "KiokuJS.Test.Person is here")
    
    
    var async0 = t.beginAsync()
    
            
    var dbName  = 'kiokujs-backend-couchdb-' + new Date().getTime()
    
    var backend = new KiokuJS.Backend.CouchDB({
        host    : 'local',
        port    : 1234,
        prefix  : 'db',
        
        dbName  : dbName
    })
    
    
    backend.createDB().then(function () {
        
        backend.createView(
            'search_test', 
            'view1', 
        
            function (doc) {
            
                if (doc.$entry && doc.className == 'KiokuJS.Test.Person') emit(doc.data.age, null)
            }
        ).now()
        
    }).then(function () {
        
        var DB = KiokuJS.connect({
            backend : backend
        })
        
        var scope = DB.newScope()
        
        
        var person10 = new KiokuJS.Test.Person({
            name    : 'person10',
            
            age     : 10
        })
        
        var person20 = new KiokuJS.Test.Person({
            name    : 'person20',
            
            age     : 20
        })
        
        var person30 = new KiokuJS.Test.Person({
            name    : 'person30',
            
            age     : 30
        })

        var person40 = new KiokuJS.Test.Person({
            name    : 'person40',
            
            age     : 40
        })

        var person50 = new KiokuJS.Test.Person({
            name    : 'person50',
            
            age     : 10
        })
        

        scope.store(person10, person20, person30, person40, person50).andThen(function () {
            
            scope.search({
                designDoc   : 'search_test',
                view        : 'view1',
                
                startkey    : 10,
                limit       : 20
                
            }).andThen(function () {
                
                debugger
                
                DB.backend.deleteDB().andThen(function () {
                    t.endAsync(async0)
                    
                    t.done()
                })
            })
        })
        
    }).except(function () {
        
        backend.deleteDB().now()
        
    }).now()
})    

