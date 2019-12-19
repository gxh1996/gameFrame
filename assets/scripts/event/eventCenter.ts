// 订阅
class Subscribe {
    private subscriber: any;
    private dealFunc: Function;

    constructor(subscribe: any, dealFunc: Function) {
        this.setSubscriber(subscribe);
        this.setDealFunc(dealFunc);
    }

    public getSubscriber(): any {
        return this.subscriber;
    }

    public setSubscriber(subscriber: any): void {
        this.subscriber = subscriber;
    }

    public getDealFunc(): Function {
        return this.dealFunc;
    }

    public setDealFunc(dealFunc: Function): void {
        this.dealFunc = dealFunc;
    }

    /**
     * 订阅事件发生的处理函数
     */
    public dealEvent(data: any) {
        this.dealFunc.call(this.subscriber, data);
    }
}

/**
 * 事件中心类
 */
export default class EventCenter {

    /**
     * 事件订阅表 [事件名, 所有订阅][]
     */
    private eventSubscribeList: [string, Subscribe[]][] = null;

    /**
     * 订阅者事件表 Map<订阅者,事件名[]>
     */
    private eventsOfSubscriber: Map<any, string[]> = null;

    constructor() {
        this.eventSubscribeList = [];
        this.eventsOfSubscriber = new Map<any, string[]>();
    }

    /**
     * 发布事件，执行所有订阅该事件的订阅者留下的函数
     * @param eventName 事件名 
     * @param data 数据
     * @returns false: 没有人订阅该事件,true: 发布成功
     */
    publishEvent(eventName: string, data: any = null): boolean {
        let subscribeList: Subscribe[] = this.findEventSubscribes(eventName);

        //没有人订阅该事件
        if (subscribeList === null) {
            console.error("还没有人监听该事件" + eventName + ",请处理！");
            return false;
        }

        //调用所有订阅过这个事件的订阅者留下的处理函数
        for (let i = 0; i < subscribeList.length; i++) {
            subscribeList[i].dealEvent(data);
        }
        return true;
    }

    /**
     * 添加订阅
     * @param subscriber 订阅者this
     * @param eventName 事件名
     * @param dealFunc 处理函数
     * @param false: 已订阅过
     */
    addSubscribe(subscriber: any, eventName: string, dealFunc: Function): boolean {
        //新订阅
        let subscribe: Subscribe = new Subscribe(subscriber, dealFunc);

        ///
        let subscribes: Subscribe[] = this.findEventSubscribes(eventName);
        if (subscribes === null) { //还没有人订阅这个事件
            //添加该事件的订阅
            subscribes = [];
            subscribes.push(subscribe);
            this.eventSubscribeList.push([eventName, subscribes]);
        }
        else {
            //已订阅该事件
            if (this.isSubscribed(subscriber, eventName)) {
                cc.error("已订阅过事件" + eventName)
                return false;
            }

            //没订阅
            subscribes.push(subscribe);
        }

        //将订阅的该事件加入该订阅者的订阅事件数组中
        this.addSubscribEvents(subscriber, eventName);

        return true;
    }

    /**
     * subscriber 取消订阅 eventName
     * @param subscriber 订阅者
     * @param eventName 事件
     * @returns false:订阅者没有订阅该事件,true: 取消成功
     */
    cancelSubscribe(subscriber: any, eventName: string): boolean {
        //找到订阅表
        let subscribes: Subscribe[] = this.findEventSubscribes(eventName);

        if (subscribes !== null) //有关于该事件的订阅
            for (let i = 0; i < subscribes.length; i++) {
                if (subscribes[i].getSubscriber() === subscriber) {
                    subscribes.splice(i, 1);

                    this.deleteSubscribEvents(subscriber, eventName);
                    return true;
                }
            }

        console.error("取消订阅失败！没有订阅该事件");
        return false;
    }

    /**
     * 删除该订阅者的所有订阅
     * @param subscriber 订阅者
     */
    deleteSubscriber(subscriber: any): boolean {
        let events: string[] = this.eventsOfSubscriber.get(subscriber);
        if (events === undefined) {
            console.error("该订阅者没有订阅任何事件");
            return false;
        }

        while (events.length > 0) {
            this.cancelSubscribe(subscriber, events[0]);
        }

        return true;
    }

    /**
     * 清空所有订阅
     */
    clearAllSubscribes() {
        this.eventSubscribeList = [];
        this.eventsOfSubscriber.clear();
    }

    /**
     * 返回订阅这个事件的订阅数组
     * @param eventName 事件名
     * @returns event subscribes 订阅表
     */
    private findEventSubscribes(eventName: string): Subscribe[] {
        let ret: Subscribe[] = null;

        for (let i = 0; i < this.eventSubscribeList.length; i++) {
            let tuple: [string, Subscribe[]] = this.eventSubscribeList[i];
            if (tuple[0] === eventName) {
                ret = tuple[1];
                break;
            }
            else
                continue;
        }
        return ret;
    }

    /**
     * 该订阅者是否订阅过该事件
     * @param subscriber 订阅者
     * @param eventName 事件名
     * @returns true: 订阅过
     */
    private isSubscribed(subscriber: any, eventName: string): boolean {
        let ret = false;
        //得到该订阅者订阅的事件数组
        let events: string[] = this.eventsOfSubscriber.get(subscriber);

        //该订阅者订阅了事件
        if (events !== undefined)
            for (let i = 0; i < events.length; i++)
                //订阅了
                if (events[i] === eventName) {
                    ret = true;
                    break;
                }

        return ret;
    }

    /**
     * 将事件名加入subscriber的事件表中
     */
    private addSubscribEvents(subscriber: any, eventName: string): boolean {
        //获得其订阅的事件表
        let events: string[] = this.eventsOfSubscriber.get(subscriber);
        if (events === undefined) { //当前一个事件也没有订阅
            events = [];
            events.push(eventName);
            this.eventsOfSubscriber.set(subscriber, events);
        }
        else {
            if (events.indexOf(eventName) !== -1) { //表示已订阅该事件
                console.error("重复订阅事件");
                return false;
            }
            events.push(eventName);
        }
        return true;
    }

    /**
     * 将该事件名从subscriber的事件表中删除
     */
    private deleteSubscribEvents(subscriber: any, eventName: string) {
        //得到该订阅者的事件表
        let events: string[] = this.eventsOfSubscriber.get(subscriber);

        if (events === undefined) {
            console.error("没有订阅任务事件，订阅者：", subscriber);
            return;
        }
        else {
            for (let i = 0; i < events.length; i++)
                if (events[i] === eventName) {
                    events.splice(i, 1);
                    return;
                }
        }
        console.error("删除没有订阅的事件");
    }
}
