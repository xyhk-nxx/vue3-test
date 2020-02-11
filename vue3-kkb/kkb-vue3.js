/*
 * @Author: your name
 * @Date: 2020-02-06 15:45:30
 * @LastEditTime : 2020-02-06 20:45:14
 * @LastEditors  : Please set LastEditors
 * @Description: In User Settings Edit
 * @FilePath: \vue-study\vue3-kkb\kkb-vue3.js
 */
let toProxy = new WeakMap();
let toRow = new WeakMap();
const baseHander = {
    get(target,key){
        const res = Reflect.get(target,key)
        // 收集依赖
        track(target,key)
        // 递归寻找
        return typeof res == 'object'?reactive(res):res
    },
    set(target,key,val){
        const info = {oldValue:target[key],newValue:val}
        const res = Reflect.set(target,key,val)
        trigger(target,key,info)
        return res
    }
}
function  reactive(target){
    // 查询缓存
    let observed = toProxy.get(target)
    if(observed){
        return observed
    }
    if (toRow.get(target)) {
        return target
    }
    observed = new Proxy(target,baseHander)
    // 设置缓存
    toProxy.set(target,observed)
    toRow.set(observed,target)
    return observed
}
// 存储effect
const effectStack = []
let targetMap = new WeakMap();
function track(target,key){
    let effect = effectStack[effectStack.length-1];
    if (effect) {
        let depsMap = targetMap.get(target)
        if(depsMap === undefined){
            depsMap = new Map();
            targetMap.set(target,depsMap)
        }
        let dep = depsMap.get(key);
        if (dep===undefined) {
            dep=new Set();
            depsMap.set(key,dep)
        }
        if (!dep.has(effect)) {
            dep.add(effect)
            effect.deps.push(dep)
        }
    }
}
// {


// target:{
//   age:[effect] (set)
//     }
// }
function trigger(target,key,info){
    // 触发更新
    // 获取依赖
    const depsMap =  targetMap.get(target)
    if (depsMap===undefined) {
        return
    }
    const effects = new Set();
    const computedRunners = new Set();
    if (key) {
        let deps = depsMap.get(key)
        deps.forEach(effect=>{
            if (effect.computed) {
                computedRunners.add(effect)
            }else{
                effects.add(effect)
            }
        })
    }
    effects.forEach(effect=>effect())
    computedRunners.forEach(effect=>effect())
}
function effect(fn,options={}){
    let e = createReactiveEffect(fn,options)
    if (!options.lazy) {
        e();
    }
    return e;
}
function createReactiveEffect(fn,options){
    const effect = function effect(...args){
        return run(effect,fn,args)
    }
    effect.deps =[]
    effect.computed = options.computed
    effect.lazy = options.lazy
    return effect;
}
function run(effect,fn,args){
    if (effectStack.indexOf(effect)===-1) {
        try{
            effectStack.push(effect)
            return fn(...args)
        }
        finally{
            effectStack.pop()
        }
    }
}




function computed(fn){
    const runner = effect(fn,{
        computed:true,lazy:true
    })
    return {
        effect:runner,
        get value(){
            return runner();
        }
    }
}