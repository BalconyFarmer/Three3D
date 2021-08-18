<template>
    <div class="pictrueTreeAll">
        <div class="first">
            <div class="item">
                <div class="headIcon"></div>
                <div class="text">书记: xxx</div>
                <div class="text">42岁</div>
                <div class="text">博士</div>
            </div>
        </div>
        <div class="first">
            <div class="item">
                <div class="headIcon"></div>
                <div class="text">书记: xxx</div>
                <div class="text">42岁</div>
                <div class="text">博士</div>
            </div>
            <div class="item">
                <div class="headIcon"></div>
                <div class="text">书记: xxx</div>
                <div class="text">42岁</div>
                <div class="text">博士</div>
            </div>
        </div>
        <div class="third">
            <div class="item">
                <div class="headIcon"></div>
                <div class="text">书记: xxx</div>
                <div class="text">42岁</div>
                <div class="text">博士</div>
            </div>
            <div class="item">
                <div class="headIcon"></div>
                <div class="text">书记: xxx</div>
                <div class="text">42岁</div>
                <div class="text">博士</div>
            </div>
            <div class="item">
                <div class="headIcon"></div>
                <div class="text">书记: xxx</div>
                <div class="text">42岁</div>
                <div class="text">博士</div>
            </div>
            <div class="item">
                <div class="headIcon"></div>
                <div class="text">书记: xxx</div>
                <div class="text">42岁</div>
                <div class="text">博士</div>
            </div>
            <div class="item">
                <div class="headIcon"></div>
                <div class="text">书记: xxx</div>
                <div class="text">42岁</div>
                <div class="text">博士</div>
            </div>
            <div class="item">
                <div class="headIcon"></div>
                <div class="text">书记: xxx</div>
                <div class="text">42岁</div>
                <div class="text">博士</div>
            </div>
            <div class="item">
                <div class="headIcon"></div>
                <div class="text">书记: xxx</div>
                <div class="text">42岁</div>
                <div class="text">博士</div>
            </div>
            <div class="item">
                <div class="headIcon"></div>
                <div class="text">书记: xxx</div>
                <div class="text">42岁</div>
                <div class="text">博士</div>
            </div>
            <div class="item">
                <div class="headIcon"></div>
                <div class="text">书记: xxx</div>
                <div class="text">42岁</div>
                <div class="text">博士</div>
            </div>
            <div class="item">
                <div class="headIcon"></div>
                <div class="text">书记: xxx</div>
                <div class="text">42岁</div>
                <div class="text">博士</div>
            </div>
            <div class="item">
                <div class="headIcon"></div>
                <div class="text">书记: xxx</div>
                <div class="text">42岁</div>
                <div class="text">博士</div>
            </div>
        </div>
    </div>
</template>

<script>
export default {
    name: "PictureTree"
};
</script>

<style scoped lang="scss">
.pictrueTreeAll {
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: column;

    .text {
        font-size: 10px;
    }

    .item {
        width: 90px;
        height: 160px;
        margin-left: 10px;
        margin-right: 10px;
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;

        .headIcon {
            width: 90px;
            height: 120px;
            background-image: url("./imgs/manAvatar.jpg");
            background-size: cover;
        }
    }

    .first {
        width: 100%;
        height: 25%;
        display: flex;
        flex-direction: row;
        justify-content: center;
        align-items: center;
    }

    .third {
        width: 100%;
        height: 50%;
        display: flex;
        flex-direction: row;
        flex-wrap: wrap;
    }

}
</style>
