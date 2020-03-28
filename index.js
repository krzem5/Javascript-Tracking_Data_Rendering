var cnv,ctx,video,track_data,tdID=0
var video_path="./data/v1/v.mov",track_data_path="./data/v1/tracking-data.json"
var ANCHOR_POINT_INDEX=0
var IMG
function init(){
	IMG=new Image()
	IMG.src="./data/K.png"
	IMG.onload=function(){
		cnv=document.querySelector("canvas")
		ctx=cnv.getContext("2d")
		fetch(track_data_path).then((r)=>r.json()).then(function(json){
			track_data=json
			video=document.createElement("video")
			document.body.appendChild(video)
			video.style="width: 0px;height: 0px"
			video.src=video_path
			video.autoplay=true
			video.muted=true
			video.onplaying=function(){
				video.onplaying=null
				draw()
			}
			video.load()
		})
	}
}
function draw(){
	video.pause()
	if (video.ended==true){
		save()
		return
	}
	cnv.width=video.videoWidth
	cnv.height=video.videoHeight
	ctx.globalAlpha=1
	ctx.drawImage(video,0,0)
	ctx.globalAlpha=1
	if (tdID<track_data.length-1&&track_data[tdID+1].frameTime<=video.currentTime){
		tdID++
	}
	var a={x:Infinity,y:Infinity},b={x:-Infinity,y:-Infinity}
	var d=((track_data[tdID+1]!=undefined?track_data[tdID+1].frameTime:track_data[tdID].frameTime)-track_data[tdID].frameTime)
	var v=1-Math.min((video.currentTime-track_data[tdID].frameTime)/(d==0?1:d),1)
	if (d==0){
		v=1
	}
	var v2=1-v
	var ap={}
	for (var pi=0;pi<track_data[tdID].data.length;pi++){
		var p=track_data[tdID].data[pi]
		var p2=(track_data[tdID+1]!=undefined?track_data[tdID+1].data[pi]:track_data[tdID].data[pi])
		var px=p.pos.x*v+p2.pos.x*v2
		var py=p.pos.y*v+p2.pos.y*v2
		var sx=p.size.w*v+p2.size.w*v2
		var sy=p.size.h*v+p2.size.h*v2
		a.x=Math.min(a.x,px)
		a.y=Math.min(a.y,py)
		b.x=Math.max(b.x,px)
		b.y=Math.max(b.y,py)
		if (pi==ANCHOR_POINT_INDEX){
			ap={x:px,y:py}
		}
		switch (p.id){
			case 0:
				ctx.strokeStyle="#00ff00"
				break
			case 1:
				ctx.strokeStyle="#0000ff"
				break
			case 2:
				ctx.strokeStyle="#00ffff"
				break
			case 3:
				ctx.strokeStyle="#ff00ff"
				break
		}
		ctx.lineWidth=5
		ctx.strokeRect(px-sx/2,py-sy/2,sx,sy)
	}
	var data={x:a.x/2+b.x/2,y:a.y/2+b.y/2,a:Math.PI+Math.atan2(a.y/2+b.y/2-ap.y,a.x/2+b.x/2-ap.x),r:Math.sqrt((a.y/2+b.y/2-ap.y)*(a.y/2+b.y/2-ap.y)+(a.x/2+b.x/2-ap.x)*(a.x/2+b.x/2-ap.x))}
	draw_shape(data)
	video.play()
	requestAnimationFrame(draw)
}
function draw_shape(d){
	d.a+=Math.PI*5/4
	ctx.translate(d.x,d.y)
	ctx.rotate(d.a)
	// ctx.beginPath()
	// ctx.strokeStyle="#8800ff"
	// ctx.arc(0,0,d.r,0,Math.PI*2)
	// ctx.moveTo(0,0)
	// ctx.lineTo(d.r*2,0)
	// ctx.stroke()
	ctx.drawImage(IMG,-IMG.width/2/4,-IMG.height/2/4,IMG.width/4,IMG.height/4)
	ctx.rotate(-d.a)
	ctx.translate(-d.x,-d.y)
}
document.addEventListener("DOMContentLoaded",init,false)