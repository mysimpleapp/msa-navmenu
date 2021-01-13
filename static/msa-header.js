import { importHtml, importOnCall, ajax, initMsaBox } from "/utils/msa-utils.js"

const editMsaBoxes = importOnCall("/utils/msa-utils-box-edition.js", "editMsaBoxes")
const exportMsaBoxes = importOnCall("/utils/msa-utils-box-edition.js", "exportMsaBoxes")

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
        this.editing = false
        if (this.toFetch()) {
            await this.getHeader()
        } else {
            await initMsaBox(this, {
                parent: this,
                boxesRoute: `${this.getBaseUrl()}/_box`
            })
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
        await this.initMsaBox(template.content)
        this.appendChild(template.content)
        this.setAttribute("editable", header.editable || false)
    }

    async postHeader() {
        const content = (await exportMsaBoxes(this.children)).innerHTML
        await ajax("POST", `${this.getBaseUrl()}/_header`, {
            body: { content }
        })
    }
}

// register elem
customElements.define("msa-header", HTMLMsaHeaderElement)
