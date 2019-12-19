import EventCenter from "./eventCenter";

/**
 * 事件类型
 */
export enum EventType {
    Test
}

export default class EventManager {

    static ins: EventManager;
    static init() {
        if (this.ins) {
            console.warn("重复初始化");
            return;
        }

        this.ins = new EventManager();
    }

    private eventCenter: EventCenter;

    private constructor() {
        this.eventCenter = new EventCenter();
    }

    onEvent(type: EventType, callBack: Function, target: any) {
        this.eventCenter.addSubscribe(target, type.toString(), callBack);
    }

    onEventOnce(type: EventType, callBack: Function, target: any) {
        let self = this;
        this.eventCenter.addSubscribe(target, type.toString(), (d) => {
            callBack(d);
            self.eventCenter.cancelSubscribe(target, type.toString());
        });
    }

    sendEvent(type: EventType, date?: any) {
        this.eventCenter.publishEvent(type.toString(), date);
    }


    /**
     * 删除该订阅者所有订阅
     * @param subscriber this
     */
    deleteSubscriber(subscriber: any) {
        this.eventCenter.deleteSubscriber(subscriber);
    }

}