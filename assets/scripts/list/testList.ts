const { ccclass, property } = cc._decorator;

@ccclass
export default class TestList extends cc.Component {


    // onLoad () {}

    start() {
        // console.log(this.node.children);
        // this.swapItemInArray(this.node.children, 0, 1);
        // console.log(this.node.children);
    }

    private swapItemInArray(arr: any[], i: number, j: number) {
        let o = arr[i];
        arr[i] = arr[j];
        arr[j] = o;
    }

    pageEvents() {
        // console.log("触发事件pageEvent");
    }

    // update (dt) {}
}
