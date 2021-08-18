import {ImportObj} from './ImportObj'

export class ImportObjs {
    constructor(app) {
        this.app = app
        this.objList = []
    }

    loadOBJ(url, name, position) {
        const objLoader = new ImportObj(this.app)
        objLoader.loadOBJ(url, name,position)
        const _objLoader = {
            name: name,
            objLoader: objLoader
        }
        this.objList.push(_objLoader)
        return objLoader
    }

    getLoader(name) {
        this.objList.forEach(item => {
            if (item.name) {
                if (item.name === name) {
                    return item
                }
            }
        })
    }

}

