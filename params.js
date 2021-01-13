const { ParamDict, addGlobalParam } = Msa.require("params")
const { HeaderPerm } = require("./perm")

class HeaderParamDict extends ParamDict {
    constructor() {
        super()
        this.perm = HeaderPerm.newParam()
    }
}

function addHeaderGlobalParams() {
    addGlobalParam("header", HeaderParamDict)
}

module.exports = { HeaderParamDict, addHeaderGlobalParams }
