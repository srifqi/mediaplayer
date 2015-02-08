// subtitle.js by srifqi
var SUBTITLE = function(audio, text, destination){
	this.audio = audio || document.createElement("audio");
	this.text = text || "";
	this.subtitle = [];
	this.destination = destination || document.body;
	
	this.init();
};

SUBTITLE.prototype = {
	init: function(){ //still ONLY support .srt file
		if(this.text.length<1)return false;
		function ct(t){
			t=t.split(/[:,]/ig);
			return Number(t[0])*3600+Number(t[1])*60+Number(t[2])+Number(t[3])/1000;
		}
		this.subtitle = [];
		var sp = this.text.split("\n\n");
		for(var i=0;i<sp.length;i++){
			var spi = sp[i].split("\n");
			this.subtitle.push({
				text: spi[2],
				start: ct(spi[1].split(" --> ")[0]),
				end: ct(spi[1].split(" --> ")[1])
			});
		}
	},
	update: function(){
		this.destination.innerText="";
		for(var i=0,t=this.audio.currentTime,s=this.subtitle;i<s.length;i++){
			if(s[i].start<t&&s[i].end>t){
				this.destination.innerText=s[i].text;
				break;
			}
		}
	}
};