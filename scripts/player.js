/// <reference path="jquery-1.7.1.min.js" />
/// <reference path="bigscreen.js"/>

var videoPlayer = {
    videoId: "",
    answerVideoId: "",
    player: null,
    answerVideo: null,
    options: {},
    initial: function (id, awId, opts) {
        this.videoId = id;
        this.answerVideoId = awId;
        this.options = opts;
        this.initialVideo();
        //video容器
        var videoContainer = $(".video_container");
		videoContainer.attr("tabindex","0");
        //保持和video同样的宽度
        //videoContainer.css("width", this.player.width);
        //videoContainer.css("height", this.player.height + 25);
        //问题div
		videoContainer.append(videoPlayer.QuestionControl.initial(this.player, opts.questions));
		videoContainer.append(videoPlayer.pptControl.initial(this.player, opts.ppts));
		videoContainer.append(videoPlayer.srtControl.initial(this.player, opts.srts));
        //播放控制div
        var div = $("<div class='video_controlbar'></div>");
        div.append(videoPlayer.PlayButton.initial(this.player));
        var pgrDiv = $("<div class='progressContainer'></div>");
        pgrDiv.append(videoPlayer.LoadProgressBar.initial(this.player));
        pgrDiv.append(videoPlayer.keyPointsControl.initial(this.player, opts.keypoints));
        pgrDiv.append(videoPlayer.ProgressBar.initial(this.player));
        div.append(pgrDiv);
        var infoDiv = $("<div style='float:right'></div>");
        infoDiv.append(videoPlayer.TimerMarker.initial(this.player));
        infoDiv.append(videoPlayer.VolumeBar.initial(this.player));
        infoDiv.append(videoPlayer.FullScreen.initial(this.player));
        div.append(infoDiv);
        //保持和video同样的宽度
        videoContainer.append(div);
    },

    initialVideo: function() {
        this.player = document.getElementById(this.videoId);
        $(this.player).css("display", "block");
        $(this.player).css("background", "black");
        $(this.player).css("width", "100%");
        $(this.player).css("height", "100%");
        $(this.player).on("contextmenu", function () { return false; });
        if (this.options.url != null && this.options.url.length > 0) {
            this.player.src = this.options.url;
            this.player.load();
        }
        //this.player.poster = this.options.poster;

        this.answerVideo = document.getElementById(this.answerVideoId);
        $(this.answerVideo).css("display", "none");
        $(this.answerVideo).css("background", "black");
        $(this.answerVideo).css("width", "100%");
        $(this.answerVideo).css("height", "100%");
        $(this.answerVideo).on("contextmenu", function () { return false; });
        if (this.options.answerUrl != null && this.options.answerUrl.length > 0) {
            this.answerVideo.src = this.options.answerUrl;
            this.answerVideo.load();
        }
    },
    
    registEvent: function (eventName, callback) {
        if (this.player == null)
            return;
        
        if (typeof (callback) == "function" && callback != null)
            $(this.player).on(eventName, callback);
    },

    play: function() {
        this.player.play();
    },
    
    playAnswer: function () {
        this.answerVideo.play();
    },
   
    pause:function() {
        this.player.pause();
    },
    
    pauseAnswer: function () {
        this.answerVideo.pause();
    },

    stop:function() {
        this.player.pause();
    },

    seek: function (pos) {
        this.player.currentTime = pos;
    },
    
    seekAnswer: function (pos) {
        this.answerVideo.currentTime = pos;
    },
    
    setVolume:function(val) {
        this.player.volume = val;
        this.answerVideo.volume = val;
    },
    
    showCourseVideo:function(isShow) {
        if (isShow) {
            $(this.answerVideo).css("display", "none");
            $(this.player).css("display", "block");
            $(".video_controlbar").fadeIn();
        } else {
            $(this.player).css("display", "none");
            $(this.answerVideo).css("display", "block");
            $(".video_controlbar").fadeOut();
        }
    },
    
    showMiniWindow: function (ismini) {
        if (ismini) {
            $(".player_container").addClass("miniVideo");
            $(".video_controlbar").fadeOut();
        } else {
            $(".player_container").removeClass("miniVideo");
            $(".video_controlbar").fadeIn();
        }
    },

    getBufferdPercent: function () {
        var buffered = this.player.buffered;
        if (buffered.length == 0)
            return 0;
        var end = this.player.buffered.end(0);
        return end * 100.0 / videoPlayer.player.duration;
    },

    getTimeFormat: function (seconds) {
        var minuteFloor = Math.floor(seconds / 60);
        var m = minuteFloor < 10 ? "0" + minuteFloor : minuteFloor;
        var secondFloor = Math.floor(seconds - (m * 60));
        var s = secondFloor < 10 ? "0" + secondFloor : secondFloor;
        return m + ":" + s;
    },
};

