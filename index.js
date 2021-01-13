const { Header } = require("./model")
const { HeaderPerm } = require("./perm")
const { addHeaderGlobalParams } = require("./params")
const { useMsaBoxesRouter } = Msa.require("utils")
const { globalParams } = Msa.require("params")
const { db } = Msa.require("db")
const { userMdw, unauthHtml } = Msa.require("user")
//const { MsaSheet, renderSheetAsHtml } = Msa.require("sheet/module")

class MsaHeaderModule extends Msa.Module {

	constructor() {
		super()
		this.initApp()
	}

	getUserId(req) {
		const user = req.user
		return user ? user.id : req.connection.remoteAddress
	}

	getUserName(req, reqUserName) {
		const user = req.user
		return user ? user.name : reqUserName
	}

	canRead(req) {
		const perm = globalParams.header.perm.get()
		return perm.check(req.user, HeaderPerm.READ)
	}

	canWrite(req) {
		const perm = globalParams.header.perm.get()
		return perm.check(req.user, HeaderPerm.WRITE)
	}

	canAdmin(req) {
		const perm = globalParams.header.perm.get()
		return perm.check(req.user, HeaderPerm.ADMIN)
	}

	initApp() {

		this.app.get("/_header", userMdw, async (req, res, next) => {
			try {
				const header = await this.getHeader(req)
				res.json(this.exportHeader(req, header))
			} catch(err) { next(err) }
		})

		this.app.post("/_header", userMdw, async (req, res, next) => {
			try {
				const { content, by } = req.body
				await this.upsertHeader(req, content, { by })
				res.sendStatus(Msa.OK)
			} catch(err) { next(err) }
		})

		// MSA boxes
		useMsaBoxesRouter(this.app, '/_box', req => ({
			parentId: "header"
		}))
	}
	/*
		initSheetMod() {
			this.sheetMod = new class extends MsaSheet {
				getId(ctx, reqId) {
					return `page-${reqId}`
				}
			}
			this.app.use("/_sheet", this.sheetMod.app)
		}
	*/
	async getHeader(req) {
		if (!this.canRead(req)) throw Msa.FORBIDDEN
		const dbHeader = await db.collection("msa_header").findOne({})
		const header = Header.newFromDb(dbHeader)
		if(!header.content) {
			header.content = this.getDefaultContent()
		}
		return header
	}

	getDefaultContent() {
		return `
			<msa-utils-text-box>
				<div class="content">
					<b>MySimpleApp</b>
				</div>
			</msa-utils-text-box>
			<msa-user-signin-box></msa-user-signin-box>
		`
	}

	exportHeader(req, header) {
		return {
			content: header.content,
			updatedBy: header.updatedBy,
			updatedAt: header.updatedAt ? header.updatedAt.toISOString() : null,
			canEdit: this.canWrite(req)
		}
	}

	async upsertHeader(req, content, kwargs) {
		const header = await this.getHeader(req)
		if (!this.canWrite(req)) throw Msa.FORBIDDEN
		header.content = content
		header.updatedBy = this.getUserName(req, kwargs && kwargs.by)
		header.updatedAt = new Date(Date.now())
		await db.collection("msa_header").updateOne({}, { $set: header.formatForDb() }, { upsert: true })
	}
}

let gMsaHeaderModule = null

// getHtml
async function getHtml(req) {
	const header = await gMsaHeaderModule.getHeader(req)
	return {
		wel: "/header/msa-header.js",
		attrs: {
			'editable': gMsaHeaderModule.canWrite(req),
			'fetch': 'false'
		},
		content: header.content
	}
}

// export

module.exports = {
	startMsaModule: () => {
		gMsaHeaderModule = new MsaHeaderModule()
		addHeaderGlobalParams()
		return gMsaHeaderModule
	},
	MsaHeaderModule,
	getHtml
}
