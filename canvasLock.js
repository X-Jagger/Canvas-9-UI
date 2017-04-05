/**
 * Created by X.Jagger on 2017/3/27 0027.
 * 线条跟着手势动
 * 密码验证与保存。
 * 响应式大小布局
 * 背景图片
 *
 */
var lock,
    result, //画线的结果保存
    signal = 0,//判断是设置密码还是验证密码,默认为设置密码
    suceessCount = 0;//输入成功的密码次数
lock = (function () {
    var doc = document,
        cwidth = doc.body.offsetWidth,
        radius = 0.05 * cwidth,//响应式半径
        linewidth = 2,//画笔线宽
        wgap, hgap,cheight,
        touchPoints = [],
        ninepoints = [],
        canvas = doc.getElementById("canvas"),
        ctx = canvas.getContext("2d");
        //var img = document.getElementById("scream");

    //设置画布的宽高，并计算圆之间的距离
    function setCanvas() {
        //窗口宽高
        cwidth = doc.body.offsetWidth;

        cheight = doc.body.offsetHeight;
        cheight = cheight/1.5;//让画布占上2/3区域
        canvas.width = cwidth;
        canvas.height = cheight;
        wgap = (cwidth - 3 * 2 * (radius + linewidth)) / 6;//宽间隔
        hgap = (cheight - 3 * 2 * (radius + linewidth)) / 4;//高间隔
    }

    //计算圆心位置
    function circleCenters() {
        var points = [];
        for (var col = 0; col < 3; col++) {
            for (var row = 0; row < 3; row++) {
                var point = {
                    x: wgap * 2 + (radius + linewidth) * (row * 2 + 1) + wgap * row ,
                    y: cheight / 6 + (radius + linewidth) * (col * 2 + 1) + hgap * col
                }
                points.push(point);
            }
        }
        return points;
    }

    //初始化,绘制九个圆
    function initCanvas() {
        ninepoints = circleCenters();
        var len = ninepoints.length;
        ctx.strokeStyle = "white";
        ctx.lineWidth = linewidth;
        for (var i = 0; i < len; i++) {
            ctx.beginPath();
            ctx.arc(ninepoints[i].x, ninepoints[i].y, radius, 0, Math.PI * 2, false);
            ctx.stroke();
        }
    }

    //判断手指是否在圆圈上

    function isPointselect(target) {
        var powx, powy, gap,
            //手指所在页面坐标
            pagex = target.pageX,
            pagey = target.pageY;
        for (var i = 0; i < ninepoints.length; i++) {
            powx = Math.pow((ninepoints[i].x - pagex), 2);
            powy = Math.pow((ninepoints[i].y - pagey), 2);
            gap = Math.sqrt((powx + powy));
            if (gap < radius) //触摸点到圆心的距离小于半径时，触发事件
            {
                if (touchPoints.indexOf(i) === -1) //值i是否存在于数组中
                { //没有划过的点保存下来
                    touchPoints.push(i);
                    //只点击一下时，画小圆
                    ctx.beginPath();
                    ctx.fillStyle = "white";
                    ctx.arc(ninepoints[touchPoints[0]].x, ninepoints[touchPoints[0]].y, 8, 0, 2 * Math.PI, false);
                    ctx.fill();
                }
                break; //结束循环
            }
        }
    }

    //touch事件开始
    function istouchstart(event) {
        var targets = event.touches;
        if (targets.length === 1) {
            isPointselect(targets[0]);
        }
    }

    //move事件
    var position = [];//储存划过的点的x,y坐标
    var initPosition = 0;
    function istouchmove(event) {
        event.preventDefault(); //阻止默认行为滚动
        var target = event.touches[0],
             pagex = target.pageX,//手指所在页面坐标
             pagey = target.pageY,
            touches = event.targetTouches;
        if (touches.length == 1) {//单手指操作
            //已划过的旧点
            var oldpoints = touchPoints,
                oldlen = oldpoints.length,
                maxlen;
            isPointselect(touches[0]);
            newlen = touchPoints.length;
            if(initPosition == 0){//单独加入第一个点
                position.push(ninepoints[touchPoints[0]].x);
                position.push(ninepoints[touchPoints[0]].y);
                initPosition++;
            }
            //有新点产生
            if(newlen > oldlen) {
                     maxlen = newlen - 1,
                    beforecurr = touchPoints[maxlen - 1],
                    currlen = touchPoints[maxlen];
                    position.push(ninepoints[currlen].x);
                    position.push(ninepoints[currlen].y);

            }
            //实现线条跟着手指动
            if(newlen == oldlen){
                //每次移动都清空并初始化画布，再重新连线
                maxlen = newlen ;
                beforecurr = touchPoints[maxlen - 1];
                var cwidth = doc.body.offsetWidth,
                    cheight = doc.body.offsetHeight;
                setTimeout(ctx.clearRect(0, 0, cwidth, cheight), 500);
                lock.initCanvas();
                //连接已经画过的点之间的线，圆心中画小圆
                for(var i = 0; i < position.length; i+=2){
                    ctx.beginPath();
                    ctx.lineWidth = 6;
                    ctx.strokeStyle = "white";
                    ctx.arc(position[i], position[i+1], 8 / 25 * radius, 0, 2 * Math.PI, false);
                    ctx.fillStyle = "white";
                    ctx.fill();
                    ctx.moveTo(position[i], position[i+1]);
                    ctx.lineTo(position[i+2], position[i+3]);
                    ctx.stroke();
                }
                //跟着手指动的线条
                ctx.beginPath();
                ctx.lineWidth = 6;
                ctx.strokeStyle = "white";
                ctx.moveTo(ninepoints[beforecurr].x, ninepoints[beforecurr].y);
                ctx.lineTo(pagex, pagey);
                ctx.stroke();
                ctx.closePath();
            }
        }
    }

    //touch结束事件-判断
    function istouchend() {
        suceessCount ++;
        //重置下面手指移动所用的2个数据
        position = [];
        initPosition = 0;
        //设置密码过程
        if(signal == 0){
            if(touchPoints.length < 5){
                document.getElementById("info").innerHTML = "密码太短，至少需要5个点";
                suceessCount = 0;
                setTimeout(clearcanvas, 500);;
        }else{
                if(suceessCount == 1){//成功一次，清空重新初始化
                    result = touchPoints.join("");
                    setTimeout(clearcanvas, 500);;
                    document.getElementById("info").innerHTML = "请再次输入手势密码";
                }else if (suceessCount == 2){//第二次
                    if(result !== touchPoints.join("")){//如果两次不一样
                        document.getElementById("info").innerHTML = "两次输入的不一致，请重新设置";
                        result = 0;
                        suceessCount = 0;
                        setTimeout(clearcanvas, 500);;
                    }else if(result == touchPoints.join("")){//两次一样
                        document.getElementById("info").innerHTML = "密码设置成功";
                        localStorage[0] =result;
                        result = 0;
                        suceessCount = 0;
                        setTimeout(clearcanvas, 500);
                    }
                }
            }
        }
        //验证密码过程
        else if(signal == 1){
            suceessCount = 0;
            result = touchPoints.join("");
            clearcanvas();
            if(localStorage[0] ==undefined){
                document.getElementById("info").innerHTML = "您还没有设置密码";
                setTimeout(clearcanvas, 500);
            }else{
                if(localStorage[0] !== result){
                    document.getElementById("info").innerHTML = "输入的密码不正确";
                    console.log("验证的密码不正确"+localStorage[0]+"手指划过"+ result)
                    setTimeout(clearcanvas, 500);
                }else if(localStorage[0] == result){
                    document.getElementById("info").innerHTML = "密码正确！";
                }
            }
        }
    }

    //清空画布，并重新绘制九宫格
    function clearcanvas() {
        var cwidth = doc.body.offsetWidth,
            cheight = doc.body.offsetHeight;
        ctx.clearRect(0, 0, cwidth, cheight);
        touchPoints = [];
        lock.initCanvas();
    }

    return {
        setCanvas: setCanvas,
        initCanvas: initCanvas,
        handlestart: istouchstart,
        handlemove: istouchmove,
        handleend: istouchend
    };

})();
//点击“设置密码”
function fnSet(){
    document.getElementById("info").innerHTML = "请输入手势密码";
    signal = 0;

}
//点击“验证密码”
function fnCheck(){
    document.getElementById("info").innerHTML = "请输入手势密码进行验证";
    signal = 1;
}
window.onload = function() {
    lock.setCanvas();
    lock.initCanvas();

};
window.onresize = function() {
    lock.setCanvas();
    lock.initCanvas();
};
document.addEventListener("touchstart", lock.handlestart, false);
document.addEventListener("touchmove", lock.handlemove, false);
document.addEventListener("touchend", lock.handleend, false);