videoPlayer.Event = {
    End: "ended",
    TimeUpdate: "timeupdate",
},

videoPlayer.PlayButton = {
    el: null,
    isPlay: false,
    initial: function(pl) {
        var html = '<div class="play_pause_box play_b" id="playPauseBtn"></div>';
        this.el = $(html);
        $(this.el).click(this.controlPlay);
        $(pl).on('ended', this.onplayend);
        return this.el;
    },

    controlPlay: function () {
        if (videoPlayer.PlayButton.isPlay)
            videoPlayer.pause();
        else 
            videoPlayer.play();
        videoPlayer.PlayButton.isPlay = !videoPlayer.PlayButton.isPlay;
        videoPlayer.PlayButton.setStyle();
    },

    onplayend: function() {
        videoPlayer.PlayButton.controlPlay();
    },

    setStyle: function() {
        if (videoPlayer.PlayButton.isPlay)
            $("#playPauseBtn").addClass("pause_b");
        else
            $("#playPauseBtn").removeClass("pause_b");
    },
};

videoPlayer.FullScreen = {
    el: null,
    docOrigOverflow: "",
    initial: function (pl) {
        this.orgWidth = pl.width;
        this.orgHeight = pl.height;
        var html = '<div class="full_normal_box"></div>';
        this.el = $(html);
        $(this.el).click(this.screenStateChange);
        return this.el;
    },

    execfullScreen: function() {
        var requestMethod = videoPlayer.player.requestFullScreen || videoPlayer.player.webkitRequestFullScreen || videoPlayer.player.mozRequestFullScreen || videoPlayer.player.msRequestFullScreen;
        if (requestMethod) {
            requestMethod.call(videoPlayer.player);
        } else if (typeof window.ActiveXObject !== "undefined") {
            var wscript = new ActiveXObject("WScript.Shell");
            if (wscript !== null) {
                wscript.SendKeys("{F11}");
            }
        }
    },

    exitFullScreen: function() {
        var requestMethod = videoPlayer.player.cancelFullScreen || videoPlayer.player.webkitCancelFullScreen || videoPlayer.player.mozCancelFullScreen || videoPlayer.player.exitFullscreen;
        if (requestMethod) { 
            requestMethod.call(videoPlayer.player);
        } else if (typeof window.ActiveXObject !== "undefined") { 
            var wscript = new ActiveXObject("WScript.Shell");
            if (wscript !== null) {
                wscript.SendKeys("{F11}");
            }
        }
    },

    screenStateChange: function() {
        if($(this).hasClass("normal_screen")){
            videoPlayer.FullScreen.changeScreen(false);
        }
        else {
            videoPlayer.FullScreen.changeScreen(true);
        }
    },

    changeScreen: function (isFullScreen) {
        var container = $(".video_container");
        if (isFullScreen) {
            videoPlayer.FullScreen.docOrigOverflow = container.css("overflow");
            // Add listener for esc key to exit fullscreen
            container.on('keydown', this.fullWindowOnEscKey);
            //隐藏滚动条
            container.css("overflow", 'hidden');
            //设置样式
            container.addClass('videocontainer-full-window');
            $(videoPlayer.player).addClass("video-fullscreen");
            $(".video_controlbar").addClass("controlbar-fullscreen");
            $(".question").addClass("question-fullscreen");
            $(this.el).addClass("normal_screen");
        } else {
            container.css("overflow", videoPlayer.FullScreen.docOrigOverflow);
            container.removeClass('videocontainer-full-window');
            $(videoPlayer.player).removeClass("video-fullscreen");
            $(".video_controlbar").removeClass("controlbar-fullscreen");
            $(".question").removeClass("question-fullscreen");
            $(this.el).removeClass("normal_screen");
            container.off('keydown', this.fullWindowOnEscKey);
        }

        BigScreen.toggle(document.getElementsByClassName("video_container")[0], null, null, null);
    },

    fullWindowOnEscKey: function(e) {
        if (e.keyCode === 27) {
            videoPlayer.FullScreen.changeScreen(false);
        }
    },
};

