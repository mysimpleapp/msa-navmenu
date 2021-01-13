const { PermNum } = Msa.require("user/perm")
const { isAdmin } = Msa.require("user/utils")

const labels = [
    { name: "None" },
    { name: "Read" },
    { name: "Write" },
    { name: "Admin" }]

class HeaderPerm extends PermNum {
    getMaxVal() { return 3 }
    getLabels() { return labels }
    getDefaultValue() { return 2 }
    overwriteSolve(user) {
        if (isAdmin(user)) return 3
    }
}
HeaderPerm.NONE = 0
HeaderPerm.READ = 1
HeaderPerm.WRITE = 2
HeaderPerm.ADMIN = 3

module.exports = { HeaderPerm }