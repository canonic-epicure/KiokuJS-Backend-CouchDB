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
        
        nodeClass       : Joose.I.FutureClass('KiokuJS.Backend.CouchDB.Node'),
        
        requestProviderClass   : Joose.I.FutureClass(Joose.is_NodeJS ? 'HTTP.Request.Provider.NodeJS' : 'HTTP.Request.Provider.XHR')
    },
    
    
    after : {
        
        initialize : function () {
            this.dbURL      = this.dbURL.replace(/\/+$/, '')
            this.prefix     = this.prefix.replace(/\/+$/, '')
        }
    },
    
    methods : {
        
        getRequest : function (config) {
            return new this.requestProviderClass(config)
        },
        
        
        getURLforCouch : function () {
            return 'http://' + this.host + ':' + this.port + '/' + this.prefix 
        },
        
        
        getURLforDB : function () {
            if (this.dbURL) return this.dbURL
            
            return this.getURLforCouch() + '/' + this.dbName
        },
        
        
        parseJSON : function (str) {
            return this.serializer.deserialize(str)
        }
    },
    
    
    
    continued : {
        
        methods : {
            
            __createDB : function () {
                this.getRequest({
                    method          : 'PUT',
                    
                    url             : this.getURLforDB()
                    
                }).andThen(function (res) {
                    
                    this.CONTINUE(this.parseJSON(res.text))
                    
                }, this)
            },
            
            
            __deleteDB : function () {
                this.getRequest({
                    method          : 'DELETE',
                    
                    url             : this.getURLforDB()
                    
                }).andThen(function (res) {
                    
                    this.CONTINUE(this.parseJSON(res.text))
                    
                }, this)
            },
            
            
            __createView : function (designDoc, viewName, map, reduce) {
                
                var doc = {
                    views : {}
                }
                
                var view = doc.views[ viewName ] = {}
                
                view.map = map.toString()
                
                if (reduce) view.reduce = reduce.toString()
                
                var serialized = this.serializer.serialize(doc)
                
                this.insertDocument('_design/' + designDoc, null, serialized, 'store').now()
            },
            
            
            insertDocument : function (id, rev, entry, mode) {
                var me = this
                
                this.getRequest({
                    method          : 'PUT',
                    
                    url             : this.getURLforDB() + '/' + id,
                    
                    data            : entry
                    
                }).except(function (e) {
                    
                    if (e.status == 409) {
                        var response = me.parseJSON(e.text)
                        
                        if (response.error == 'conflict') {
                            
                            if (mode == 'insert')           throw new KiokuJS.Exception.Overwrite({ id : id, newValue : entry })
                            if (!rev && mode == 'update')   throw new KiokuJS.Exception.Update({ message : 'ID = [' + id + ']' })

                            throw new KiokuJS.Exception.Conflict({ message : 'ID = [' + id + ']' + ', revision: ' + rev + ', entry: ' + entry })
                        }
                    }
                    
                    
                    throw new KiokuJS.Exception.Network({
                        nativeEx : e
                    })
                    
                }).andThen(function (res) {
                    
                    var response = me.parseJSON(res.text)
                    
                    if (response.ok) 
                        this.CONTINUE(response.id, response.rev)
                    else
                        throw new KiokuJS.Exception({ message : res.text })
                    
                })
            },
            
            
            getDocument  : function (id, rev) {
                var me = this
                
                this.getRequest({
                    method          : 'GET',
                    
                    url             : this.getURLforDB() + '/' + id,
                    
                    query           : rev ? { rev : rev } : null
                    
                }).except(function (e) {
                    
                    if (e.status == 404)
                        throw new KiokuJS.Exception.LookUp({
                            id      : id,
                            backend : me
                        })
                        
                    throw new KiokuJS.Exception.Network({
                        nativeEx : e
                    })
                    
                }).andThen(function (res) {
                    
                    this.CONTINUE(me.parseJSON(res.text))
                })
            },
            
            
            deleteDocument : function (id, rev) {
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
                    
                    this.CONTINUE(me.parseJSON(res.text))
                })
            },
            
            
            get     : function (idsToGet, mode) {
                var me              = this
                var CONT            = this.CONT
                
                Joose.A.each(idsToGet, function (id) {
                    
                    CONT.AND(function () {
                        me.getDocument(id).now()
                    })
                })
                
                CONT.andThen(function () {
                    
                    var entries = Joose.A.map(arguments, function (returned) {
                        var doc = returned[0]
                        
                        if (doc instanceof KiokuJS.Exception) throw doc
                        
                        return me.nodeClass.entryFromDoc(doc)
                    })
                    
                    this.CONTINUE(entries)
                })
            },
            
            
            insert  : function (entries, mode) {
                var me              = this
                var CONT            = this.CONT
                
                Joose.A.each(entries, function (entry, index) {
                    
                    CONT.AND(function () {
                        
                        var string = me.serializer.serialize(me.nodeClass.docFromEntry(entry))
                        
                        me.insertDocument(entry.ID, entry.REV, string, mode).andThen(function (id, rev) {
                            entry.REV = rev
                            
                            this.CONTINUE()
                        })
                    })
                })
                    
                
                CONT.andThen(function () {
                    
                    Joose.A.each(arguments, function (insertResult) {
                        var res = insertResult[0]
                        
                        if (res instanceof KiokuJS.Exception) throw res
                    })
                    
                    this.CONTINUE(entries)
                })
            },
            
            
            
            remove  : function (entriesOrIds) {
                var me      = this
                var CONT    = this.CONT
                
                Joose.A.each(entriesOrIds, function (entryOrId) {
                    
                    CONT.AND(function () {
                        
                        // entry
                        if (entryOrId === Object(entryOrId))
                            this.deleteDocument(entryOrId.ID, entryOrId.REV).now()
                        else {
                            
                            this.getDocument(entryOrId, null).andThen(function (doc) {
                                
                                this.deleteDocument(doc._id, doc._rev).now()
                            })
                        }
                    })
                })
                
                CONT.andThen(function () {
                    
                    Joose.A.each(arguments, function (res) {
                        if (res[0] instanceof KiokuJS.Exception) throw res[0]
                    })
                    
                    this.CONTINUE()
                })
            },
            
            
            exists  : function (idsToCheck) {
                var me      = this
                var CONT    = this.CONT
                
                Joose.A.each(idsToCheck, function (id) {
                    
                    CONT.AND(function () {
                        
                        this.getDocument(id).now()
                    })
                })
                
                CONT.andThen(function () {

                    var results = Joose.A.map(arguments, function (checkResult) {
                        var res = checkResult[0]
                        
                        if (res instanceof KiokuJS.Exception.LookUp) return false
                        
                        if (res === Object(res) && res._id) return true
                        
                        throw res
                    })
                    
                    this.CONTINUE(results)
                })
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
                    
                    this.CONTINUE(this.parseJSON(res.text))
                    
                }, this)
            },
            
            
            search : function (scope, args) {
                var searchArgs  = Joose.O.copy(args[0])
                
                var view        = searchArgs.view
                var designDoc   = searchArgs.designDoc
                
                delete searchArgs.view
                delete searchArgs.designDoc
                
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