videoPlayer.ProgressBar = {
    el: null,
    IsDrag: false,
    IsPlayOver: false,
    initial: function (pl) {
        var html = '<div class="progress_bar"><span class="time_bar"></span><span class="cur_positon" id="progressDrag"></span></div>';
        this.el = $(html);
        $(pl).on('timeupdate', this.updateProgress);
        //已播放的部分click
        $(this.el).find(".time_bar").click(this.onPlayedProgressClick);
        //整个进度click
        $(this.el).click(this.onProgressClick);
        //$(this.el).find(".cur_positon").mousedown(this.onDragMouseDown);
        //$(".video_container").mousemove(this.onDragMouseMove);
        //$(".video_container").mouseup(this.onDragMouseUp);
        return this.el;
    },

    updateProgress: function () {
        var self = videoPlayer.ProgressBar;
        var percent = videoPlayer.player.currentTime * 100.0 / videoPlayer.player.duration;
        //this.el.css("width", percent + "%");
        $(".progress_bar .time_bar").css("width", percent + '%');
        $(".progress_bar .cur_positon").css("left", (percent - 0.5) + '%');
        //更新播放完成状态
        if (!self.IsPlayOver && percent > 99)
            self.IsPlayOver = true;
    },

    onProgressClick: function (e) {
        //播放完成后启用整个进度的click
        var self = videoPlayer.ProgressBar;
        if(self.IsPlayOver)
            self.updateProgressBar(e);
    },

    onPlayedProgressClick: function (e) {
        videoPlayer.ProgressBar.updateProgressBar(e);
    },

    onDragMouseDown: function (e) {
        var self = videoPlayer.ProgressBar;
        self.IsDrag = true;
        self.updateProgressBar(e);
    },
	
    onDragMouseUp: function (e) {
        var self = videoPlayer.ProgressBar;
        if (self.IsDrag) {
            self.IsDrag = false; //停止拖动
            self.updateProgressBar(e);
        }
    },
	
    onDragMouseMove: function(e) {
        var self = videoPlayer.ProgressBar;
        if (self.IsDrag) {
            self.updateProgressBar(e);
        }
    },

    updateProgressBar: function(e) {
        var progress = $('.progress_bar');
        var maxduration = videoPlayer.player.duration;
        var position = e.pageX - progress.offset().left;
        var totalWidth = progress.width();
        var percentage = 100 * position / totalWidth;
        //检查拖动进度条的范围是否合法
        if (percentage > 100) {
            percentage = 100;
        }

        if (percentage < 0) {
            percentage = 0;
        }

        $(".progress_bar .time_bar").css("width", percentage + '%');
        $(".progress_bar .cur_positon").css("left", (percentage - 0.7) + '%');
        //定位播放器
        videoPlayer.seek(maxduration * percentage / 100);
    },
};

videoPlayer.LoadProgressBar = {
    el: null,
    initial: function (pl) {
        var html = '<div class="buffer_bar"><span class="load_bar"></span></div>';
        this.el = $(html);
        //绑定加载进度事件
        $(pl).on("progress", this.updateLoadProgress);
        return this.el;
    },

    updateLoadProgress: function () {
        var percent = videoPlayer.getBufferdPercent();
        videoPlayer.LoadProgressBar.el.css("width", percent + "%");
        //$(".load_bar").css("width", percent + '%');
        if (percent >= 100) {
            //加载完成移除事件
            $(videoPlayer.player).off("progress", videoPlayer.LoadProgressBar.updateLoadProgress);
        }
    },
};

videoPlayer.TimerMarker = {
    el: null,
    initial: function(pl) {
        var html = '<div class="timer_box"><span class="cur_timer"></span>/<span class="total_timer"></span></div>';
        this.el = $(html);
        //获取duration
        $(pl).bind("loadedmetadata", this.durationChange);
        $(pl).on('timeupdate', this.updatePlayPosition);
        return this.el;
    },

    durationChange: function() {
        $('.total_timer').text(videoPlayer.getTimeFormat(videoPlayer.player.duration));
    },

    updatePlayPosition:function() {
        var curPos = videoPlayer.getTimeFormat(videoPlayer.player.currentTime);
        $(".cur_timer").text(curPos);
    },
};

