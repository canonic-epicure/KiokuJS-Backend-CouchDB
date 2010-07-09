Class('KiokuJS.Backend.CouchDB', {
    
    isa     : 'KiokuJS.Backend',
    
    use     : Joose.is_NodeJS ? 'HTTP.Request.Provider.NodeJS' : 'HTTP.Request.Provider.XHR',
    
    
    has : {
        dbName          : null,
        
        providerClass   : Joose.I.FutureClass(Joose.is_NodeJS ? 'HTTP.Request.Provider.NodeJS' : 'HTTP.Request.Provider.XHR')
    },
    
    
    
    methods : {
        
        getRequest : function (config) {
            return new this.providerClass(config)
        }
    },
    
    
    continued : {
        
        methods : {
            
            insertSingleEntry : function (entry) {
                
            },
            
            
            getSingleEntry  : function (id) {
            },
            
            
            get     : function (idsToGet) {
                var me              = this
                var CONT            = this.CONT
                
                Joose.A.each(idsToGet, function (id) {
                    
                    CONT.AND(function () {
                        me.getSingleEntry(id).ensure(function () {
                            
                            this.CONTINUE(null)
                            
                        }).now()
                    })
                })
                
                CONT.then(function () {
                    
                    var res = Joose.A.map(arguments, function (returned) {
                        var entry = returned[0]
                        
                        return entry && me.deserializeNode(entry) || null
                    })
                    
                    this.CONTINUE(res)
                    
                }).now()
            },
            
            
            insert  : function (nodesToInsert, scope) {
                var me              = this
                var CONT            = this.CONT
                
                var ids = Joose.A.each(nodesToInsert, function (node) {
                    var entry = me.serializeNode(node)
                    
                    CONT.AND(function () {
                        me.insertSingleEntry(entry).ensure(function () {
                            
                            this.CONTINUE()
                            
                        }).now()
                    })
                    
                    return node.ID
                })
                
                CONT.then(function () {
                    
                    this.CONTINUE(ids)
                    
                }).now()
            },
            
            
            remove  : function (idsToRemove) {
                var entries = this.entries
                
                Joose.A.each(idsToRemove, function (id) {
                    delete entries[ id ]
                })
                
                setTimeout(this.getCONTINUE(), 0)
            },
            
            
            exists  : function (idsToCheck) {
                var entries = this.entries
                
                var res = Joose.A.map(idsToCheck, function (id) {
                    return entries[ id ] != null
                })
                
                var CONTINUE = this.getCONTINUE()
                
                setTimeout(function () {
                    CONTINUE(res)
                }, 0)
                
            }
        }
    }

})
