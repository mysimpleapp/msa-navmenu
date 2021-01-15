const exp = module.exports = {}

const FIELDS = [ "head", "body", "updatedBy", "updatedAt" ]

exp.Header = class {

    formatForDb() {
        const res = {}
        FIELDS.forEach(f => res[f] = this[f])
        return res
    }

    parseFromDb(dbHeader) {
        FIELDS.forEach(f => this[f] = dbHeader[f])
    }

    static newFromDb(dbHeader) {
        const header = new this()
        if (dbHeader) header.parseFromDb(dbHeader)
        return header
    }
}