#zeroclipboard 剪贴板插件的使用#

***

本文主要涉及：

1. 插件的运行原理
2. 插件基本用法与注意事项
3. seajs引用方法与注意事项
4. 经历后的教训

使用前请注意：

* 对于本插件的使用**一定要在服务器环境**下才可以生效，本地或远程都可以
* 插件本身可以兼容部分不规范代码，所以**不要盲目复制**别人的代码
* 本文目的是跟大家分享如何**优雅**地实现这个功能
* 请珍惜自己的双手~~~~

***

##简介##

其实要解决的问题很简单：如何方便地复制网页上的指定内容。这个插件提供的是基于flash的解决方案，**本文基于1.3.5版**，插件官网地址请点击：[ZeroClipboard@github](https://github.com/zeroclipboard/zeroclipboard)

官方有非常详细的使用文档: [1.X的使用文档](https://github.com/zeroclipboard/zeroclipboard/blob/1.x-master/docs/instructions.md) [2.X的使用文档](https://github.com/zeroclipboard/zeroclipboard/blob/master/docs/instructions.md)


##插件的运行原理##

本插件基于flash将要复制的内容设置为flash插件的数据，再通过flash的接口复制到操作系统的剪贴板中。这样做最大的好处就是通过flash解决网页的兼容性问题，HTML5中虽然提供了读取剪贴板的方法但写入内容还不支持（至少我是没成功过）。

但是这样做有个安全问题：flash插件可以随时访问你的剪贴板内容。如果你刚好复制了你的敏感信息（比如密码，证件号码等），又访问了这个网页，那么它就可以轻易地获取你的数据并传到第三方的服务器上。所以之后的版本中特意加入了一定要用户点击相应的swf文件才可以操作剪贴板的限制，这样就要求引入的swf插件要覆盖用户点击的部分，带来的问题就是会影响hover伪类、样式、z-index的问题和相应事件的触发，当然，在插件中会对此进行对应的弥补设置的

##插件基本用法与注意事项##

插件的使用主要包括三个部分：

* 插件自身的JS文件
* 基于flash的swf插件
* 使用者写的控制代码

声明插件的实例同时把元素节点作为参数传进去，就可以使用了：

	var client = new ZeroClipboard($(".clipbord"), {
	    moviePath: "//a.alipayobjects.com/gallery/zeroclipboard/1.3.5/ZeroClipboard.swf?noCache=1409909828475",
	    hoverClass: "show",
	    forceHandCursor: true,
	    trustedDomains: ['*']
	});

配置参数中可选项很多：[点击查看详细说明](https://github.com/zeroclipboard/zeroclipboard/blob/1.x-master/docs/instructions.md#configuration-options)

主要参数有以下几点：

* swfPath/moviePath指定引入flash插件的位置，默认会查找当前目录的ZeroClipboard.swf文件，建议指定一下比较好。（仅此为必填项，其它选填）
* hoverClass和activeClass用来解决上文提到的覆盖的影响，如果当前元素有hover伪类的效果，要重定义在配置文件中，如例子中定义为show这个class样式
* forceHandCursor设置hover时用户鼠标为cursor手型
* trustedDomains信任域的设置，用来解决可能遇到的插件跨域问题。
* debug: true  是否输出调试信息。

当然在DOM中也要有相应的元素（本例中是id为"my-button"的元素）来触发事件

###在相应需求与场景中的使用方式###

1. 其中 data-clipboard-text属性就是最基础的一种用法，如果元素没有用后续的方法添加事件的话就会复制属性内容"Copy me!"到剪贴板中，适用于复制固定内容，无格式，短小。比如某些招商页面的电话等信息。

		<button id="my-button" data-clipboard-text="Copy me!">Copy to Clipboard</button>

	在线demo请点击：[demo](http://jsfiddle.net/ffnuku90/)

2. 如果你想让复制功能对应网页上的某段内容就要用到另一个属性：data-clipboard-target，这样的话就会复制以value为**ID名**的元素内容或值了。这种情况主要适用于页面上单一内容的复制，比如生成短链接后的复制。

		<button id="my-button_text" data-clipboard-target="clipboard_text">Copy to Clipboard</button>
		<input type="text" id="clipboard_text" value="Clipboard Text"/>
	在线demo请点击：[demo](http://jsfiddle.net/fdt5bewx/)

3. 更强大的功能在此，针对页面多个节点统一绑定事件复制相应选择器内容：

        var client = new ZeroClipboard($(".clipbord"), {
            moviePath: "//a.alipayobjects.com/gallery/zeroclipboard/1.3.5/ZeroClipboard.swf?noCache=1409909828475",
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
        });

其中声明部分是相同的，主要是在使用上应用了多个事件，大致解释如下：

* load事件是在载入完成后触发
* datarequested是重点，用来控制元素被点击时执行的操作，用回调函数中client对象的setText方法来指定具体的复制内容。
* complete则是复制动作完成后触发的事件。
* noflash/wrongflash指定无swf文件/swf文件错误时的事件 
* 除此之外还有mouseUp,mouseDown,mouseOver,mouseOut等用来处理相应的事件

##seajs引用方法与注意事项##

其实内容相同，只不过是用seajs引用模块的方式来调用插件

	seajs.use(['gallery/zeroclipboard/1.3.5/zeroclipboard'], function(ZeroClipboard) {}

支付宝的Arale库中目前仅支持到1.3.5版，其它的库中自行参照格式调用，需要注意的是在swf文件引入的时候可能会因为文件位置造成跨域通信的安全禁止，这时要在实例化中配置trustedDomain免于载入失败

不过trustedDomain仅限于JS跨域的解决，跨协议跨端口什么的……请自行补充相关知识

##经历后的教训##

1. 不要随便copy别人的代码来用，更不要因为没有效果就放弃并抱怨
2. 即使是作者在github上的demo也有可能因为种种原因出现偏差，要记得关注FAQ并主动提问
3. 作者在开发插件时应用的设计思想很值得学习，提供多种调用方式，由简至繁，保证初级用户的使用方便和高级用户的自定义需要。在更新版本时也很好地兼容了老版的使用方法，并作出隐性提示。
4. 代码会过期，会失效，但设计思想理念永存，好好学习！