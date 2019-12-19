import ResDependence from "./resDependence";


export default class ResManager {

    static ins: ResManager = null;

    static init() {
        this.ins = new ResManager();
    }

    private resDependence: ResDependence;

    private constructor() {
        this.resDependence = new ResDependence();
    }

    /****************************************************************************************
    *                                         加载与得到资源                                   *
    ****************************************************************************************/


    /**
     * 加载资源
     */
    loadRes(url: string, type: typeof cc.Asset, loadProgress: (completedCount: number, totalCount: number, item: any) => void = null, completeCallback: () => void = null) {

        let r: any = cc.loader.getRes(url, type);
        if (r) {
            console.log(`资源${url}已加载`);
            return;
        }

        cc.loader.loadRes(url, type, loadProgress, (e, r) => {
            //记录资源依赖
            this.resDependence.recordDependence(url);

            if (completeCallback)
                completeCallback();
        });
    }

    /**
     * 所有资源为统一类型
     */
    loadResArray(urls: string[], type: typeof cc.Asset, completeCallback: () => void = null) {
        let u: string;
        for (u of urls)
            this.loadRes(u, type);

        if (completeCallback)
            completeCallback();
    }

    getRes(url: string, type: typeof cc.Asset, user: string): any {
        this.resDependence.recordUse(url, user);
        return cc.loader.getRes(url, type);
    }

    /****************************************************************************************
    *                                         释放资源                                        *
    ****************************************************************************************/

    /**
     * 移除使用引用，如果能释放资源就释放（递归释放）
     * @param url 
     * @param user 没有使用可以不写
     */
    releaseResRecursion(url: string, user?: string) {
        //移除使用引用
        if (user)
            this.resDependence.removeUse(url, user);

        //释放资源
        this._releaseResRecursion(this.resDependence.getCacheKey(url));
    }
    /**
     * 释放资源以及其依赖的资源，会自动判断是否可以释放
     * @param key cc.loader._cache.id
     */
    private _releaseResRecursion(key: string) {
        if (this.resDependence.releaseEnable(key)) {
            //先释放自己对其他资源的依赖
            let depKeys: string[] = this.resDependence.getDependKeys(key);
            if (depKeys) {
                let depK: string;
                for (depK of depKeys) {
                    //释放对该资源的依赖
                    this.resDependence.removeDepended(key, depK);

                    //用递归，尝试看能否释放其依赖资源
                    this._releaseResRecursion(depK);
                }
            }

            //释放资源和删除记录
            this._releaseOneRes(key);
            this.resDependence.deleteResDependInfo(key);
        }
    }

    /**
     * 释放空闲资源，谨慎使用
     */
    releaseIdleRes() {
        let key: string;
        let keys: IterableIterator<string> = this.resDependence.getResMapKey();
        while (key = keys.next().value) {
            if (this.resDependence.releaseEnable(key)) {
                this._releaseOneRes(key);
                this.resDependence.deleteResDependInfo(key);
            }
        }
    }

    /**
     * 释放单个资源
     */
    private _releaseOneRes(key: string) {
        let item: any = this.resDependence.getCacheItem(key);
        if (item.uuid) {
            cc.loader.release(item.uuid);
            cc.log(`通过uuid释放资源${item}`);
        } else if (item.id) {
            cc.loader.release(item.id);
            cc.log(`通过id释放资源${item}`);
        }
        else {
            console.warn(`资源释放失败${item}`);
        }
    }

}