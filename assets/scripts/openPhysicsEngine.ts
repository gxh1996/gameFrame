const { ccclass, property } = cc._decorator;

@ccclass
export default class OpenPhysicsEngine extends cc.Component {

    @property({})
    private isDebug: boolean = false;

    @property({})
    private gravity: cc.Vec2 = new cc.Vec2(0, 0);

    onLoad() {
        let self = this;

        //设置物理引擎参数
        cc.director.getPhysicsManager().enabled = true;
        this.debug();
        cc.director.getPhysicsManager().gravity = this.gravity;
        // cc.director.getPhysicsManager().enabled = false;
    }

    private debug() {
        if (this.isDebug) {
            //开启调试信息
            let Bits: cc.DrawBits = cc.PhysicsManager.DrawBits;//这是我们要显示的类型信息
            cc.director.getPhysicsManager().debugDrawFlags = Bits.e_jointBit | Bits.e_shapeBit | Bits.e_centerOfMassBit;
        }
        else {
            //关闭调试
            cc.director.getPhysicsManager().debugDrawFlags = 0;
        }
    }

    /**
     * 打开物理引擎
     */
    private open() {
        cc.director.getPhysicsManager().enabled = true;
    }

    private close() {
        cc.director.getPhysicsManager().enabled = false;
    }
}
