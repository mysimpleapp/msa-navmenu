import { importHtml, importOnCall, ajax, exposeMsaBoxCtx } from "/msa/utils/msa-utils.js"

const srcMsaBoxEdition = "/msa/utils/msa-utils-box-edition.js"
const editMsaBoxes = importOnCall(srcMsaBoxEdition, "editMsaBoxes")
const exportMsaBoxes = importOnCall(srcMsaBoxEdition, "exportMsaBoxes")

importHtml(`<style>
	msa-header {
        margin: 0;
        padding: .5em;
        display: flex;
        flex-direction: row;
        background: lightblue;
        min-height: 1em;
        width: 100%;
    }
</style>`)

export class HTMLMsaHeaderElement extends HTMLElement {

    getBaseUrl() {
        return "/header"
    }
    isEditable() {
        return (this.getAttribute("editable") === "true")
    }
    toFetch() {
        return (this.getAttribute("fetch") !== "false")
    }

    async connectedCallback() {

        exposeMsaBoxCtx(this, {
            parent: this,
            boxesRoute: `${this.getBaseUrl()}/_box`
        })

        this.editing = false
        if (this.toFetch()) {
            await this.getHeader()
        }

        if(this.isEditable()) {
            await editMsaBoxes(this, {
                boxesRoute: `${this.getBaseUrl()}/_box`
            })
            this.addEventListener("msa-box-inserted", () => this.postHeader())
            this.addEventListener("msa-box-edited", () => this.postHeader())
        }
    }

    async getHeader() {
        const header = await ajax("GET", `${this.getBaseUrl()}/_header`)
        const template = document.createElement("template")
        template.innerHTML = header.content || ""
        this.appendChild(template.content)
        this.setAttribute("editable", header.editable || false)
    }

    async postHeader() {
        const exported = await exportMsaBoxes(this.children)
        await ajax("POST", `${this.getBaseUrl()}/_header`, {
            body: {
                head: exported.head.innerHTML,
                body: exported.body.innerHTML
            }
        })
    }
}

// register elem
customElements.define("msa-header", HTMLMsaHeaderElement)