videoPlayer.VolumeBar = {
    el: null,
    volumeDragFlag: false,
    initial:function(pl) {
        var html = '<div class="volume_box"><span class="volume_icon"></span><div class="volume_bar"><span></span></div></div>';
        this.el = $(html);
        $(pl).bind("volumechange", this.updateVolume);
        var bar = $(this.el).find(".volume_bar");
        bar.mousedown(this.onmousedown);
        bar.mouseup(this.onmouseup);
        bar.mousemove(this.onmousemove);

        var icon = $(this.el).find(".volume_icon");
        icon.click(this.onvolumeIconclick);
        pl.volume = 0.3;
        return this.el;
    },

    updateVolume: function () {
        var percentage = videoPlayer.player.volume * 100;
        $(".volume_bar span").css("width", percentage + "%");
    },

    onmousedown: function (e) {
        videoPlayer.VolumeBar.volumeDragFlag = true;
        videoPlayer.VolumeBar.updateVolumeBar(e.pageX);
    },

    onmouseup: function (e) {
        if (videoPlayer.VolumeBar.volumeDragFlag) {
            videoPlayer.VolumeBar.updateVolumeBar(e.pageX);
            videoPlayer.VolumeBar.volumeDragFlag = false;
        }
    },

    onmousemove: function (e) {
        if (videoPlayer.VolumeBar.volumeDragFlag)
            videoPlayer.VolumeBar.updateVolumeBar(e.pageX);
    },

    onvolumeIconclick:function (){
        var volumeBarPos = $(".volume_bar").offset().left;
        if ($(this).hasClass("un_volume"))
            videoPlayer.VolumeBar.updateVolumeBar(volumeBarPos + $(".volume_bar").width() * 0.2, videoPlayer.player);
        else
            videoPlayer.VolumeBar.updateVolumeBar(volumeBarPos, videoPlayer.player);
    },

    updateVolumeBar: function(x) {
        var volume = $(".volume_bar");
        var borderRadius = 2; //2为边框圆角
        var position = x - volume.offset().left;
        var volumeWidth = volume.width() - borderRadius;
        var percentage = 100 * position / volumeWidth;
        //检查拖动进度条的范围是否合法
        if (percentage > 100) {
            percentage = 100;
        }
        if (percentage < 0) {
            percentage = 0;
            videoPlayer.player.muted = true;
        }

        //videoPlayer.player.volume = percentage / 100;
        //全局控制声音
        videoPlayer.setVolume(percentage / 100);
        volume.find("span").css('width', percentage + '%');
        if (videoPlayer.player.volume) {
            $(".volume_icon").removeClass("un_volume");
        } else {
            $(".volume_icon").addClass("un_volume");
        }
    },
};

videoPlayer.keyPointsControl = {
    el: null,
    _keyPoints: [],
    isPlayerLoadCompleted: false,//播放器是否加载完成

    initial: function (pl, kps) {
        this._keyPoints = kps;
        var html = '<div class="keypointsbar"></div>';
        this.el = $(html);
        $(pl).one("loadedmetadata", function () {
            videoPlayer.keyPointsControl.isPlayerLoadCompleted = true;
            videoPlayer.keyPointsControl.showKeypoints();
        });
        return this.el;
    },

    showKeypoints: function () {
        if (!videoPlayer.keyPointsControl.isPlayerLoadCompleted)
            return;
        
        var items = videoPlayer.keyPointsControl._keyPoints;
        if (items.length < 1)
            return;

        videoPlayer.keyPointsControl.el.empty();
        for (var i = 0; i < items.length; i++) {
            var obj = $('<a class="keypoint" title="' + items[i].des + '" href="#" time="' + items[i].time + '"></a>');
            var left = items[i].time * 100.0 / videoPlayer.player.duration;
            obj.css("left", left + "%");
            obj.click(videoPlayer.keyPointsControl.onKeypointClick);
            videoPlayer.keyPointsControl.el.append(obj);
        }
    },

    onKeypointClick: function(e) {
        var time = $(e.currentTarget).attr("time");
        videoPlayer.seek(time);
    },

    addKeypoints: function (kpts) {
        if ( kpts == null || kpts.length < 1)
            return;
        
        var self = videoPlayer.keyPointsControl;
        kpts.each(function (i, val) {
            self._keyPoints.push(val);
        });
        
        self.showKeypoints();
    },
};

