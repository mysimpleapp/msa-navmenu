var msaNavmenu = module.exports = {}
var subApp = msaNavmenu.subApp = Msa.subApp("/navmenu")

// require userApp, as default header use user-login box
require("../../msa-user/msa-server")
// sheet
var sheetApp = require("../../msa-sheet/msa-server")

// register navmenu sheets
sheetApp.registerType("navmenu")

// create default navmenu
sheetApp.createSheet("navmenu", "header", {
	content: {
		tag: "msa-sheet-boxes",
		style: {
			margin:0,
			height:'100px',
			'border-bottom':'4px solid #4C9CF1',
			'box-shadow':'0 0 3px 2px #aaa'
		},
		content: [
			{
				tag: "msa-sheet-text",
				style: {
					position:'absolute',
					top:'10px',
					left:'30px'
				},
				content: {
					tag:'a',
					attrs: {
						href:'/',
						style:{
							color:'#4C9CF1',
							'font-size': '36px',
							'font-weight':'bold'
						}
					},
					content:'MySimpleApp'
				}
			}, {
				tag: "msa-user-login-box",
				style: {
					position:'absolute',
					bottom:'10px',
					right:'10px'
				}
			}
		]
	}
}, null)

// read //////////////////////////////////////////////////////////////

var getNavmenuAsPartial = function(req, res, next) {
	sheetApp.getSheet("navmenu", "header", {user:req.session.user}, function(err, sheet){
		if(err) return next(err)
		res.partial = sheetApp.renderSheetAsHtml(sheet)
		next()
	})
}

subApp.get("/", getNavmenuAsPartial)
msaNavmenu.getPartial = getNavmenuAsPartial
