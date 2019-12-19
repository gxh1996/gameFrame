

/**
 * 资源依赖使用信息
 */
class ResDependInfo {
    /**
     * 我被哪些资源依赖 
     */
    dependeds: Set<string>;
    /**
     * 我在哪里被使用:scripts/...
     */
    users: Set<string>;
}

/**
 * 资源依赖管理类
 */
export default class ResDependence {

    /**
     * 资源依赖信息字典
     */
    private resMap: Map<string, ResDependInfo> = new Map<string, ResDependInfo>();

    private ccloader: any = cc.loader;


    /**
     * 记录该资源的依赖使用信息
     */
    recordDependence(url: string) {
        console.log(`记录该资源依赖信息${url}`);
        let key: string = this.getCacheKey(url);
        //创建一个本资源得记录
        this.getResDependInfo(key);

        this._recordDependence(key);
    }
    /**
     * 记录资源key依赖的资源
     */
    private _recordDependence(key: string) {
        let dependKeys: string[] = this.getDependKeys(key);
        if (dependKeys && Array.isArray(dependKeys) && dependKeys.length > 0) {
            console.log(`资源${key}依赖得资源有${dependKeys}`);
            let depKey: string;
            let rd: ResDependInfo;
            for (depKey of dependKeys) {
                rd = this.getResDependInfo(depKey);
                rd.dependeds.add(key);

                //记录资源depKey依赖的资源
                this._recordDependence(depKey);
            }
        }
    }

    /**
     * 删除该资源的所有依赖信息
     * @param key cc.loader._cache.id
     */
    deleteResDependInfo(key: string) {
        this.resMap.delete(key);
    }

    /**
     * 得到记录的所有资源的key值
     */
    getResMapKey(): IterableIterator<string> {
        return this.resMap.keys();
    }

    /**
     * 删除其使用引用
     * @param url 
     * @param user 
     */
    removeUse(url: string, user: string) {
        let key: string = this.getCacheKey(url);
        let rd: ResDependInfo = this.getResDependInfo(key);
        rd.users.delete(user);
    }

    /**
     * 记录其使用引用
     * @param url 
     * @param user 
     */
    recordUse(url: string, user: string) {
        let key: string = this.getCacheKey(url);
        let rd: ResDependInfo = this.getResDependInfo(key);
        rd.users.add(user);
    }

    /**
     * 得到该资源的依赖键值数组
     * @param key _cache的键值
     */
    getDependKeys(key: string): string[] {
        let ccloader: any = cc.loader;
        let cacheInfo = ccloader._cache[key];
        let dependKeys: string[] = cacheInfo.dependKeys;
        return dependKeys;
    }

    /**
     * 得到url/uuid/资源对象的 CacheKey
     * @param url 可以为url/uuid/资源对象
     */
    getCacheKey(url: any): string {
        return this.ccloader._getReferenceKey(url);
    }

    /**
     * 得到_cache信息块
     * @param key
     */
    getCacheItem(key: string): any {
        let ccloader: any = cc.loader;
        let cacheInfo = ccloader._cache[key];
        return cacheInfo;
    }

    /**
     * 是否能删除该资源
     */
    releaseEnable(key: string): boolean {
        let rd: ResDependInfo = this.resMap.get(key);
        if (!rd)
            return true;

        if (rd.dependeds.size === 0 && rd.users.size === 0 && !this.isSceneDepend(key))
            return true;
        return false;
    }
    /**
     * 是否为场景的依赖资源
     */
    private isSceneDepend(key: string) {
        let scene: any = cc.director.getScene();
        let len = scene.dependAssets.length;
        for (let i = 0; i < len; ++i) {
            if (scene.dependAssets[i] === key)
                return true;
        }
        return false;
    }

    /**
     * 移除key对depK的依赖
     */
    removeDepended(key: string, depK: string) {
        let rd: ResDependInfo = this.getResDependInfo(depK);
        rd.dependeds.delete(key);
    }


    /**
     * 得到该资源的 资源依赖使用信息。没有就创建一个加入resMap并返回
     * @param string
     */
    private getResDependInfo(key: string): ResDependInfo {
        if (this.resMap.has(key))
            return this.resMap.get(key);
        else {
            let rd: ResDependInfo = new ResDependInfo();
            rd.dependeds = new Set<string>();
            rd.users = new Set<string>();

            this.resMap.set(key, rd);
            return rd;
        }
    }


}
