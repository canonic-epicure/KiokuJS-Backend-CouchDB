Class('KiokuJS.Backend.CouchDB.Node', {
    
    isa         : 'KiokuJS.Node',
    
    
    has : {
        REV         : null
    },
    

    methods : {
        
        buildEntry   : function () {
            
            var entry = this.SUPER()
            
            if (this.REV != null) entry.REV = this.REV
            
            return entry
        }
    },
    
    
    after : {
        
        consumeEntry : function (entry) {
            this.REV = entry.REV
        }
    },
    

    my : {
        
        methods : {
            
            docFromEntry : function (entry) {
                var doc = Joose.O.copy(entry)
                
                doc._id     = doc.ID
                doc._rev    = doc.REV
                
                delete doc.ID
                delete doc.REV
                
                return doc
            },
            
            
            entryFromDoc : function (doc) {
                doc.REV      = doc._rev
                doc.ID       = doc._id
                
                delete doc._rev
                delete doc._id
                
                return doc
            }
        }
    }
})