import LoadProgress from "./loadProgress";
import ResManager from "../resManager/resManager";
import EventManager, { EventType } from "../eventManager";

/**
 * 任务里得一项
 */
interface TaskItem {
    /**
     * 资源类型
     */
    type: string;
    /**
     * 资源路径
     */
    urls: string[];
}

/**
 * 任务对象
//  */
interface TaskObj {
    [anykey: string]: TaskItem[];
}


export default class LoadTaskManager {
    static ins: LoadTaskManager;
    static init() {
        this.ins = new LoadTaskManager();
    }

    /**
    * 每个任务要加载的资源,{任务名：[{type:资源类型,urls:[url,...]},...]}
    */
    private taskResUrls: TaskObj;
    private loadProgress: LoadProgress;
    private callback: Function = null;

    private constructor() {
        this.loadProgress = new LoadProgress();
    }

    /**
    * 加载资源任务列表
    * @param url
    */
    loadUrlList(url: string) {
        let self = this;
        ResManager.ins.loadRes(url, cc.JsonAsset, null, () => {
            self.taskResUrls = ResManager.ins.getRes(url, cc.JsonAsset, "loadTaskManager");
            EventManager.ins.sendEvent(EventType.LoadTaskResListComplete);
        })
    }

    /**
     * 执行加载任务
     * @param task 任务名
     * @param completeCallback 任务完成得回调函数
     */
    excuteLoadTask(task: string, completeCallback?: Function) {
        if (!this.taskResUrls) {
            console.error("任务资源对象为空");
            return;
        }

        if (completeCallback)
            this.callback = completeCallback;

        let tI: TaskItem[] = this.taskResUrls[task];
        let item: TaskItem;
        for (item of tI) {
            this._loadResArray(item.urls, this.stringToType(item.type));
        }
    }
    private _loadRes(url: string, type: typeof cc.Asset) {

        let r: any = cc.loader.getRes(url);
        if (r) {
            console.warn(`资源${url}已加载`);
            return;
        }

        let self = this;

        let id: number = this.loadProgress.registerLoad();

        ResManager.ins.loadRes(url, type, (completedCount: number, totalCount: number, item: any) => {
            self.loadProgress.updateLoadState(id, completedCount, totalCount);
        }, () => {
            //每次加载完一个资源判断一下所有资源是否加载完毕
            if (self.loadProgress.isLoadComplete())
                this.loadCompelete();
        })

    }
    private _loadResArray(urls: string[], type: typeof cc.Asset) {
        let u: string;
        for (u of urls)
            this._loadRes(u, type);
    }
    /**
     * 根据字符串内容返回资源类型
     */
    private stringToType(s: string): typeof cc.Asset {
        switch (s) {
            case "prefab": return cc.Prefab;
            case "spriteAtlas": return cc.SpriteAtlas;
            case "spriteFrame": return cc.SpriteFrame;
            case "json": return cc.JsonAsset;
        }
    }

    /**
     * 完成加载任务
     */
    private loadCompelete() {
        if (this.callback)
            this.callback();

        //任务加载完成，清理记录，方便下次加载
        if (this.callback)
            this.callback = null;

        this.loadProgress.clearRecord();
    }

}