videoPlayer.QuestionControl = {
    el: null,
    rangeEnd: 0,
    answerTitles: ['A:', 'B:','C:', 'D:', 'E:', 'F:'],
    questions: [],
    lastPlayPosition: 0,

    initial: function(pl, qs) {
        this.questions = qs;
        this.el = $('<div class="question"></div>');
        $(pl).on('timeupdate', this.playProgressChange);
        return this.el;
    },

    playProgressChange: function () {
        var curPos = videoPlayer.player.currentTime;
        var qs = videoPlayer.QuestionControl.getQuestion(curPos);
        if (qs == null)
            return;

        videoPlayer.pause();
        videoPlayer.QuestionControl.lastPlayPosition = curPos;
        videoPlayer.QuestionControl.loadQuestion(qs);
    },

    addQuestions: function(ques) {
        var self = videoPlayer.QuestionControl;
        ques.each(function(i, val) {
            self.questions.push(val);
        });
    },

    getQuestion: function (time) {
        var temp = videoPlayer.QuestionControl.questions;
        for (var i = 0; i < temp.length; i++) {
            var qs = temp[i];
            if (!qs.isAsked && time <= qs.s && Math.abs(time - qs.s) < 0.1) {
                qs.isAsked = true;
                return qs;
            } 
        }

        return null;
    },
    
    loadQuestion: function (qs) {
        $('.question').html("");
        var dom = $('<div class="qscontent"></div>');
        //题干
        dom.append($('<div class="exerciseTitle">互动练习</div>'));
        dom.append($('<h1 class="qsTitle">' + qs.title + '</h1>'));
        //选项
        var opts = $("<ul></ul>");
        var selectionType = qs.singleSelection ? "radio" : "checkbox";
        for (var i = 0; i < qs.options.length; i++) {
            var isRightAnwser = (qs.answers.indexOf(i) >= 0 || qs.answers.indexOf(i + "") >= 0);
            var checkHtml = '<input name="answer" type="' + selectionType + '" value="' + isRightAnwser + '" s="' + qs.options[i].s + '" e="' + qs.options[i].e + '"/>';
            var item = $('<li>' + checkHtml + '<span>' + videoPlayer.QuestionControl.answerTitles[i] + '</span><a>' + qs.options[i].des + '</a></li>');
            item.find("input").change(videoPlayer.QuestionControl.checkAnswer);
            opts.append(item);
        }

        dom.append(opts);
        $(".question").append(dom);
        videoPlayer.QuestionControl.show();
    },
    
    checkAnswer: function (obj) {
        var isRight = $(obj.currentTarget).val();
        if (isRight == "true") {
            videoPlayer.QuestionControl.invokeRightAnswer();
            return;
        }

        var opt = $(obj.currentTarget);
        var s = opt.attr("s");
        var e = opt.attr("e");
        videoPlayer.QuestionControl.invokeWrongAnswer(s, e);
    },

    invokeRightAnswer: function () {
        videoPlayer.seek(videoPlayer.QuestionControl.lastPlayPosition);
        videoPlayer.showCourseVideo(true);
        videoPlayer.play();
        videoPlayer.QuestionControl.hide();
    },
    
    invokeWrongAnswer: function (s, e) {
        videoPlayer.QuestionControl.rangeEnd = e;
        //绑定进度事件
        $(videoPlayer.answerVideo).on('timeupdate', videoPlayer.QuestionControl.updateAnswerPlayProgress);
        videoPlayer.QuestionControl.hide();
        videoPlayer.showCourseVideo(false);
        videoPlayer.seekAnswer(s);
        videoPlayer.playAnswer();
    },

    //更新分析播放进度
    updateAnswerPlayProgress: function() {
        var curPos = videoPlayer.answerVideo.currentTime;
        var e = videoPlayer.QuestionControl.rangeEnd;
        if (curPos >= e) {
            //移除事件
            $(videoPlayer.answerVideo).off('timeupdate', videoPlayer.QuestionControl.updateAnswerPlayProgress);
            videoPlayer.QuestionControl.rangeEnd = 0;
            videoPlayer.pauseAnswer();
            //再现问题
            videoPlayer.QuestionControl.show();
        }
    },

    show: function () {
        var dom = $(".question");
        dom.css("display", "block");
        dom.css("z-index", "10000");
        dom.fadeIn(1000);
    },
    
    hide:function() {
        var dom = $(".question");
        dom.fadeOut(1000);
        dom.css("display", "none");
    },
};

