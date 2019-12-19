const { ccclass, property } = cc._decorator;

/* ----------------------------------------------- */

@ccclass
export default class HrizelScrollPage extends cc.Component {

    @property(cc.Prefab)
    private page: cc.Prefab = null;

    @property(cc.Node)
    private content: cc.Node = null;

    @property({
        type: [cc.Component.EventHandler],
        displayName: "翻页事件"
    })
    private scrollEvents: cc.Component.EventHandler[] = [];

    private scrollView: cc.ScrollView = null;
    private layout: cc.Layout = null;

    /**
     * content的初始位置，也是页面指针为1时的位置
     */
    private initPosOfContent: cc.Vec2;
    private pageWidth: number;
    /**
     * 页面数值，也是内容节点的孩子节点
     */
    private pages: cc.Node[] = null;
    private virtualMode: boolean = false;
    /**
     * 移动超过页面宽度百分比的长度就发生翻页
     */
    private scrollThreshold: number = 0.5;
    /**
     * 翻页的时间
     */
    private turnPageTime: number = 1;

    /**
     * 虚拟的页面数据
     */
    private data = {
        curIdx: 0,
        lastIdx: 0,
        maxIdx: 0
    }
    /**
     * 实际的页面数据
     */
    private _data = {
        curIdx: 0,
        lastIdx: 0,
    }

    /**
     * 要翻页
     */
    private needTurnPage: boolean = false;

    onLoad() {
        this.scrollView = this.node.getComponent(cc.ScrollView);
        this.pages = this.content.children;
        this.layout = this.content.getComponent(cc.Layout);

        this.onEvent();
    }

    private onEvent() {
        this.node.on("touch-up", this.touchUp, this);
        this.node.on("scroll-began", this.scrollBegan, this);
        this.node.on("scroll-ended", this.scrollEnded, this);
    }

    start() {
        this.initData();
        // this.scrollView.scrollToPercentHorizontal(1, 3);
    }

    private init() {

    }

    private initData() {
        this.initPosOfContent = this.content.getPosition();
        this.pageWidth = this.page.data.width;
        this.setPageNum(2);
    }

    /**
     * 设置页面数量
     */
    setPageNum(n: number) {
        if (this.data.curIdx > n - 1) {
            console.error("无法设置页面数量，因为要删除的页面中有正在显示的");
            return;
        }

        if (n === this.pageNum)
            return;

        if (n > this.pageNum) {
            this.addPages(n - this.pageNum);
        }
        else {
            this.deletePages(this.pageNum - n);
        }

        if (this.pageNum > 3 && !this.virtualMode)
            this.openVirtualMode();
        if (this.pageNum <= 3 && this.virtualMode)
            this.closeVirtualMode();

        this.data.maxIdx = this.pageNum - 1;

        // this.layout.updateLayout();
    }

    /**
     * 页面数量
     */
    get pageNum(): number {
        return this.data.maxIdx + 1;
    }

    /**
     * 增加多个页面
     */
    private addPages(n: number) {
        let sum = this.pageNum + n;
        if (sum > 3) {
            if (this.pages.length < 3)
                //添加页面至3个
                this._addPages(3 - this.pages.length);
        }
        else
            this._addPages(n);
    }
    private _addPages(n: number) {
        let i: number;
        for (i = 0; i < n; i++)
            this.content.addChild(cc.instantiate(this.page));
    }

    /**
     * 从后面删除多个页面 
     */
    private deletePages(n: number) {
        let rest: number = this.pageNum - n;
        if (rest < 0) {
            console.error("没有这么多页面可以删除");
            return;
        }

        if (rest < 3) {
            let num: number = this.pages.length - rest;
            this._deletePages(num);
        }

    }
    private _deletePages(n: number) {
        let i: number;
        let p: number = this.pages.length - 1;
        for (i = 0; i < n; i++)
            this.content.removeChild(this.pages[p]);
    }

    private openVirtualMode() {
        this.virtualMode = true;
    }
    private closeVirtualMode() {
        this.virtualMode = false;
    }

    /**
     * 当显示页面i时Content的坐标
     * @param i 实际页面指针
     */
    private getContentPos(i: number): cc.Vec2 {
        return cc.v2(this.initPosOfContent.x - this.pageWidth * i, this.initPosOfContent.y);
    }

    /**
     * 得到显示页面i时相对于ScrollView水平方向的百分比位置上
     * @param i 实际指针
     * @returns percent 
     */
    private getPercent(i: number): number {
        //0显示第一个页面,1显示最后一个页面
        return 0 + 1 / this.pages.length * i;
    }


    /* ---------------------事件回调------------------------- */

    private touchUp() {
        // console.log("触摸结束");
        let newP: cc.Vec2 = this.content.getPosition();
        let oldP: cc.Vec2 = this.getContentPos(this._data.curIdx);
        let dir: number = newP.x - oldP.x;
        let l: number = Math.abs(dir);
        let turnPage: boolean = l > this.pageWidth * this.scrollThreshold;

        if (turnPage) {
            //需要翻页
            if (dir > 0) {
                //向左
                if (this.data.curIdx === 0)
                    return;

                this.data.curIdx--;

                let t: number = (this.getContentPos(this.data.curIdx).x - newP.x) / this.pageWidth * this.turnPageTime;
                this.scrollView.scrollToPercentHorizontal(this.getPercent(this.data.curIdx), t);
            }
            else {
                //向右
            }
        }
        else {
            //还原
            let t: number = l / this.pageWidth * this.turnPageTime;
            this.scrollView.scrollToPercentHorizontal(this.getPercent(this._data.curIdx), t);
        }
    }

    private scrollBegan() {
        console.log("scrollBegan");
    }

    private scrollEnded() {
        console.log("scrollEnded");
    }

    private swapItemInArray(arr: any[], i1: number, i2: number) {
        let t = arr[i1];
        arr[i1] = arr[i2];
        arr[i2] = t;
    }

    update(dt) {

    }
}
