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
    
    
    backend.__createDB().then(function () {
        
        backend.__createView(
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
            
            age     : 50
        })
        

        scope.store(person20, person30, person10, person40, person50).andThen(function () {
            
            scope.search({
                designDoc   : 'search_test',
                view        : 'view1',
                
                startkey    : 20,
                limit       : 3
                
            }).andThen(function (person20) {
                
                t.ok(person20.age == 20, 'Correct object returned first')
                
                Joose.A.each(arguments, function (res, index) {
                    
                    t.ok(res.age == (index + 2) * 10, 'Results come sorted by age #' + (index + 1) )
                    t.ok(res.name == 'person' + (index + 2) * 10, 'Results come sorted by age #' + (index + 1) )
                })
                
                this.CONTINUE()
            })
        })
        
    }).FINALLY(function () {
        
        backend.__deleteDB().now()
        
    }).andThen(function () {
        
        t.endAsync(async0)
        
        t.done()
    })
})    