videoPlayer.pptControl = {
    el: null,
    ppts: [],
    rangeEnd: 0,

    initial: function (pl, ppt) {
        this.ppts = ppt;
        this.el = $('<div class="ppt"><img class="pptimg"/></div>');
        $(pl).on('timeupdate', this.playProgressChange);
        return this.el;
    },
    
    addppts: function (ppts) {
        var self = videoPlayer.pptControl;
        ppts.each(function (i, val) {
            self.ppts.push(val);
        });
    },
    
    playProgressChange: function () {
        var self = videoPlayer.pptControl;
        var curPos = videoPlayer.player.currentTime;
        var ppt = self.getppt(curPos);
        if (ppt == null)
            return;

        //控制播放器缩小
        videoPlayer.showMiniWindow(true);
        self.loadppt(ppt);
    },

    getppt: function (time) {
        var temp = videoPlayer.pptControl.ppts;
        for (var i = 0; i < temp.length; i++) {
            var qs = temp[i];
            if (time <= qs.s && Math.abs(time - qs.s) < 0.1) {
                return qs;
            }
        }

        return null;
    },

    loadppt: function (ppt) {
        var self = videoPlayer.pptControl;
        self.rangeEnd = ppt.e;
        $('.pptimg').attr("src", ppt.url);
        self.show();
        $(videoPlayer.player).on("timeupdate", self.updatePptShowProgress);
    },

    updatePptShowProgress: function () {
        var self = videoPlayer.pptControl;
        var curPos = videoPlayer.player.currentTime;
        var e = self.rangeEnd;
        if (curPos >= e) {
            //移除事件
            $(videoPlayer.player).off('timeupdate', self.updatePptShowProgress);
            self.rangeEnd = 0;
            self.hide();
            videoPlayer.showMiniWindow(false);
        }
    },
    
    show: function () {
        var dom = $(".ppt");
        dom.css("display", "block");
        dom.css("z-index", "10000");
        dom.fadeIn(1000);
    },

    hide: function () {
        var dom = $(".ppt");
        dom.fadeOut(1000);
        dom.css("display", "none");
    },
};

videoPlayer.srtControl = {
    el: null,
    allsrts: [],
    initial: function (pl, srts) {
        this.allsrts = srts;
        this.el = $('<div class="srt"></div>');
        $(pl).on('timeupdate', this.playProgressChange);
        return this.el;
    },

    addsrts: function (srts) {
        var self = videoPlayer.srtControl;
        srts.each(function (i, val) {
            self.allsrts.push(val);
        });
    },

    playProgressChange: function () {
        var self = videoPlayer.srtControl;
        var curPos = videoPlayer.player.currentTime;
        var srt = self.getsrt(curPos);
        if (srt == null) {
            self.hide();
            return;
        }

        self.loadsrt(srt);
        self.show();
    },

    getsrt: function (time) {
        var temp = videoPlayer.srtControl.allsrts;
        for (var i = 0; i < temp.length; i++) {
            var qs = temp[i];
            if (time >= qs.start && qs.end >= time) {
                return qs;
            }
        }

        return null;
    },

    loadsrt: function (srt) {
        var self = videoPlayer.srtControl;
        self.el.html(srt.text);
    },

    show: function () {
        var self = videoPlayer.srtControl;
        self.el.css("display", "block");
    },

    hide: function () {
        var self = videoPlayer.srtControl;
        self.el.css("display", "none");
    },
};

var PlayerKeypoint = function (id, time, des) {
    this.id = id;
    this.time = time;
    this.des = des;
};

var PlayerAnswerItem = function(des, start, end) {
    this.des = des;
    this.s = start;
    this.e = end;
};

var PlayerQuestion = function(start, content, isSingle, answer, options) {
    this.s = start;
    this.title = content;
    this.singleSelection = isSingle;
    this.answers = [answer];
    this.options = options;
    this.isAsked = false;
};

var PlayerSRT = function (start, end, txt) {
    this.start = start;
    this.end = end;
    this.text = txt;
};


$(document).ready(function () {
    var data = {
        url: "http://video-js.zencoder.com/oceans-clip.mp4", 
		poster: "../mainpic.jpg",//http://video-js.zencoder.com/oceans-clip.png",
        answerUrl: "oceans-clip.mp4",//http://video-js.zencoder.com/oceans-clip.mp4
        keypoints: [{ time: 10, des: "aaa" }, { time: 20, des: "bbb" }, { time: 40, des: "cccc" }],
        questions: [],
        ppts:[],
        //ppts: [{ s: 2, e: 10, url: 'http://img2.imgtn.bdimg.com/it/u=769797560,4138365916&fm=23&gp=0.jpg' },
        //        { s: 14, e: 20, url: 'http://img2.imgtn.bdimg.com/it/u=3107998002,1911997068&fm=23&gp=0.jpg' } ],
        srts: [{ start: 0, end: 10, text: "aaaaaaaaaaaaa" }, { start: 20, end: 30, text: "bbbbbbbbb" }],
    };

    $(videoPlayer.initial("example_video_1", "answerVideo", data));
});