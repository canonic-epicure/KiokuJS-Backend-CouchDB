Class('KiokuJS.Backend.CouchDB', {
    
    isa     : 'KiokuJS.Backend',
    
    use     : [
        Joose.is_NodeJS ? 'HTTP.Request.Provider.NodeJS' : 'HTTP.Request.Provider.XHR',
        
        'KiokuJS.Backend.CouchDB.Node'
    ],
    
    
    has : {
        host            : { required : true },
        port            : 5984,
        dbName          : { required : true },
        
        nodeClass       : Joose.I.FutureClass('KiokuJS.Backend.CouchDB.Node'),
        
        requestProviderClass   : Joose.I.FutureClass(Joose.is_NodeJS ? 'HTTP.Request.Provider.NodeJS' : 'HTTP.Request.Provider.XHR')
    },
    
    
    
    methods : {
        
        getRequest : function (config) {
            return new this.requestProviderClass(config)
        },
        
        
        getURLforCouch : function () {
            return 'http://' + this.host + ':' + this.port 
        },
        
        
        getURLforDB : function () {
            return this.getURLforCouch() + '/' + this.dbName
        }
    },
    
    
    continued : {
        
        methods : {
            
            checkDB : function () {
            },
            
            
            createDB : function () {
                this.getRequest({
                    method          : 'PUT',
                    
                    url             : this.getURLforDB()
                    
                }).andThen(function (res) {
                    
                    var response = eval(res.text)
                    
                    this.CONTINUE(response.ID)
                })
            },
            
            
            deleteDB : function () {
            },
            
            
            insertSingleEntry : function (entry) {
                this.getRequest({
                    method          : 'PUT',
                    
                    url             : this.getURLforDB() + '/' + id,
                    
                    data            : entry
                    
                }).andThen(function (res) {
                    
                    var response = eval(res.text)
                    
                    this.CONTINUE(response.ID)
                })
            },
            
            
            getSingleEntry  : function (id) {
                this.getRequest({
                    method          : 'GET',
                    
                    url             : this.getURLforDB() + '/' + id
                    
                }).andThen(function (res) {
                    
                    this.CONTINUE(res.text)
                })
            },
            
            
            get     : function (idsToGet, scope, mode) {
                var me              = this
                var CONT            = this.CONT
                
                Joose.A.each(idsToGet, function (id) {
                    
                    CONT.AND(function () {
                        me.getSingleEntry(id).ensure(function () {
                            
                            this.CONTINUE(null)
                        }).now()
                    })
                })
                
                CONT.andThen(function () {
                    
                    var entries = Joose.A.map(arguments, function (returned) {
                        return returned[0]
                    })
                    
                    this.CONTINUE(me.deserializeNodes(entries))
                })
            },
            
            
            insert  : function (nodesToInsert, scope, mode) {
                var me              = this
                var CONT            = this.CONT
                
                Joose.A.each(this.serializeNodes(nodesToInsert), function (entry) {
                    
                    CONT.AND(function () {
                        me.insertSingleEntry(entry).ensure(function (e) {
                            
                            if (e.status == 409)
                                this.CONTINUE('Revisions conflict')
                            else
                                this.CONTINUE(null)
                        }).now()
                    })
                })
                
                CONT.andThen(function () {
                    
                    var ids = Joose.A.map(arguments, function (returned, index) {
                        var id = returned[0]
                        
                        if (id == null) throw "Failed to insert node [" + nodesToInsert[ index ] + "]"
                        
                        return id
                    })
                    
                    this.CONTINUE(ids)
                })
            },
            
            
            remove  : function (idsToRemove) {
//                var entries = this.entries
//                
//                Joose.A.each(idsToRemove, function (id) {
//                    delete entries[ id ]
//                })
//                
//                setTimeout(this.getCONTINUE(), 0)
            },
            
            
            exists  : function (idsToCheck) {
//                var entries = this.entries
//                
//                var res = Joose.A.map(idsToCheck, function (id) {
//                    return entries[ id ] != null
//                })
//                
//                var CONTINUE = this.getCONTINUE()
//                
//                setTimeout(function () {
//                    CONTINUE(res)
//                }, 0)
            }
        }
    }

})
