import EventManager, { EventType } from "./eventManager";

const { ccclass, property } = cc._decorator;

@ccclass
export default class Test2 extends cc.Component {

    private eventMgr: EventManager;

    start() {
        EventManager.init();
        this.eventMgr = EventManager.ins;

        let call: Function = (d) => { console.log(`收到事件test,参数为：${d}`); }

        /*------------------删除监听测试--------------------------- */

        // console.log("监听事件test");
        // this.eventMgr.onEvent(EventType.Test, call, this);

        // console.log("发送事件test");
        // this.eventMgr.sendEvent(EventType.Test, 3213);

        // console.log("删除该订阅者所有订阅");
        // this.eventMgr.deleteSubscriber(this);

        // console.log("发送事件test");
        // this.eventMgr.sendEvent(EventType.Test, 3213);

        /*------------------监听一次测试--------------------------- */

        console.log("监听事件test一次");
        this.eventMgr.onEventOnce(EventType.Test, call, this);

        console.log("发送事件test");
        this.eventMgr.sendEvent(EventType.Test, 3213);

        console.log("发送事件test");
        this.eventMgr.sendEvent(EventType.Test, 3213);
    }

}
