Class('KiokuJS.Backend.CouchDB', {
    
    isa     : 'KiokuJS.Backend',
    
    use     : [
        'JSON2',
    
        Joose.is_NodeJS ? 'HTTP.Request.Provider.NodeJS' : 'HTTP.Request.Provider.XHR',
        
        'KiokuJS.Backend.CouchDB.Node',
        
        'KiokuJS.Exception.Format',
        'KiokuJS.Exception.Network',
        'KiokuJS.Exception.LookUp',
        'KiokuJS.Exception.Overwrite', 
        'KiokuJS.Exception.Update',
        'KiokuJS.Exception.Conflict'
    ],
    
    does    : [ 'KiokuJS.Backend.Feature.Overwrite', 'KiokuJS.Backend.Feature.Update' ],
    
    
    has : {
        dbURL           : '',
        
        host            : null,
        port            : 5984,
        prefix          : '',
        
        dbName          : '',
        
        nodeClass       : Joose.I.FutureClass('KiokuJS.Backend.CouchDB.Node')
    },
    
    
    after : {
        
        initialize : function () {
            this.dbURL      = this.dbURL.replace(/\/+$/, '')
            this.prefix     = this.prefix.replace(/\/+$/, '')
        }
    },
    
    
    methods : {
        
        getRequest : function (config) {
            return new HTTP.Request.Provider.getRequest(config)
        },
        
        
        getURLforCouch : function () {
            return 'http://' + this.host + ':' + this.port + '/' + this.prefix 
        },
        
        
        getURLforDB : function () {
            if (this.dbURL) return this.dbURL
            
            return this.getURLforCouch() + '/' + this.dbName
        }
    },
    
    
    
    continued : {
        
        methods : {
            
            __createDB : function () {
                this.getRequest({
                    method          : 'PUT',
                    
                    url             : this.getURLforDB()
                    
                }).andThen(function (res) {
                    
                    this.CONTINUE(this.deserialize(res.text))
                    
                }, this)
            },
            
            
            __deleteDB : function () {
                this.getRequest({
                    method          : 'DELETE',
                    
                    url             : this.getURLforDB()
                    
                }).andThen(function (res) {
                    
                    this.CONTINUE(this.deserialize(res.text))
                    
                }, this)
            },
            
            
            __createView : function (designDoc, viewName, map, reduce) {
                
                var doc = {
                    ID          : '_design/' + designDoc,
                    views       : {}
                }
                
                var view = doc.views[ viewName ] = {}
                
                view.map = map.toString()
                
                if (reduce) view.reduce = reduce.toString()
                
                this.insertEntry(doc, 'store').now()
            },
            
            
            insertEntry : function (entry, mode) {
                var me      = this
                var id      = entry.ID
                var rev     = entry.REV
                var string  = this.serialize(this.nodeClass.docFromEntry(entry))
                
                this.getRequest({
                    method          : 'PUT',
                    
                    url             : this.getURLforDB() + '/' + id,
                    
                    data            : string
                    
                }).except(function (e) {
                    
                    if (e.status == 409) {
                        var response = me.deserialize(e.text)
                        
                        if (response.error == 'conflict') {
                            
                            if (mode == 'insert')           throw new KiokuJS.Exception.Overwrite({ id : id, newValue : string })
                            if (!rev && mode == 'update')   throw new KiokuJS.Exception.Update({ message : 'ID = [' + id + ']' })

                            throw new KiokuJS.Exception.Conflict({ message : 'ID = [' + id + ']' + ', revision: ' + rev + ', entry: ' + string })
                        }
                    }
                    
                    
                    throw new KiokuJS.Exception.Network({
                        nativeEx : e
                    })
                    
                }).andThen(function (res) {
                    
                    var response = me.deserialize(res.text)
                    
                    if (response.ok) 
                        this.CONTINUE({
                            ID      : response.id, 
                            REV     : response.rev
                        })
                    else
                        throw new KiokuJS.Exception({ message : res.text })
                })
            },
            
            
            getEntry  : function (id, mode) {
                var me      = this
                
                this.getRequest({
                    method          : 'GET',
                    
                    url             : this.getURLforDB() + '/' + id
                    
                }).except(function (e) {
                    
                    if (e.status == 404)
                        throw new KiokuJS.Exception.LookUp({
                            id          : id,
                            backendName : me.meta.name
                        })
                        
                    throw new KiokuJS.Exception.Network({
                        nativeEx : e
                    })
                    
                }).andThen(function (res) {
                    
                    var doc = me.deserialize(res.text)
                    
                    this.CONTINUE(me.nodeClass.entryFromDoc(doc))
                })
            },
            
            
            
            removeEntry : function (entry) {
                var id      = entry.ID
                var rev     = entry.REV
                var me      = this
                
                this.getRequest({
                    method          : 'DELETE',
                    
                    url             : this.getURLforDB() + '/' + id,
                    
                    query           : { rev : rev }
                    
                }).except(function (e) {
                    
                    if (e.status == 409)
                        throw new KiokuJS.Exception.Conflict({
                            message : 'Id [' + id + '] not found or revision [' + rev + '] is not current'
                        })
                        
                    throw new KiokuJS.Exception.Network({
                        nativeEx : e
                    })
                    
                }).andThen(function (res) {
                    
                    this.CONTINUE(me.deserialize(res.text))
                })
            },
            
            
            
            removeID  : function (id) {
                this.getEntry(id).andThen(function (entry) {
                    
                    this.removeEntry(entry).now()
                })
            },
            
            
            existsID  : function (id) {
                        
                this.getEntry(id).except(function (e) {
                    
                    if (e instanceof KiokuJS.Exception.LookUp) 
                        this.RETURN(false)
                    else
                        throw e
                    
                }).then(function () {
                    
                    this.CONTINUE(true)
                    
                }).now()
            },
            
            
            queryView : function (designDoc, viewName, query) {
                this.getRequest({
                    method          : 'GET',
                    
                    url             : this.getURLforDB() + '/_design/' + designDoc + '/_view/' + viewName,
                    
                    query           : query
                    
                }).except(function (e) {
                    
                    throw new KiokuJS.Exception.Network({
                        nativeEx : e
                    })
                    
                }).andThen(function (res) {
                    
                    this.CONTINUE(this.deserialize(res.text))
                    
                }, this)
            },
            
            
            search : function (scope, args) {
                var searchArgs  = Joose.O.copy(args[0])
                
                var view        = searchArgs.view
                var designDoc   = searchArgs.designDoc
                
                delete searchArgs.view
                delete searchArgs.designDoc

                // Encode query string values as JSON.
                for (var p in searchArgs) if (searchArgs.hasOwnProperty(p)) {
                  searchArgs[p] = JSON2.stringify(searchArgs[p])
                }
                
                this.queryView(designDoc, view, searchArgs).andThen(function (response) {
                    
                    if (searchArgs.raw) {
                        this.CONTINUE(response)
                        
                        return
                    }
                    
                    var ids = Joose.A.map(response.rows, function (row) {
                        
                        return row.id
                    })
                    
                    scope.lookUp.apply(scope, ids).now()
                })
            }
        }
    }

})
