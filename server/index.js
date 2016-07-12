var navmenuApp = module.exports = App.subApp()

// require userApp, as default header use user-login box
require("../../msa-user/server")
// sheet
var sheetApp = require("../../msa-sheet/server")

// register navmenu sheets
sheetApp.registerSheet("navmenu", {
	creatableBy: {group: "admin"},
	boxType: "boxes",
	content: {
		owner: {group: "admin"},
		box: {
			style: { "margin":"0", "height":"100px", "border-bottom": "4px solid #4C9CF1", "box-shadow": "0 0 3px 2px #aaa" },
			boxes: {
				"1": {
					type: "text",
					style: { "position":"absolute", "top":"10px", "left":"30px" },
					html: "<a href='/' style='color:#4C9CF1; font-size: 36px; font-weight:bold'>MySimpleApp</a>"
				},
				"2": {
					type: "msa-user-login",
					style: { "position":"absolute", "bottom":"10px", "right":"10px", "min-height":null }
				}
			}
		}
	}
})

// read //////////////////////////////////////////////////////////////

var getNavmenuAsPartial = function(req, res, next) {
	sheetApp.getSheet("navmenu", "header", {user:req.user, ifNotExist:"create", insertInDb:true, forceInsertInDb:true}, function(err, sheet){
		if(err) return next(err)
		res.partial = sheetApp.renderSheetAsHtml(sheet)
		next()
	})
}

navmenuApp.get("/", getNavmenuAsPartial)
navmenuApp.getPartial = getNavmenuAsPartial
