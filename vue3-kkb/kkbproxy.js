/*
 * @Author: your name
 * @Date: 2020-02-06 15:31:04
 * @LastEditTime : 2020-02-06 15:42:21
 * @LastEditors  : Please set LastEditors
 * @Description: In User Settings Edit
 * @FilePath: \vue-study\vue3-kkb\kkbproxy.js
 */
let obj={name:"开课吧",location:{city:'beijing'}}
// let obj=[1,2,3]
let o = new Proxy(obj,{
    get(target,key){
        console.log("获取值",key);
        return Reflect.get(target,key)
    },
    set(target,key,val){
        console.log("修改值",key,val);
        return Reflect.set(target,key,val)
    }
})
// o.name = "vue3"
// console.log(o.name);
// o.push(4)
// o.unshift(4)

o.location.city="shanghai"


// 1.数组触发多次
// 2.对象嵌套
