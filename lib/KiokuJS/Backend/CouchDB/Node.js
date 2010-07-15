Class('KiokuJS.Backend.CouchDB.Node', {
    
    isa         : 'KiokuJS.Node',
    
    
    has : {
        REV         : null
    },
    

    methods : {
        
        buildEntry   : function () {
            
            var entry = this.SUPER()
            
            if (entry.ID != null) {
                entry._id = entry.ID
                
                delete entry.ID
            }
            
            if (this.REV != null) entry._rev = this.REV
            
            return entry
        }
    }
})