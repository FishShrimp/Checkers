import { SysDefine } from "./SysDefine";
export class LoadProgress {
    public url: string;
    public completedCount: number;
    public totalCount: number;
    public item: any;
    public cb?: Function;
}

export default class CocosHelper {

    /** 加载进度 */
    public static loadProgress = new LoadProgress();

    /** 等待时间, 秒为单位 */
    public static sleep = function(time: number) {
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                resolve(true);
            }, time * 1000);
        });
    }

    /** 同步的tween */
    public static async runSyncTween(target: any, ...tweens: cc.Tween[]) {
        return new Promise((resolve, reject) => {
            let selfTween = cc.tween(target);
            for(const tmpTween of tweens) {
                selfTween = selfTween.then(tmpTween);
            }
            selfTween.call(() => {
                resolve();
            }).start();
        });
        
    }

    /** 同步的动作 */
    public static async runSyncAction(node: cc.Node, ...actions: cc.FiniteTimeAction[]) {
        if(!actions || actions.length <= 0) return ;
        return new Promise((resolve, reject) => {
            actions.push(cc.callFunc(() => {
                resolve(true);
            }));
            node.runAction(cc.sequence(actions));
        });
    }

    /** 同步的动画 */
    public static async runSyncAnim(node: cc.Node, animName?: string | number) {
        let anim = node.getComponent(cc.Animation);
        if(!anim) return ;
        let clip: cc.AnimationClip = null;
        if(!animName) clip = anim.defaultClip;
        else {
            let clips = anim.getClips();
            if(typeof(animName) === "number") {
                clip = clips[animName];
            }else if(typeof(animName) === "string") {
                for(let i=0; i<clips.length; i++) {
                    if(clips[i].name === animName) {
                        clip = clips[i];
                        break;
                    }
                }
            }   
        }
        if(!clip) return ;
        await CocosHelper.sleep(clip.duration);
    }
    
    /** 加载资源 */
    public static loadRes<T>(url: string, type: typeof cc.Asset, progressCallback?: (completedCount: number, totalCount: number, item: any) => void): Promise<T|any>{
        if (!url || !type) {
            cc.log("参数错误", url, type);
            return;
        }
        CocosHelper.loadProgress.url = url;
        if(progressCallback) {
            this.loadProgress.cb = progressCallback;
        }
        return new Promise((resolve, reject) => {
            cc.resources.load(url,type,this._progressCallback,(err, asset)=>{
                if (err) {
                    cc.log(`${url} [资源加载] 错误 ${err}`);
                    resolve(null);
                }else {
                    resolve(asset);
                }
                // 加载完毕了，清理进度数据
                CocosHelper.loadProgress.url = '';
                CocosHelper.loadProgress.completedCount = 0;
                CocosHelper.loadProgress.totalCount = 0;
                CocosHelper.loadProgress.item = null;
                CocosHelper.loadProgress.cb = null;
            })
            // console.log("加载资源:"+url)
            // cc.loader.loadRes(url, type, this._progressCallback, (err, asset) => {
            //     if (err) {
            //         cc.log(`${url} [资源加载] 错误 ${err}`);
            //         resolve(null);
            //     }else {
            //         resolve(asset);
            //     }
            //     // 加载完毕了，清理进度数据
            //     CocosHelper.loadProgress.url = '';
            //     CocosHelper.loadProgress.completedCount = 0;
            //     CocosHelper.loadProgress.totalCount = 0;
            //     CocosHelper.loadProgress.item = null;
            //     CocosHelper.loadProgress.cb = null;
            // });
        });
    }
    /** 
     * 加载进度
     * cb方法 其实目的是可以将loader方法的progress
     */
    private static _progressCallback(completedCount: number, totalCount: number, item: any) {
        CocosHelper.loadProgress.completedCount = completedCount;
        CocosHelper.loadProgress.totalCount = totalCount;
        CocosHelper.loadProgress.item = item;
        CocosHelper.loadProgress.cb && CocosHelper.loadProgress.cb(completedCount, totalCount, item);
    }
    /**
     * 寻找子节点
     */
    public static findChildInNode(nodeName: string, rootNode: cc.Node): cc.Node {
        if(rootNode.name == nodeName) {
            return rootNode;
        }

        for(let i=0; i<rootNode.childrenCount; i++) {
            let node = this.findChildInNode(nodeName, rootNode.children[i]);
            if(node) {
                return node;
            }
        }
        return null;
    }

    /** 检测前缀是否符合绑定规范 */
    public static checkNodePrefix(name: string) {
        if(name[0] !== SysDefine.SYS_STANDARD_Prefix) {
            return false;
        }
        return true;
    }
    /** 检查后缀 */
    public static checkBindChildren(name: string) {
        if(name[name.length-1] !== SysDefine.SYS_STANDARD_End) {
            return true;
        }
        return false;
    }
    /** 获得类型和name */
    public static getPrefixNames(name: string) {
        if(name === null) {
            return ;
        }
        return name.split(SysDefine.SYS_STANDARD_Separator);
    }
    /** 获得Component的类名 */
    public static getComponentName(com: Function) {
        let arr = com.name.match(/<.*>$/);
        if(arr && arr.length > 0) {
            return arr[0].slice(1, -1);
        }
        return com.name;
    }
}