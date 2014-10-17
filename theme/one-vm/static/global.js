function byId (id) {
    return document.getElementById(id);
}

function initPage () {        //分状态初始化函数
    $('.entry-content a').each(function (index) {
        if($(this).attr('href').indexOf("#") !== 0){
            $(this).attr('target','_blank');
        }
    });
    //加入复制到剪贴版按钮
    $("pre").append("<span class='clipbord'>复制到剪贴版</span>");
    //锚点链接自动定位
    var ua = navigator.userAgent.toLowerCase();
    var hash = (ua.indexOf("chrome") == -1 && ua.indexOf("safari") > 0) ? decodeURI(window.location.hash).substr(1) : window.location.hash.substr(1);

    if($(byId(hash)).length > 0){
        $("html, body").animate({scrollTop: $(byId(hash)).offset().top}, 800);
    }
    _sidebarInit();
    _clipInit();
}

function initScroll () {        //滚动响应函数
    var scrollTop = $(window).scrollTop();
    _titleActive();
    _elFixed(scrollTop);
}


$(document).ready(function (){
    initPage();
    initScroll();
    $(window).scroll(function(){
        if($(window).width() > 640){
            initScroll();
        }
    });
    $(".threecol.meta").on("click", "a", function (event) {       //动画滚动到指定锚点
        if(history.pushState && event){
            event.preventDefault();    //不支持historyAPI则退化为默认方法
            var t = $(this), url;
            $("html, body").animate({scrollTop: $(t.attr("href")).offset().top}, 800);
            url = window.location.pathname.split("/");
            history.pushState({}, "", url[url.length - 1] + t.attr("href"));
        }
    });
    $(".navbar-toggle").click(function () {             //小屏下切换菜单
        $(".header-nav").slideToggle(800);
    });
    $(".nav > li > a").click(function (e) {             //小屏下导航展开
        if($(this).next().length > 0){
            var oEvent = e || event;
            oEvent.preventDefault();
            $(this).parent().siblings().find("ul").hide();
            $(this).next().toggle();
        }
    });
    $("pre code").mousedown(function () {             //鼠标选择文本
        $(this).siblings(".clipbord").addClass("hide");
    });
    $(document).mouseup(function () {
        if (document.getSelection && jQuery.trim(document.getSelection().toString()).length === 0) {
            $(".clipbord").removeClass("hide");
        }
    });
});

function _sidebarInit () {          //初始化边栏
    var titleNodes=$('.document .entry-content').find('h1,h2');
    var sidebar=$('.threecol.meta');
    var htmlStr='';
    htmlStr+='<div id="sidebar-wrapper">';
    htmlStr+='<div id="sidebar-fixed-nav">';
    titleNodes.each(function(index){
        if($(this).attr('id') && $(this).is("h1")){
            if(index!==0){
                htmlStr+='</dl>';
            }
            htmlStr+='<dl>';
            htmlStr+=('<dt data-index="'+index+'"><a href="#'+$(this).attr('id')+'">' +$(this).text()+'</a></dt>');
        }
        else if($(this).attr('id') && $(this).is("h2")){
            htmlStr+=('<dd data-index="'+index+'"><a href="#'+$(this).attr('id')+'">' +$(this).text()+'</a></dd>');
        }
    });
    htmlStr+='</dl>';
    htmlStr+='</div>';
    htmlStr+='</div>';
    sidebar.html(htmlStr);
}

function _elFixed (scroT) {       //导航栏与边栏自动定位
    //获取要定位元素与边栏的相对距离
    var sidebarBtmFixed = $(".header-nav").outerHeight() + parseInt($("#sidebar-wrapper").closest(".mar").css("marginTop"), 0);
    //获取要定位元素距离浏览器顶部的距离
    var navTop = $(".header-nav").offset().top;
    //获取要定位元素在最底部时的offsetTop
    var nav_maxBottom = $(".footer").offset().top - $("#sidebar-wrapper").outerHeight() - sidebarBtmFixed;
    //获取滚动条的滚动距离
    if(scroT < navTop){                                   //nav未到顶一些如常
        $("#sidebar-wrapper").removeClass('sidebar-fixed-top').css({top: 'auto'});
        $(".navigation").removeClass('navigation-fix navigation-btm').css({top: 'auto'});
        //控制滚动条高度
        $("#sidebar-wrapper").css({maxHeight: $(window).height() - 77});
    }
    else if(scroT >= navTop && scroT < nav_maxBottom){    //nav到顶sidebar未到底，fixed
        $("#sidebar-wrapper").addClass('sidebar-fixed-top');
        $(".navigation").addClass('navigation-fix').removeClass('navigation-btm').css({top: 0});
        //控制滚动条高度
        $("#sidebar-wrapper").css({maxHeight: $(window).height() - 20});
    }
    else{                                               //sidebar到底，fixed取消
        $("#sidebar-wrapper").removeClass('sidebar-fixed-top').offset({top: nav_maxBottom + sidebarBtmFixed});
        $(".navigation").addClass('navigation-fix navigation-btm').offset({top: nav_maxBottom});
        //控制滚动条高度
        $("#sidebar-wrapper").css({maxHeight: $(window).height() - 100});
    }
}

function _titleActive() {       //边栏标题跟随
    var titleNodes=$('.document .entry-content').find('h1,h2');
    var sidebar=$('.threecol.meta');

    titleNodes.each(function(index){
        if(this.getBoundingClientRect().bottom > 17 && this.getBoundingClientRect().top < $(window).innerHeight()){
            var curNode=sidebar.find('[data-index="'+index+'"]');
            curNode.closest('dl').siblings('dl').removeClass('active');
            curNode.closest('dl').addClass('active');
            curNode.closest('dl').find('dd').removeClass('active');
            switch(this.nodeName.toUpperCase()){
                case 'H1':
                    curNode.closest('dl').find('dd').eq(0).addClass('active');
                    break;
                case 'H2':
                    curNode.addClass('active');
                    break;
            }
            return false;
        }
    });
}

function _clipInit () {         //剪贴板初始化
    var client = new ZeroClipboard($(".clipbord"), {
        moviePath: "https://a.alipayobjects.com/gallery/zeroclipboard/1.3.5/ZeroClipboard.swf",
        hoverClass: "show",
        forceHandCursor: true,
        trustedDomains: ['*']
    });
    client.on('load', function(client) {
        client.on('datarequested', function(client) {
            client.setText($(this).prev().text());
        });
        client.on('complete', function(client, args) {
            var t = $(this);
            t.html("复制成功");
            setTimeout(function () {
                t.html("复制到剪贴版");
            }, 3000);
        });
    });
    client.on('wrongflash noflash', function() {
        ZeroClipboard.destroy();
        $("span.clipbord").remove();
    });
}