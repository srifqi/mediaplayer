// mediaplayer.js by srifqi
var MP = MP || {};

MP.Player = function(destination){
	this.id = Date.now()+(Math.random()*1e9|0);
	this.playlist = [];
	this.at = 0;
	this.destination = document.body;
	this.audio = document.createElement("audio");
	this.audio.style.display = "none";
	
	// callback
	this.callbacks = {
		changesrc: function(){},
		timeupdate: function(){}
	};
	
	// library
	// https://gist.github.com/srifqi/91a765cb5a0dcb925454
	var css = function(){for(var b=[].slice.call(arguments),a=b.length-2,c=b[a+1];a>-1;a--)for(var d in c)b[a].style[d]=c[d];}
	
	// prototype
	var controls = this.controls = {
		tp: document.createElement("button"),	//toogleplay
		p: document.createElement("button"),	//prev
		n: document.createElement("button"),	//next
		t: document.createElement("span"),		//time
		s: document.createElement("input"),		//seek
		m: document.createElement("button"),	//mute
		v: document.createElement("input"),		//volume
		pb: document.createElement("button"),	//playlist button
		pl: document.createElement("div")		//playlist
	};
	
	css(controls.p, controls.n, controls.tp, controls.t, controls.s, controls.m, controls.v, controls.pb, {
		margin: "7px 8px",
		padding: 0,
		border: 0,
		background: "#eee",
		width: "16px",
		height: "16px",
		fontSize: "16px",
		display: "inline-block",
		cursor: "pointer"
	});
	controls.p.style.marginLeft = "7px";
	controls.v.style.marginRight = "7px";
	controls.t.style.cursor = "";
	controls.pl.style.display = "none";
	css(controls.t, controls.v, {width: "48px"});
	
	controls.p.innerHTML = "<div style=\"width:16px;height:16px;background:url('assets/controls.png') 0px -16px;\"></div>";
	controls.n.innerHTML = "<div style=\"width:16px;height:16px;background:url('assets/controls.png') -16px -16px;\"></div>";
	controls.tp.innerHTML = 
		"<div style=\"width:16px;height:16px;background:url('assets/controls.png');\"></div>"+
		"<div style=\"width:16px;height:16px;display:none;background:url('assets/controls.png') -16px 0px;\"></div>";
	controls.t.innerHTML = "00:00:00";
	controls.m.innerHTML = 
		"<div style=\"width:16px;height:16px;background:url('assets/controls.png') 0px -32px;\"></div>"+
		"<div style=\"width:16px;height:16px;display:none;background:url('assets/controls.png') -16px -32px;\"></div>";
	controls.pb.innerHTML = "<div style=\"width:16px;height:16px;background:url('assets/controls.png') 0px -48px;\"></div>";
	
	controls.s.type = controls.v.type = "range";
	controls.s.style.width = "50%";
	controls.s.min = controls.v.min = 0;
	controls.v.max = 1;
	controls.v.step = 0.01;
	
	css(controls.pl, {
		position: "fixed",
		top: "0", left: "0",
		background: "#eee"
	});
	
	this.init = function(){
		this.update_playlist();
		this.destination.innerHTML = "<div id=\""+this.id+"\" style=\""+
			"background:#eee;width:100%;position:fixed;bottom:0;left:0;z-index:999999;border:1px solid black;"+
		"\">"+
		"</div>";
		document.getElementById(this.id).appendChild(controls.p);
		document.getElementById(this.id).appendChild(controls.n);
		document.getElementById(this.id).appendChild(controls.tp);
		document.getElementById(this.id).appendChild(controls.t);
		document.getElementById(this.id).appendChild(controls.s);
		document.getElementById(this.id).appendChild(controls.m);
		document.getElementById(this.id).appendChild(controls.v);
		document.getElementById(this.id).appendChild(controls.pb);
		document.getElementById(this.id).appendChild(controls.pl);
		document.getElementById(this.id).appendChild(this.audio);
		this.updatetime();
		this.callbacks.changesrc(this);
	};
	
	this.update_playlist = function(){
		this.audio.src = this.playlist[this.at] || "";
		
		var t = "<ul style=\"list-style-type:none;padding:8px;\">"+
			"<big><b>Playlist</b></big>"+
		"<br/>";
		var scope = this; // copy of this
		this.playlist.forEach(function(value, index){
			t+="<li style=\"cursor:pointer;\" "+
				
				// too lazy to write style
				"onmouseover=\"this.style.background='#ddd'\" "+
				"onmouseout=\"this.style.background=''\" "+
				
				"onclick=\"window.MP"+scope.id+".goto("+index+");\" "+
			">"+
				(index === scope.at?"<b>":"")+
					value.split("/")[value.split("/").length-1]+
				(index === scope.at?"</b>":"")+
			"</li>";
		});
		t += "</ul>";
		controls.pl.innerHTML = t;
	};
	
	this.updatetime = function(e){
		controls.v.value = this.audio.volume;
		var timestamp = this.audio.currentTime;
		controls.s.value = timestamp;
		controls.s.max = this.audio.duration;
		function A(c,d){for(var a="",b=1;b<d;b++)a=(c<eval("1e"+b)?"0":"")+a;return a+c};
		var M = Math.floor(timestamp/60);
		var S = Math.floor(timestamp%3600%60);
		controls.t.innerHTML = A(M,2)+":"+A(S,2);
		this.updatecontrol();
		this.callbacks.timeupdate(this);
	};
	
	this.updateseek = function(){
		this.audio.currentTime = controls.s.value;
	};
	
	this.updatevolume = function(){
		this.audio.volume = controls.v.value;
	};
	
	var playlist_opened = false;
	this.toogleshowplaylist	= function(){
		if(playlist_opened){
			css(controls.pl, {display:"none"});
			playlist_opened = false;
		}else{
			css(controls.pl, {display:""});
			playlist_opened = true;
		}
		this.updatecontrol();
	};
	
	this.updatecontrol = function(){
		var button = controls.tp.children;
		if(this.audio.paused){
			button[0].style.display = "";
			button[1].style.display = "none";
		}else{
			button[0].style.display = "none";
			button[1].style.display = "";
		}
		
		var button = controls.m.children;
		if(this.audio.volume === 0){
			button[0].style.display = "none";
			button[1].style.display = "";
		}else{
			button[0].style.display = "";
			button[1].style.display = "none";
		}
		
		//wait, we need to auto-resize the control
		css(controls.s, controls.pl, {
			width: (window.innerWidth-304)+"px"
		});
		css(controls.pl, {
			width: window.innerWidth+"px",
			height: (window.innerHeight-33)+"px"
		});
	};
	
	this.toogleplay = function(){
		if(this.audio.paused){
			this.audio.play();
		}else{
			this.audio.pause();
		}
		this.updatecontrol();
	};
	
	var lastVolume;
	this.tooglemute = function(){
		if(this.audio.volume === 0){
			this.audio.volume = lastVolume;
		}else{
			lastVolume = this.audio.volume;
			this.audio.volume = 0;
		}
		this.updatetime();
	};
	
	this.prev = function(){
		if(this.playlist.length === 0)return;
		this.goto(Math.max(this.at-1,0));
	};
	
	this.next = function(){
		if(this.playlist.length === 0)return;
		this.goto(Math.min(this.at+1,this.playlist.length-1));
	};
	
	this.goto = function(at){
		this.at = at;
		this.update_playlist();
		this.audio.autoplay = true;
		this.updatecontrol();
		this.callbacks.changesrc(this);
	};
	
	//declare global
	window["MP"+this.id] = this;
	
	//event listener
	var scope = this;
	this.audio.addEventListener("ended", function(){
		if(scope.at === scope.playlist.length-1){
			scope.audio.pause();
			scope.audio.currentTime=0;
			scope.updatecontrol();
		}else{
			scope.next();
		}
	});
	this.audio.addEventListener("timeupdate", function(e){
		scope.updatetime(e);
	});
	controls.s.onmouseup = controls.s.onchange = function(){scope.updateseek();};
	controls.v.onmouseup = controls.v.onchange = function(){scope.updatevolume();};
	controls.tp.addEventListener("mousedown", function(){scope.toogleplay()});
	controls.p.addEventListener("mousedown", function(){scope.prev()});
	controls.n.addEventListener("mousedown", function(){scope.next()});
	controls.m.addEventListener("mousedown", function(){scope.tooglemute()});
	controls.pb.addEventListener("mousedown", function(){scope.toogleshowplaylist()});
	window.addEventListener("resize", function(){scope.updatecontrol()});
};

console.log("mediaplayer.js loaded");