StartTest(function(t) {

    //======================================================================================================================================================================================================================================================
    t.diag('Sanity')

    t.ok(KiokuJS.Test, "KiokuJS.Test is here")
    t.ok(KiokuJS.Backend.CouchDB, "KiokuJS.Backend.CouchDB is here")
    t.ok(KiokuJS.Test.Person, "KiokuJS.Test.Person is here")


    var async0 = t.beginAsync()


    var backend = new KiokuJS.Backend.CouchDB({
        dbURL   : 'http://local/5984/kiokujs-backend-couchdb-' + new Date().getTime()
    })


    backend.__createDB().then(function () {

        backend.__createView(
            'view_test_createView',
            'person_all',

            function (doc) {

                if (doc.$entry && doc.className == 'KiokuJS.Test.Person') emit(doc, null)
            }
        ).now()

    }).then(function () {
        backend.__createViews('view_test_createViews', {
            person_by_age : {
                map : function (doc) {
                    if (doc.$entry && doc.className == 'KiokuJS.Test.Person') emit(doc.data.age, null)
                }
            },
            person_by_name : {
                map : function (doc) {
                    if (doc.$entry && doc.className == 'KiokuJS.Test.Person') emit(doc.data.name, null)
                }
            }
        }).now()
    }).then(function () {
        var scope = backend.newScope()


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
            // __createView
            scope.search({
                designDoc   : 'view_test_createView',
                view        : 'person_all',
            }).then(function (person20) {
                t.ok(arguments.length === 5, "All stored persons fetched");

                // __createViews

                scope.search({
                    designDoc : 'view_test_createViews',
                    view      : 'person_by_name',
                }).now()
            }).then(function (persons) {
                t.ok(arguments.length === 5)

                scope.search({
                    designDoc : 'view_test_createViews',
                    view      : 'person_by_age'
                }).now();
            }).then(function (persons) {
                t.ok(arguments.length === 5)
                this.CONTINUE()
            }).now()
        })

    }).FINALLY(function () {

        backend.__deleteDB().now()

    }).andThen(function () {

        t.endAsync(async0)

        t.done()
    })
})

