var navmenuApp = module.exports = App.subApp()

// db
var navmenusCol = require("../../msa-db/server").collection("navmenus")
// user
require("../../msa-user/server")

// read //////////////////////////////////////////////////////////////

var getNavmenuAsPartial = function(req, res, next) {
	navmenusCol.findOne({}, function(err, navmenu) {
		if(err) return next(err)
		if(!navmenu) navmenu = {content:"<msa-box style='top:10px; left:30px;'><a href='/' style='color:#4C9CF1; font-size: 36px; font-weight:bold'>MySimpleApp</a></msa-box><msa-box style='bottom:10px; right:10px;'><a href='/user/login'>Log in</a><a href='javascript:App.post(\"/user/logout\", null, App.user)'>Log out</a></msa-box>"}
		navmenu.editable = isEditable(req.user)
		navmenu.fetch = false
		res.partial = navmenuApp.buildPartial('../msa-navmenu.html', navmenu)
		next()
	})
}

navmenuApp.get("/", getNavmenuAsPartial)
navmenuApp.getAsPartial = getNavmenuAsPartial



// write //////////////////////////////////////////////////////////////////

navmenuApp.post("/", function(req, res, next) {
	var navmenu = req.body
	if(!isEditable(req.user)) return next("You are not allowed to update this navmenu.")
	navmenusCol.update({}, navmenu, {upsert:true}, function(err, result) {
		if(err) return next(err)
		res.json({done:true})
	})
})

// common ///////////////////////////////////////////////////////////////////

var isEditable = function(user) {
	return (user!==undefined && user.groups.indexOf("admin")!==-1)
}
