import CocosHelper from "../Common/CocosHelper";
import { SysDefine } from "../Common/SysDefine";
import ResMgr from "../Manager/ResMgr";

const {ccclass, property} = cc._decorator;

@ccclass
export default class SoundMgr extends cc.Component {

    private audioCache: {[key: string]: cc.AudioClip} = cc.js.createMap();

    private static _Instance: SoundMgr = null;                     // 单例
    public static get inst(): SoundMgr {
        if(this._Instance == null) {
            this._Instance = cc.find(SysDefine.SYS_UIROOT_NAME).addComponent<SoundMgr>(this);
        }
        return this._Instance;
    }

    onLoad () {
        let volume = this.getVolumeToLocal();
        if(volume) {
            this.volume = volume;
        }else {
            this.volume.musicVolume = 1;
            this.volume.effectVolume = 1;
        }
        this.setVolumeToLocal();
    }
    /** volume */
    private volume: Volume = new Volume();
    getVolume() {
        return this.volume;
    }

    start () {

    }
    /**  */
    public setMusicVolume(musicVolume: number) {
        this.volume.musicVolume = musicVolume;
        this.setVolumeToLocal();
    }
    public setEffectVolume(effectVolume: number) {
        this.volume.effectVolume = effectVolume;
        this.setVolumeToLocal();
    }
    /** 播放背景音乐 */
    public async playBackGroundMusic(url: string) {
        if(!url || url === '') return ;
        
        if(this.audioCache[url]) {
            cc.audioEngine.playMusic(this.audioCache[url], true);
            return ;
        }
        let sound = await ResMgr.inst.loadRes<cc.AudioClip>("_DynamicAssets",url, cc.AudioClip);
        this.audioCache[url] = sound;
        cc.audioEngine.playMusic(sound, true);
    }
    /** 播放音效 */
    public async playEffectMusic(url: string) {
        if(!url || url === '') return ;
        
        if(this.audioCache[url]) {
            cc.audioEngine.playEffect(this.audioCache[url], false);
            return ;
        }
        let sound = await ResMgr.inst.loadRes<cc.AudioClip>("_DynamicAssets",url, cc.AudioClip);
        this.audioCache[url] = sound;
        cc.audioEngine.playEffect(sound, false);
    }

    /** 从本地读取 */
    private getVolumeToLocal() {
        let objStr = cc.sys.localStorage.getItem("Volume_For_Creator");
        if(!objStr) {
            return null;
        }
        return JSON.parse(objStr);
    }
    /** 设置音量 */
    private setVolumeToLocal() {
        cc.audioEngine.setMusicVolume(this.volume.musicVolume);
        cc.audioEngine.setEffectsVolume(this.volume.effectVolume);

        cc.sys.localStorage.setItem("Volume_For_Creator", JSON.stringify(this.volume));
    }

    // update (dt) {}
}

class Volume {
    musicVolume: number;
    effectVolume: number;
}