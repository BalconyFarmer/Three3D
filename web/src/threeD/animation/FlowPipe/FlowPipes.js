import {FlowPipe} from './FlowPipe'

export class FlowPipes {
    constructor(app) {
        this.app = app
        this.flowPipes = []
    }

    creatPipe(linePoints) {
        const flowPipe = new FlowPipe(this.app, linePoints)
        flowPipe.creat()
        this.flowPipes.push(flowPipe)
    }
}
