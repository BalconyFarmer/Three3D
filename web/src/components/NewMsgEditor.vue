<script>
export default {
    components: {},
    props: {
        newProject: {
            type: Array,
            default: () => {
                return {}
            }
        },
        entityType: '',
        entityId: '',
    },
    data() {
        return {
            editorIndex: null,
        }
    },
    methods: {},
    create() {

    },
    mounted() {
    },
    render() {
        const self = this

        function renderImg(data) {
            return (
                <div>
                    <img src={data} className="img"/>
                </div>
            )
        }

        function renderInput(index) {
            const on = {
                input: e => {
                    self.newProject[index].data = e.srcElement.value
                }
            }
            return <a-input placeholder="请输入"  {...{on: on}}/>
        }

        function renderDiv(data, index) {
            const on = {
                click: e => {
                    self.editorIndex = index
                }
            }
            return (<div {...{on: on}}> {data} </div>)
        }

        function renderItem() {
            let vNodes = []
            self.newProject.forEach((item, index) => {
                if (item.type === 'text') {
                    if (item.data === null) {
                        item.data = '点击输入文本'
                    } else if (self.editorIndex === index) {
                        vNodes.push(renderInput(index))
                    } else {
                        vNodes.push(renderDiv(item.data, index))
                    }
                } else if (item.type === 'img') {
                    vNodes.push(renderImg(item.data))
                }
            })
            return vNodes
        }

        return (
            <div>
                <div id="all">
                    {renderItem()}
                </div>
            </div>
        )
    }
}

</script>

<style lang="less">
#all {
    img {
        display: inline;
        height: calc(100vh / 3);
    }
}

</style>
