/**
 * 资源加载进度统计类
 */
export default class LoadProgress {
    private loadResArr: number[] = [];
    /**
     * 指向空记录
     */
    private p: number = 0;

    /**
     * 注册一个资源的加载进度
     */
    registerLoad(): number {
        this.loadResArr[this.p] = 0;
        return this.p++;
    }

    /**
     * 更新该资源的加载进度
     * @param id 资源标识
     * @param completeCount 完成的个数
     * @param total 资源个数
     */
    updateLoadState(id: number, completeCount: number, total: number) {
        if (!total)
            return;

        this.loadResArr[id] = completeCount / total;
    }

    /**
     * 是否加载完成
     */
    isLoadComplete(): boolean {
        let r: boolean = true;
        for (let i = 0; i < this.p; i++)
            if (this.loadResArr[i] !== 1) {
                r = false;
                break;
            }
        return r;
    }

    /**
     * 清除加载记录
     */
    clearRecord() {
        this.p = 0;
    }

}