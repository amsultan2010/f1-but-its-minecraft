(()=>{var Vi="169";var jt=0,Hi=1;var si=1;var ri=100;var ai=204,oi=205;var li=0,ci=1,hi=2,Qt=3,ui=4,fi=5,di=6,pi=7,ts=0;var Gi=300;var Cn=1e3,Dt=1001,mi=1002;var ns=1006;var Wi=1008;var Xi=1009;var is=1015;var qi=1023;var en=2300,Pn=2301,on=2302,gi=2400,_i=2401,vi=2402;var Kn="",Le="srgb",jn="srgb-linear",ss="display-p3",Yi="display-p3-linear",In="linear",xi="srgb",yi="rec709",Mi="p3";var Qe=7680;var bi=519;var Si=35044;var Ut=2e3,wi=2001,ft=class{addEventListener(e,t){this._listeners===void 0&&(this._listeners={});let n=this._listeners;n[e]===void 0&&(n[e]=[]),n[e].indexOf(t)===-1&&n[e].push(t)}hasEventListener(e,t){if(this._listeners===void 0)return!1;let n=this._listeners;return n[e]!==void 0&&n[e].indexOf(t)!==-1}removeEventListener(e,t){if(this._listeners===void 0)return;let i=this._listeners[e];if(i!==void 0){let s=i.indexOf(t);s!==-1&&i.splice(s,1)}}dispatchEvent(e){if(this._listeners===void 0)return;let n=this._listeners[e.type];if(n!==void 0){e.target=this;let i=n.slice(0);for(let s=0,r=i.length;s<r;s++)i[s].call(this,e);e.target=null}}},re=["00","01","02","03","04","05","06","07","08","09","0a","0b","0c","0d","0e","0f","10","11","12","13","14","15","16","17","18","19","1a","1b","1c","1d","1e","1f","20","21","22","23","24","25","26","27","28","29","2a","2b","2c","2d","2e","2f","30","31","32","33","34","35","36","37","38","39","3a","3b","3c","3d","3e","3f","40","41","42","43","44","45","46","47","48","49","4a","4b","4c","4d","4e","4f","50","51","52","53","54","55","56","57","58","59","5a","5b","5c","5d","5e","5f","60","61","62","63","64","65","66","67","68","69","6a","6b","6c","6d","6e","6f","70","71","72","73","74","75","76","77","78","79","7a","7b","7c","7d","7e","7f","80","81","82","83","84","85","86","87","88","89","8a","8b","8c","8d","8e","8f","90","91","92","93","94","95","96","97","98","99","9a","9b","9c","9d","9e","9f","a0","a1","a2","a3","a4","a5","a6","a7","a8","a9","aa","ab","ac","ad","ae","af","b0","b1","b2","b3","b4","b5","b6","b7","b8","b9","ba","bb","bc","bd","be","bf","c0","c1","c2","c3","c4","c5","c6","c7","c8","c9","ca","cb","cc","cd","ce","cf","d0","d1","d2","d3","d4","d5","d6","d7","d8","d9","da","db","dc","dd","de","df","e0","e1","e2","e3","e4","e5","e6","e7","e8","e9","ea","eb","ec","ed","ee","ef","f0","f1","f2","f3","f4","f5","f6","f7","f8","f9","fa","fb","fc","fd","fe","ff"];var mo=Math.PI/180,go=180/Math.PI;function Ct(){let _=Math.random()*4294967295|0,e=Math.random()*4294967295|0,t=Math.random()*4294967295|0,n=Math.random()*4294967295|0;return(re[_&255]+re[_>>8&255]+re[_>>16&255]+re[_>>24&255]+"-"+re[e&255]+re[e>>8&255]+"-"+re[e>>16&15|64]+re[e>>24&255]+"-"+re[t&63|128]+re[t>>8&255]+"-"+re[t>>16&255]+re[t>>24&255]+re[n&255]+re[n>>8&255]+re[n>>16&255]+re[n>>24&255]).toLowerCase()}function he(_,e,t){return Math.max(e,Math.min(t,_))}function rs(_,e){return(_%e+e)%e}function ln(_,e,t){return(1-t)*_+t*e}function vt(_,e){switch(e.constructor){case Float32Array:return _;case Uint32Array:return _/4294967295;case Uint16Array:return _/65535;case Uint8Array:return _/255;case Int32Array:return Math.max(_/2147483647,-1);case Int16Array:return Math.max(_/32767,-1);case Int8Array:return Math.max(_/127,-1);default:throw new Error("Invalid component type.")}}function le(_,e){switch(e.constructor){case Float32Array:return _;case Uint32Array:return Math.round(_*4294967295);case Uint16Array:return Math.round(_*65535);case Uint8Array:return Math.round(_*255);case Int32Array:return Math.round(_*2147483647);case Int16Array:return Math.round(_*32767);case Int8Array:return Math.round(_*127);default:throw new Error("Invalid component type.")}}var ee=class _{constructor(e=0,t=0){_.prototype.isVector2=!0,this.x=e,this.y=t}get width(){return this.x}set width(e){this.x=e}get height(){return this.y}set height(e){this.y=e}set(e,t){return this.x=e,this.y=t,this}setScalar(e){return this.x=e,this.y=e,this}setX(e){return this.x=e,this}setY(e){return this.y=e,this}setComponent(e,t){switch(e){case 0:this.x=t;break;case 1:this.y=t;break;default:throw new Error("index is out of range: "+e)}return this}getComponent(e){switch(e){case 0:return this.x;case 1:return this.y;default:throw new Error("index is out of range: "+e)}}clone(){return new this.constructor(this.x,this.y)}copy(e){return this.x=e.x,this.y=e.y,this}add(e){return this.x+=e.x,this.y+=e.y,this}addScalar(e){return this.x+=e,this.y+=e,this}addVectors(e,t){return this.x=e.x+t.x,this.y=e.y+t.y,this}addScaledVector(e,t){return this.x+=e.x*t,this.y+=e.y*t,this}sub(e){return this.x-=e.x,this.y-=e.y,this}subScalar(e){return this.x-=e,this.y-=e,this}subVectors(e,t){return this.x=e.x-t.x,this.y=e.y-t.y,this}multiply(e){return this.x*=e.x,this.y*=e.y,this}multiplyScalar(e){return this.x*=e,this.y*=e,this}divide(e){return this.x/=e.x,this.y/=e.y,this}divideScalar(e){return this.multiplyScalar(1/e)}applyMatrix3(e){let t=this.x,n=this.y,i=e.elements;return this.x=i[0]*t+i[3]*n+i[6],this.y=i[1]*t+i[4]*n+i[7],this}min(e){return this.x=Math.min(this.x,e.x),this.y=Math.min(this.y,e.y),this}max(e){return this.x=Math.max(this.x,e.x),this.y=Math.max(this.y,e.y),this}clamp(e,t){return this.x=Math.max(e.x,Math.min(t.x,this.x)),this.y=Math.max(e.y,Math.min(t.y,this.y)),this}clampScalar(e,t){return this.x=Math.max(e,Math.min(t,this.x)),this.y=Math.max(e,Math.min(t,this.y)),this}clampLength(e,t){let n=this.length();return this.divideScalar(n||1).multiplyScalar(Math.max(e,Math.min(t,n)))}floor(){return this.x=Math.floor(this.x),this.y=Math.floor(this.y),this}ceil(){return this.x=Math.ceil(this.x),this.y=Math.ceil(this.y),this}round(){return this.x=Math.round(this.x),this.y=Math.round(this.y),this}roundToZero(){return this.x=Math.trunc(this.x),this.y=Math.trunc(this.y),this}negate(){return this.x=-this.x,this.y=-this.y,this}dot(e){return this.x*e.x+this.y*e.y}cross(e){return this.x*e.y-this.y*e.x}lengthSq(){return this.x*this.x+this.y*this.y}length(){return Math.sqrt(this.x*this.x+this.y*this.y)}manhattanLength(){return Math.abs(this.x)+Math.abs(this.y)}normalize(){return this.divideScalar(this.length()||1)}angle(){return Math.atan2(-this.y,-this.x)+Math.PI}angleTo(e){let t=Math.sqrt(this.lengthSq()*e.lengthSq());if(t===0)return Math.PI/2;let n=this.dot(e)/t;return Math.acos(he(n,-1,1))}distanceTo(e){return Math.sqrt(this.distanceToSquared(e))}distanceToSquared(e){let t=this.x-e.x,n=this.y-e.y;return t*t+n*n}manhattanDistanceTo(e){return Math.abs(this.x-e.x)+Math.abs(this.y-e.y)}setLength(e){return this.normalize().multiplyScalar(e)}lerp(e,t){return this.x+=(e.x-this.x)*t,this.y+=(e.y-this.y)*t,this}lerpVectors(e,t,n){return this.x=e.x+(t.x-e.x)*n,this.y=e.y+(t.y-e.y)*n,this}equals(e){return e.x===this.x&&e.y===this.y}fromArray(e,t=0){return this.x=e[t],this.y=e[t+1],this}toArray(e=[],t=0){return e[t]=this.x,e[t+1]=this.y,e}fromBufferAttribute(e,t){return this.x=e.getX(t),this.y=e.getY(t),this}rotateAround(e,t){let n=Math.cos(t),i=Math.sin(t),s=this.x-e.x,r=this.y-e.y;return this.x=s*n-r*i+e.x,this.y=s*i+r*n+e.y,this}random(){return this.x=Math.random(),this.y=Math.random(),this}*[Symbol.iterator](){yield this.x,yield this.y}},B=class _{constructor(e,t,n,i,s,r,h,c,o){_.prototype.isMatrix3=!0,this.elements=[1,0,0,0,1,0,0,0,1],e!==void 0&&this.set(e,t,n,i,s,r,h,c,o)}set(e,t,n,i,s,r,h,c,o){let a=this.elements;return a[0]=e,a[1]=i,a[2]=h,a[3]=t,a[4]=s,a[5]=c,a[6]=n,a[7]=r,a[8]=o,this}identity(){return this.set(1,0,0,0,1,0,0,0,1),this}copy(e){let t=this.elements,n=e.elements;return t[0]=n[0],t[1]=n[1],t[2]=n[2],t[3]=n[3],t[4]=n[4],t[5]=n[5],t[6]=n[6],t[7]=n[7],t[8]=n[8],this}extractBasis(e,t,n){return e.setFromMatrix3Column(this,0),t.setFromMatrix3Column(this,1),n.setFromMatrix3Column(this,2),this}setFromMatrix4(e){let t=e.elements;return this.set(t[0],t[4],t[8],t[1],t[5],t[9],t[2],t[6],t[10]),this}multiply(e){return this.multiplyMatrices(this,e)}premultiply(e){return this.multiplyMatrices(e,this)}multiplyMatrices(e,t){let n=e.elements,i=t.elements,s=this.elements,r=n[0],h=n[3],c=n[6],o=n[1],a=n[4],l=n[7],u=n[2],f=n[5],d=n[8],p=i[0],m=i[3],g=i[6],v=i[1],x=i[4],M=i[7],b=i[2],T=i[5],E=i[8];return s[0]=r*p+h*v+c*b,s[3]=r*m+h*x+c*T,s[6]=r*g+h*M+c*E,s[1]=o*p+a*v+l*b,s[4]=o*m+a*x+l*T,s[7]=o*g+a*M+l*E,s[2]=u*p+f*v+d*b,s[5]=u*m+f*x+d*T,s[8]=u*g+f*M+d*E,this}multiplyScalar(e){let t=this.elements;return t[0]*=e,t[3]*=e,t[6]*=e,t[1]*=e,t[4]*=e,t[7]*=e,t[2]*=e,t[5]*=e,t[8]*=e,this}determinant(){let e=this.elements,t=e[0],n=e[1],i=e[2],s=e[3],r=e[4],h=e[5],c=e[6],o=e[7],a=e[8];return t*r*a-t*h*o-n*s*a+n*h*c+i*s*o-i*r*c}invert(){let e=this.elements,t=e[0],n=e[1],i=e[2],s=e[3],r=e[4],h=e[5],c=e[6],o=e[7],a=e[8],l=a*r-h*o,u=h*c-a*s,f=o*s-r*c,d=t*l+n*u+i*f;if(d===0)return this.set(0,0,0,0,0,0,0,0,0);let p=1/d;return e[0]=l*p,e[1]=(i*o-a*n)*p,e[2]=(h*n-i*r)*p,e[3]=u*p,e[4]=(a*t-i*c)*p,e[5]=(i*s-h*t)*p,e[6]=f*p,e[7]=(n*c-o*t)*p,e[8]=(r*t-n*s)*p,this}transpose(){let e,t=this.elements;return e=t[1],t[1]=t[3],t[3]=e,e=t[2],t[2]=t[6],t[6]=e,e=t[5],t[5]=t[7],t[7]=e,this}getNormalMatrix(e){return this.setFromMatrix4(e).invert().transpose()}transposeIntoArray(e){let t=this.elements;return e[0]=t[0],e[1]=t[3],e[2]=t[6],e[3]=t[1],e[4]=t[4],e[5]=t[7],e[6]=t[2],e[7]=t[5],e[8]=t[8],this}setUvTransform(e,t,n,i,s,r,h){let c=Math.cos(s),o=Math.sin(s);return this.set(n*c,n*o,-n*(c*r+o*h)+r+e,-i*o,i*c,-i*(-o*r+c*h)+h+t,0,0,1),this}scale(e,t){return this.premultiply(cn.makeScale(e,t)),this}rotate(e){return this.premultiply(cn.makeRotation(-e)),this}translate(e,t){return this.premultiply(cn.makeTranslation(e,t)),this}makeTranslation(e,t){return e.isVector2?this.set(1,0,e.x,0,1,e.y,0,0,1):this.set(1,0,e,0,1,t,0,0,1),this}makeRotation(e){let t=Math.cos(e),n=Math.sin(e);return this.set(t,-n,0,n,t,0,0,0,1),this}makeScale(e,t){return this.set(e,0,0,0,t,0,0,0,1),this}equals(e){let t=this.elements,n=e.elements;for(let i=0;i<9;i++)if(t[i]!==n[i])return!1;return!0}fromArray(e,t=0){for(let n=0;n<9;n++)this.elements[n]=e[n+t];return this}toArray(e=[],t=0){let n=this.elements;return e[t]=n[0],e[t+1]=n[1],e[t+2]=n[2],e[t+3]=n[3],e[t+4]=n[4],e[t+5]=n[5],e[t+6]=n[6],e[t+7]=n[7],e[t+8]=n[8],e}clone(){return new this.constructor().fromArray(this.elements)}},cn=new B;function as(_){for(let e=_.length-1;e>=0;--e)if(_[e]>=65535)return!0;return!1}function Ei(_){return document.createElementNS("http://www.w3.org/1999/xhtml",_)}var Ti=new B().set(.8224621,.177538,0,.0331941,.9668058,0,.0170827,.0723974,.9105199),Ai=new B().set(1.2249401,-.2249404,0,-.0420569,1.0420571,0,-.0196376,-.0786361,1.0982735),xt={[jn]:{transfer:In,primaries:yi,luminanceCoefficients:[.2126,.7152,.0722],toReference:_=>_,fromReference:_=>_},[Le]:{transfer:xi,primaries:yi,luminanceCoefficients:[.2126,.7152,.0722],toReference:_=>_.convertSRGBToLinear(),fromReference:_=>_.convertLinearToSRGB()},[Yi]:{transfer:In,primaries:Mi,luminanceCoefficients:[.2289,.6917,.0793],toReference:_=>_.applyMatrix3(Ai),fromReference:_=>_.applyMatrix3(Ti)},[ss]:{transfer:xi,primaries:Mi,luminanceCoefficients:[.2289,.6917,.0793],toReference:_=>_.convertSRGBToLinear().applyMatrix3(Ai),fromReference:_=>_.applyMatrix3(Ti).convertLinearToSRGB()}},os=new Set([jn,Yi]),ve={enabled:!0,_workingColorSpace:jn,get workingColorSpace(){return this._workingColorSpace},set workingColorSpace(_){if(!os.has(_))throw new Error(`Unsupported working color space, "${_}".`);this._workingColorSpace=_},convert:function(_,e,t){if(this.enabled===!1||e===t||!e||!t)return _;let n=xt[e].toReference,i=xt[t].fromReference;return i(n(_))},fromWorkingColorSpace:function(_,e){return this.convert(_,this._workingColorSpace,e)},toWorkingColorSpace:function(_,e){return this.convert(_,e,this._workingColorSpace)},getPrimaries:function(_){return xt[_].primaries},getTransfer:function(_){return _===Kn?In:xt[_].transfer},getLuminanceCoefficients:function(_,e=this._workingColorSpace){return _.fromArray(xt[e].luminanceCoefficients)}};function ut(_){return _<.04045?_*.0773993808:Math.pow(_*.9478672986+.0521327014,2.4)}function hn(_){return _<.0031308?_*12.92:1.055*Math.pow(_,.41666)-.055}var et,Ln=class{static getDataURL(e){if(/^data:/i.test(e.src)||typeof HTMLCanvasElement>"u")return e.src;let t;if(e instanceof HTMLCanvasElement)t=e;else{et===void 0&&(et=Ei("canvas")),et.width=e.width,et.height=e.height;let n=et.getContext("2d");e instanceof ImageData?n.putImageData(e,0,0):n.drawImage(e,0,0,e.width,e.height),t=et}return t.width>2048||t.height>2048?(console.warn("THREE.ImageUtils.getDataURL: Image converted to jpg for performance reasons",e),t.toDataURL("image/jpeg",.6)):t.toDataURL("image/png")}static sRGBToLinear(e){if(typeof HTMLImageElement<"u"&&e instanceof HTMLImageElement||typeof HTMLCanvasElement<"u"&&e instanceof HTMLCanvasElement||typeof ImageBitmap<"u"&&e instanceof ImageBitmap){let t=Ei("canvas");t.width=e.width,t.height=e.height;let n=t.getContext("2d");n.drawImage(e,0,0,e.width,e.height);let i=n.getImageData(0,0,e.width,e.height),s=i.data;for(let r=0;r<s.length;r++)s[r]=ut(s[r]/255)*255;return n.putImageData(i,0,0),t}else if(e.data){let t=e.data.slice(0);for(let n=0;n<t.length;n++)t instanceof Uint8Array||t instanceof Uint8ClampedArray?t[n]=Math.floor(ut(t[n]/255)*255):t[n]=ut(t[n]);return{data:t,width:e.width,height:e.height}}else return console.warn("THREE.ImageUtils.sRGBToLinear(): Unsupported image type. No color space conversion applied."),e}},ls=0,Dn=class{constructor(e=null){this.isSource=!0,Object.defineProperty(this,"id",{value:ls++}),this.uuid=Ct(),this.data=e,this.dataReady=!0,this.version=0}set needsUpdate(e){e===!0&&this.version++}toJSON(e){let t=e===void 0||typeof e=="string";if(!t&&e.images[this.uuid]!==void 0)return e.images[this.uuid];let n={uuid:this.uuid,url:""},i=this.data;if(i!==null){let s;if(Array.isArray(i)){s=[];for(let r=0,h=i.length;r<h;r++)i[r].isDataTexture?s.push(un(i[r].image)):s.push(un(i[r]))}else s=un(i);n.url=s}return t||(e.images[this.uuid]=n),n}};function un(_){return typeof HTMLImageElement<"u"&&_ instanceof HTMLImageElement||typeof HTMLCanvasElement<"u"&&_ instanceof HTMLCanvasElement||typeof ImageBitmap<"u"&&_ instanceof ImageBitmap?Ln.getDataURL(_):_.data?{data:Array.from(_.data),width:_.width,height:_.height,type:_.data.constructor.name}:(console.warn("THREE.Texture: Unable to serialize Texture."),{})}var cs=0,wt=class _ extends ft{constructor(e=_.DEFAULT_IMAGE,t=_.DEFAULT_MAPPING,n=Dt,i=Dt,s=ns,r=Wi,h=qi,c=Xi,o=_.DEFAULT_ANISOTROPY,a=Kn){super(),this.isTexture=!0,Object.defineProperty(this,"id",{value:cs++}),this.uuid=Ct(),this.name="",this.source=new Dn(e),this.mipmaps=[],this.mapping=t,this.channel=0,this.wrapS=n,this.wrapT=i,this.magFilter=s,this.minFilter=r,this.anisotropy=o,this.format=h,this.internalFormat=null,this.type=c,this.offset=new ee(0,0),this.repeat=new ee(1,1),this.center=new ee(0,0),this.rotation=0,this.matrixAutoUpdate=!0,this.matrix=new B,this.generateMipmaps=!0,this.premultiplyAlpha=!1,this.flipY=!0,this.unpackAlignment=4,this.colorSpace=a,this.userData={},this.version=0,this.onUpdate=null,this.isRenderTargetTexture=!1,this.pmremVersion=0}get image(){return this.source.data}set image(e=null){this.source.data=e}updateMatrix(){this.matrix.setUvTransform(this.offset.x,this.offset.y,this.repeat.x,this.repeat.y,this.rotation,this.center.x,this.center.y)}clone(){return new this.constructor().copy(this)}copy(e){return this.name=e.name,this.source=e.source,this.mipmaps=e.mipmaps.slice(0),this.mapping=e.mapping,this.channel=e.channel,this.wrapS=e.wrapS,this.wrapT=e.wrapT,this.magFilter=e.magFilter,this.minFilter=e.minFilter,this.anisotropy=e.anisotropy,this.format=e.format,this.internalFormat=e.internalFormat,this.type=e.type,this.offset.copy(e.offset),this.repeat.copy(e.repeat),this.center.copy(e.center),this.rotation=e.rotation,this.matrixAutoUpdate=e.matrixAutoUpdate,this.matrix.copy(e.matrix),this.generateMipmaps=e.generateMipmaps,this.premultiplyAlpha=e.premultiplyAlpha,this.flipY=e.flipY,this.unpackAlignment=e.unpackAlignment,this.colorSpace=e.colorSpace,this.userData=JSON.parse(JSON.stringify(e.userData)),this.needsUpdate=!0,this}toJSON(e){let t=e===void 0||typeof e=="string";if(!t&&e.textures[this.uuid]!==void 0)return e.textures[this.uuid];let n={metadata:{version:4.6,type:"Texture",generator:"Texture.toJSON"},uuid:this.uuid,name:this.name,image:this.source.toJSON(e).uuid,mapping:this.mapping,channel:this.channel,repeat:[this.repeat.x,this.repeat.y],offset:[this.offset.x,this.offset.y],center:[this.center.x,this.center.y],rotation:this.rotation,wrap:[this.wrapS,this.wrapT],format:this.format,internalFormat:this.internalFormat,type:this.type,colorSpace:this.colorSpace,minFilter:this.minFilter,magFilter:this.magFilter,anisotropy:this.anisotropy,flipY:this.flipY,generateMipmaps:this.generateMipmaps,premultiplyAlpha:this.premultiplyAlpha,unpackAlignment:this.unpackAlignment};return Object.keys(this.userData).length>0&&(n.userData=this.userData),t||(e.textures[this.uuid]=n),n}dispose(){this.dispatchEvent({type:"dispose"})}transformUv(e){if(this.mapping!==Gi)return e;if(e.applyMatrix3(this.matrix),e.x<0||e.x>1)switch(this.wrapS){case Cn:e.x=e.x-Math.floor(e.x);break;case Dt:e.x=e.x<0?0:1;break;case mi:Math.abs(Math.floor(e.x)%2)===1?e.x=Math.ceil(e.x)-e.x:e.x=e.x-Math.floor(e.x);break}if(e.y<0||e.y>1)switch(this.wrapT){case Cn:e.y=e.y-Math.floor(e.y);break;case Dt:e.y=e.y<0?0:1;break;case mi:Math.abs(Math.floor(e.y)%2)===1?e.y=Math.ceil(e.y)-e.y:e.y=e.y-Math.floor(e.y);break}return this.flipY&&(e.y=1-e.y),e}set needsUpdate(e){e===!0&&(this.version++,this.source.needsUpdate=!0)}set needsPMREMUpdate(e){e===!0&&this.pmremVersion++}};wt.DEFAULT_IMAGE=null;wt.DEFAULT_MAPPING=Gi;wt.DEFAULT_ANISOTROPY=1;var Et=class _{constructor(e=0,t=0,n=0,i=1){_.prototype.isVector4=!0,this.x=e,this.y=t,this.z=n,this.w=i}get width(){return this.z}set width(e){this.z=e}get height(){return this.w}set height(e){this.w=e}set(e,t,n,i){return this.x=e,this.y=t,this.z=n,this.w=i,this}setScalar(e){return this.x=e,this.y=e,this.z=e,this.w=e,this}setX(e){return this.x=e,this}setY(e){return this.y=e,this}setZ(e){return this.z=e,this}setW(e){return this.w=e,this}setComponent(e,t){switch(e){case 0:this.x=t;break;case 1:this.y=t;break;case 2:this.z=t;break;case 3:this.w=t;break;default:throw new Error("index is out of range: "+e)}return this}getComponent(e){switch(e){case 0:return this.x;case 1:return this.y;case 2:return this.z;case 3:return this.w;default:throw new Error("index is out of range: "+e)}}clone(){return new this.constructor(this.x,this.y,this.z,this.w)}copy(e){return this.x=e.x,this.y=e.y,this.z=e.z,this.w=e.w!==void 0?e.w:1,this}add(e){return this.x+=e.x,this.y+=e.y,this.z+=e.z,this.w+=e.w,this}addScalar(e){return this.x+=e,this.y+=e,this.z+=e,this.w+=e,this}addVectors(e,t){return this.x=e.x+t.x,this.y=e.y+t.y,this.z=e.z+t.z,this.w=e.w+t.w,this}addScaledVector(e,t){return this.x+=e.x*t,this.y+=e.y*t,this.z+=e.z*t,this.w+=e.w*t,this}sub(e){return this.x-=e.x,this.y-=e.y,this.z-=e.z,this.w-=e.w,this}subScalar(e){return this.x-=e,this.y-=e,this.z-=e,this.w-=e,this}subVectors(e,t){return this.x=e.x-t.x,this.y=e.y-t.y,this.z=e.z-t.z,this.w=e.w-t.w,this}multiply(e){return this.x*=e.x,this.y*=e.y,this.z*=e.z,this.w*=e.w,this}multiplyScalar(e){return this.x*=e,this.y*=e,this.z*=e,this.w*=e,this}applyMatrix4(e){let t=this.x,n=this.y,i=this.z,s=this.w,r=e.elements;return this.x=r[0]*t+r[4]*n+r[8]*i+r[12]*s,this.y=r[1]*t+r[5]*n+r[9]*i+r[13]*s,this.z=r[2]*t+r[6]*n+r[10]*i+r[14]*s,this.w=r[3]*t+r[7]*n+r[11]*i+r[15]*s,this}divideScalar(e){return this.multiplyScalar(1/e)}setAxisAngleFromQuaternion(e){this.w=2*Math.acos(e.w);let t=Math.sqrt(1-e.w*e.w);return t<1e-4?(this.x=1,this.y=0,this.z=0):(this.x=e.x/t,this.y=e.y/t,this.z=e.z/t),this}setAxisAngleFromRotationMatrix(e){let t,n,i,s,c=e.elements,o=c[0],a=c[4],l=c[8],u=c[1],f=c[5],d=c[9],p=c[2],m=c[6],g=c[10];if(Math.abs(a-u)<.01&&Math.abs(l-p)<.01&&Math.abs(d-m)<.01){if(Math.abs(a+u)<.1&&Math.abs(l+p)<.1&&Math.abs(d+m)<.1&&Math.abs(o+f+g-3)<.1)return this.set(1,0,0,0),this;t=Math.PI;let x=(o+1)/2,M=(f+1)/2,b=(g+1)/2,T=(a+u)/4,E=(l+p)/4,P=(d+m)/4;return x>M&&x>b?x<.01?(n=0,i=.707106781,s=.707106781):(n=Math.sqrt(x),i=T/n,s=E/n):M>b?M<.01?(n=.707106781,i=0,s=.707106781):(i=Math.sqrt(M),n=T/i,s=P/i):b<.01?(n=.707106781,i=.707106781,s=0):(s=Math.sqrt(b),n=E/s,i=P/s),this.set(n,i,s,t),this}let v=Math.sqrt((m-d)*(m-d)+(l-p)*(l-p)+(u-a)*(u-a));return Math.abs(v)<.001&&(v=1),this.x=(m-d)/v,this.y=(l-p)/v,this.z=(u-a)/v,this.w=Math.acos((o+f+g-1)/2),this}setFromMatrixPosition(e){let t=e.elements;return this.x=t[12],this.y=t[13],this.z=t[14],this.w=t[15],this}min(e){return this.x=Math.min(this.x,e.x),this.y=Math.min(this.y,e.y),this.z=Math.min(this.z,e.z),this.w=Math.min(this.w,e.w),this}max(e){return this.x=Math.max(this.x,e.x),this.y=Math.max(this.y,e.y),this.z=Math.max(this.z,e.z),this.w=Math.max(this.w,e.w),this}clamp(e,t){return this.x=Math.max(e.x,Math.min(t.x,this.x)),this.y=Math.max(e.y,Math.min(t.y,this.y)),this.z=Math.max(e.z,Math.min(t.z,this.z)),this.w=Math.max(e.w,Math.min(t.w,this.w)),this}clampScalar(e,t){return this.x=Math.max(e,Math.min(t,this.x)),this.y=Math.max(e,Math.min(t,this.y)),this.z=Math.max(e,Math.min(t,this.z)),this.w=Math.max(e,Math.min(t,this.w)),this}clampLength(e,t){let n=this.length();return this.divideScalar(n||1).multiplyScalar(Math.max(e,Math.min(t,n)))}floor(){return this.x=Math.floor(this.x),this.y=Math.floor(this.y),this.z=Math.floor(this.z),this.w=Math.floor(this.w),this}ceil(){return this.x=Math.ceil(this.x),this.y=Math.ceil(this.y),this.z=Math.ceil(this.z),this.w=Math.ceil(this.w),this}round(){return this.x=Math.round(this.x),this.y=Math.round(this.y),this.z=Math.round(this.z),this.w=Math.round(this.w),this}roundToZero(){return this.x=Math.trunc(this.x),this.y=Math.trunc(this.y),this.z=Math.trunc(this.z),this.w=Math.trunc(this.w),this}negate(){return this.x=-this.x,this.y=-this.y,this.z=-this.z,this.w=-this.w,this}dot(e){return this.x*e.x+this.y*e.y+this.z*e.z+this.w*e.w}lengthSq(){return this.x*this.x+this.y*this.y+this.z*this.z+this.w*this.w}length(){return Math.sqrt(this.x*this.x+this.y*this.y+this.z*this.z+this.w*this.w)}manhattanLength(){return Math.abs(this.x)+Math.abs(this.y)+Math.abs(this.z)+Math.abs(this.w)}normalize(){return this.divideScalar(this.length()||1)}setLength(e){return this.normalize().multiplyScalar(e)}lerp(e,t){return this.x+=(e.x-this.x)*t,this.y+=(e.y-this.y)*t,this.z+=(e.z-this.z)*t,this.w+=(e.w-this.w)*t,this}lerpVectors(e,t,n){return this.x=e.x+(t.x-e.x)*n,this.y=e.y+(t.y-e.y)*n,this.z=e.z+(t.z-e.z)*n,this.w=e.w+(t.w-e.w)*n,this}equals(e){return e.x===this.x&&e.y===this.y&&e.z===this.z&&e.w===this.w}fromArray(e,t=0){return this.x=e[t],this.y=e[t+1],this.z=e[t+2],this.w=e[t+3],this}toArray(e=[],t=0){return e[t]=this.x,e[t+1]=this.y,e[t+2]=this.z,e[t+3]=this.w,e}fromBufferAttribute(e,t){return this.x=e.getX(t),this.y=e.getY(t),this.z=e.getZ(t),this.w=e.getW(t),this}random(){return this.x=Math.random(),this.y=Math.random(),this.z=Math.random(),this.w=Math.random(),this}*[Symbol.iterator](){yield this.x,yield this.y,yield this.z,yield this.w}};var Be=class{constructor(e=0,t=0,n=0,i=1){this.isQuaternion=!0,this._x=e,this._y=t,this._z=n,this._w=i}static slerpFlat(e,t,n,i,s,r,h){let c=n[i+0],o=n[i+1],a=n[i+2],l=n[i+3],u=s[r+0],f=s[r+1],d=s[r+2],p=s[r+3];if(h===0){e[t+0]=c,e[t+1]=o,e[t+2]=a,e[t+3]=l;return}if(h===1){e[t+0]=u,e[t+1]=f,e[t+2]=d,e[t+3]=p;return}if(l!==p||c!==u||o!==f||a!==d){let m=1-h,g=c*u+o*f+a*d+l*p,v=g>=0?1:-1,x=1-g*g;if(x>Number.EPSILON){let b=Math.sqrt(x),T=Math.atan2(b,g*v);m=Math.sin(m*T)/b,h=Math.sin(h*T)/b}let M=h*v;if(c=c*m+u*M,o=o*m+f*M,a=a*m+d*M,l=l*m+p*M,m===1-h){let b=1/Math.sqrt(c*c+o*o+a*a+l*l);c*=b,o*=b,a*=b,l*=b}}e[t]=c,e[t+1]=o,e[t+2]=a,e[t+3]=l}static multiplyQuaternionsFlat(e,t,n,i,s,r){let h=n[i],c=n[i+1],o=n[i+2],a=n[i+3],l=s[r],u=s[r+1],f=s[r+2],d=s[r+3];return e[t]=h*d+a*l+c*f-o*u,e[t+1]=c*d+a*u+o*l-h*f,e[t+2]=o*d+a*f+h*u-c*l,e[t+3]=a*d-h*l-c*u-o*f,e}get x(){return this._x}set x(e){this._x=e,this._onChangeCallback()}get y(){return this._y}set y(e){this._y=e,this._onChangeCallback()}get z(){return this._z}set z(e){this._z=e,this._onChangeCallback()}get w(){return this._w}set w(e){this._w=e,this._onChangeCallback()}set(e,t,n,i){return this._x=e,this._y=t,this._z=n,this._w=i,this._onChangeCallback(),this}clone(){return new this.constructor(this._x,this._y,this._z,this._w)}copy(e){return this._x=e.x,this._y=e.y,this._z=e.z,this._w=e.w,this._onChangeCallback(),this}setFromEuler(e,t=!0){let n=e._x,i=e._y,s=e._z,r=e._order,h=Math.cos,c=Math.sin,o=h(n/2),a=h(i/2),l=h(s/2),u=c(n/2),f=c(i/2),d=c(s/2);switch(r){case"XYZ":this._x=u*a*l+o*f*d,this._y=o*f*l-u*a*d,this._z=o*a*d+u*f*l,this._w=o*a*l-u*f*d;break;case"YXZ":this._x=u*a*l+o*f*d,this._y=o*f*l-u*a*d,this._z=o*a*d-u*f*l,this._w=o*a*l+u*f*d;break;case"ZXY":this._x=u*a*l-o*f*d,this._y=o*f*l+u*a*d,this._z=o*a*d+u*f*l,this._w=o*a*l-u*f*d;break;case"ZYX":this._x=u*a*l-o*f*d,this._y=o*f*l+u*a*d,this._z=o*a*d-u*f*l,this._w=o*a*l+u*f*d;break;case"YZX":this._x=u*a*l+o*f*d,this._y=o*f*l+u*a*d,this._z=o*a*d-u*f*l,this._w=o*a*l-u*f*d;break;case"XZY":this._x=u*a*l-o*f*d,this._y=o*f*l-u*a*d,this._z=o*a*d+u*f*l,this._w=o*a*l+u*f*d;break;default:console.warn("THREE.Quaternion: .setFromEuler() encountered an unknown order: "+r)}return t===!0&&this._onChangeCallback(),this}setFromAxisAngle(e,t){let n=t/2,i=Math.sin(n);return this._x=e.x*i,this._y=e.y*i,this._z=e.z*i,this._w=Math.cos(n),this._onChangeCallback(),this}setFromRotationMatrix(e){let t=e.elements,n=t[0],i=t[4],s=t[8],r=t[1],h=t[5],c=t[9],o=t[2],a=t[6],l=t[10],u=n+h+l;if(u>0){let f=.5/Math.sqrt(u+1);this._w=.25/f,this._x=(a-c)*f,this._y=(s-o)*f,this._z=(r-i)*f}else if(n>h&&n>l){let f=2*Math.sqrt(1+n-h-l);this._w=(a-c)/f,this._x=.25*f,this._y=(i+r)/f,this._z=(s+o)/f}else if(h>l){let f=2*Math.sqrt(1+h-n-l);this._w=(s-o)/f,this._x=(i+r)/f,this._y=.25*f,this._z=(c+a)/f}else{let f=2*Math.sqrt(1+l-n-h);this._w=(r-i)/f,this._x=(s+o)/f,this._y=(c+a)/f,this._z=.25*f}return this._onChangeCallback(),this}setFromUnitVectors(e,t){let n=e.dot(t)+1;return n<Number.EPSILON?(n=0,Math.abs(e.x)>Math.abs(e.z)?(this._x=-e.y,this._y=e.x,this._z=0,this._w=n):(this._x=0,this._y=-e.z,this._z=e.y,this._w=n)):(this._x=e.y*t.z-e.z*t.y,this._y=e.z*t.x-e.x*t.z,this._z=e.x*t.y-e.y*t.x,this._w=n),this.normalize()}angleTo(e){return 2*Math.acos(Math.abs(he(this.dot(e),-1,1)))}rotateTowards(e,t){let n=this.angleTo(e);if(n===0)return this;let i=Math.min(1,t/n);return this.slerp(e,i),this}identity(){return this.set(0,0,0,1)}invert(){return this.conjugate()}conjugate(){return this._x*=-1,this._y*=-1,this._z*=-1,this._onChangeCallback(),this}dot(e){return this._x*e._x+this._y*e._y+this._z*e._z+this._w*e._w}lengthSq(){return this._x*this._x+this._y*this._y+this._z*this._z+this._w*this._w}length(){return Math.sqrt(this._x*this._x+this._y*this._y+this._z*this._z+this._w*this._w)}normalize(){let e=this.length();return e===0?(this._x=0,this._y=0,this._z=0,this._w=1):(e=1/e,this._x=this._x*e,this._y=this._y*e,this._z=this._z*e,this._w=this._w*e),this._onChangeCallback(),this}multiply(e){return this.multiplyQuaternions(this,e)}premultiply(e){return this.multiplyQuaternions(e,this)}multiplyQuaternions(e,t){let n=e._x,i=e._y,s=e._z,r=e._w,h=t._x,c=t._y,o=t._z,a=t._w;return this._x=n*a+r*h+i*o-s*c,this._y=i*a+r*c+s*h-n*o,this._z=s*a+r*o+n*c-i*h,this._w=r*a-n*h-i*c-s*o,this._onChangeCallback(),this}slerp(e,t){if(t===0)return this;if(t===1)return this.copy(e);let n=this._x,i=this._y,s=this._z,r=this._w,h=r*e._w+n*e._x+i*e._y+s*e._z;if(h<0?(this._w=-e._w,this._x=-e._x,this._y=-e._y,this._z=-e._z,h=-h):this.copy(e),h>=1)return this._w=r,this._x=n,this._y=i,this._z=s,this;let c=1-h*h;if(c<=Number.EPSILON){let f=1-t;return this._w=f*r+t*this._w,this._x=f*n+t*this._x,this._y=f*i+t*this._y,this._z=f*s+t*this._z,this.normalize(),this}let o=Math.sqrt(c),a=Math.atan2(o,h),l=Math.sin((1-t)*a)/o,u=Math.sin(t*a)/o;return this._w=r*l+this._w*u,this._x=n*l+this._x*u,this._y=i*l+this._y*u,this._z=s*l+this._z*u,this._onChangeCallback(),this}slerpQuaternions(e,t,n){return this.copy(e).slerp(t,n)}random(){let e=2*Math.PI*Math.random(),t=2*Math.PI*Math.random(),n=Math.random(),i=Math.sqrt(1-n),s=Math.sqrt(n);return this.set(i*Math.sin(e),i*Math.cos(e),s*Math.sin(t),s*Math.cos(t))}equals(e){return e._x===this._x&&e._y===this._y&&e._z===this._z&&e._w===this._w}fromArray(e,t=0){return this._x=e[t],this._y=e[t+1],this._z=e[t+2],this._w=e[t+3],this._onChangeCallback(),this}toArray(e=[],t=0){return e[t]=this._x,e[t+1]=this._y,e[t+2]=this._z,e[t+3]=this._w,e}fromBufferAttribute(e,t){return this._x=e.getX(t),this._y=e.getY(t),this._z=e.getZ(t),this._w=e.getW(t),this._onChangeCallback(),this}toJSON(){return this.toArray()}_onChange(e){return this._onChangeCallback=e,this}_onChangeCallback(){}*[Symbol.iterator](){yield this._x,yield this._y,yield this._z,yield this._w}},y=class _{constructor(e=0,t=0,n=0){_.prototype.isVector3=!0,this.x=e,this.y=t,this.z=n}set(e,t,n){return n===void 0&&(n=this.z),this.x=e,this.y=t,this.z=n,this}setScalar(e){return this.x=e,this.y=e,this.z=e,this}setX(e){return this.x=e,this}setY(e){return this.y=e,this}setZ(e){return this.z=e,this}setComponent(e,t){switch(e){case 0:this.x=t;break;case 1:this.y=t;break;case 2:this.z=t;break;default:throw new Error("index is out of range: "+e)}return this}getComponent(e){switch(e){case 0:return this.x;case 1:return this.y;case 2:return this.z;default:throw new Error("index is out of range: "+e)}}clone(){return new this.constructor(this.x,this.y,this.z)}copy(e){return this.x=e.x,this.y=e.y,this.z=e.z,this}add(e){return this.x+=e.x,this.y+=e.y,this.z+=e.z,this}addScalar(e){return this.x+=e,this.y+=e,this.z+=e,this}addVectors(e,t){return this.x=e.x+t.x,this.y=e.y+t.y,this.z=e.z+t.z,this}addScaledVector(e,t){return this.x+=e.x*t,this.y+=e.y*t,this.z+=e.z*t,this}sub(e){return this.x-=e.x,this.y-=e.y,this.z-=e.z,this}subScalar(e){return this.x-=e,this.y-=e,this.z-=e,this}subVectors(e,t){return this.x=e.x-t.x,this.y=e.y-t.y,this.z=e.z-t.z,this}multiply(e){return this.x*=e.x,this.y*=e.y,this.z*=e.z,this}multiplyScalar(e){return this.x*=e,this.y*=e,this.z*=e,this}multiplyVectors(e,t){return this.x=e.x*t.x,this.y=e.y*t.y,this.z=e.z*t.z,this}applyEuler(e){return this.applyQuaternion(Ri.setFromEuler(e))}applyAxisAngle(e,t){return this.applyQuaternion(Ri.setFromAxisAngle(e,t))}applyMatrix3(e){let t=this.x,n=this.y,i=this.z,s=e.elements;return this.x=s[0]*t+s[3]*n+s[6]*i,this.y=s[1]*t+s[4]*n+s[7]*i,this.z=s[2]*t+s[5]*n+s[8]*i,this}applyNormalMatrix(e){return this.applyMatrix3(e).normalize()}applyMatrix4(e){let t=this.x,n=this.y,i=this.z,s=e.elements,r=1/(s[3]*t+s[7]*n+s[11]*i+s[15]);return this.x=(s[0]*t+s[4]*n+s[8]*i+s[12])*r,this.y=(s[1]*t+s[5]*n+s[9]*i+s[13])*r,this.z=(s[2]*t+s[6]*n+s[10]*i+s[14])*r,this}applyQuaternion(e){let t=this.x,n=this.y,i=this.z,s=e.x,r=e.y,h=e.z,c=e.w,o=2*(r*i-h*n),a=2*(h*t-s*i),l=2*(s*n-r*t);return this.x=t+c*o+r*l-h*a,this.y=n+c*a+h*o-s*l,this.z=i+c*l+s*a-r*o,this}project(e){return this.applyMatrix4(e.matrixWorldInverse).applyMatrix4(e.projectionMatrix)}unproject(e){return this.applyMatrix4(e.projectionMatrixInverse).applyMatrix4(e.matrixWorld)}transformDirection(e){let t=this.x,n=this.y,i=this.z,s=e.elements;return this.x=s[0]*t+s[4]*n+s[8]*i,this.y=s[1]*t+s[5]*n+s[9]*i,this.z=s[2]*t+s[6]*n+s[10]*i,this.normalize()}divide(e){return this.x/=e.x,this.y/=e.y,this.z/=e.z,this}divideScalar(e){return this.multiplyScalar(1/e)}min(e){return this.x=Math.min(this.x,e.x),this.y=Math.min(this.y,e.y),this.z=Math.min(this.z,e.z),this}max(e){return this.x=Math.max(this.x,e.x),this.y=Math.max(this.y,e.y),this.z=Math.max(this.z,e.z),this}clamp(e,t){return this.x=Math.max(e.x,Math.min(t.x,this.x)),this.y=Math.max(e.y,Math.min(t.y,this.y)),this.z=Math.max(e.z,Math.min(t.z,this.z)),this}clampScalar(e,t){return this.x=Math.max(e,Math.min(t,this.x)),this.y=Math.max(e,Math.min(t,this.y)),this.z=Math.max(e,Math.min(t,this.z)),this}clampLength(e,t){let n=this.length();return this.divideScalar(n||1).multiplyScalar(Math.max(e,Math.min(t,n)))}floor(){return this.x=Math.floor(this.x),this.y=Math.floor(this.y),this.z=Math.floor(this.z),this}ceil(){return this.x=Math.ceil(this.x),this.y=Math.ceil(this.y),this.z=Math.ceil(this.z),this}round(){return this.x=Math.round(this.x),this.y=Math.round(this.y),this.z=Math.round(this.z),this}roundToZero(){return this.x=Math.trunc(this.x),this.y=Math.trunc(this.y),this.z=Math.trunc(this.z),this}negate(){return this.x=-this.x,this.y=-this.y,this.z=-this.z,this}dot(e){return this.x*e.x+this.y*e.y+this.z*e.z}lengthSq(){return this.x*this.x+this.y*this.y+this.z*this.z}length(){return Math.sqrt(this.x*this.x+this.y*this.y+this.z*this.z)}manhattanLength(){return Math.abs(this.x)+Math.abs(this.y)+Math.abs(this.z)}normalize(){return this.divideScalar(this.length()||1)}setLength(e){return this.normalize().multiplyScalar(e)}lerp(e,t){return this.x+=(e.x-this.x)*t,this.y+=(e.y-this.y)*t,this.z+=(e.z-this.z)*t,this}lerpVectors(e,t,n){return this.x=e.x+(t.x-e.x)*n,this.y=e.y+(t.y-e.y)*n,this.z=e.z+(t.z-e.z)*n,this}cross(e){return this.crossVectors(this,e)}crossVectors(e,t){let n=e.x,i=e.y,s=e.z,r=t.x,h=t.y,c=t.z;return this.x=i*c-s*h,this.y=s*r-n*c,this.z=n*h-i*r,this}projectOnVector(e){let t=e.lengthSq();if(t===0)return this.set(0,0,0);let n=e.dot(this)/t;return this.copy(e).multiplyScalar(n)}projectOnPlane(e){return fn.copy(this).projectOnVector(e),this.sub(fn)}reflect(e){return this.sub(fn.copy(e).multiplyScalar(2*this.dot(e)))}angleTo(e){let t=Math.sqrt(this.lengthSq()*e.lengthSq());if(t===0)return Math.PI/2;let n=this.dot(e)/t;return Math.acos(he(n,-1,1))}distanceTo(e){return Math.sqrt(this.distanceToSquared(e))}distanceToSquared(e){let t=this.x-e.x,n=this.y-e.y,i=this.z-e.z;return t*t+n*n+i*i}manhattanDistanceTo(e){return Math.abs(this.x-e.x)+Math.abs(this.y-e.y)+Math.abs(this.z-e.z)}setFromSpherical(e){return this.setFromSphericalCoords(e.radius,e.phi,e.theta)}setFromSphericalCoords(e,t,n){let i=Math.sin(t)*e;return this.x=i*Math.sin(n),this.y=Math.cos(t)*e,this.z=i*Math.cos(n),this}setFromCylindrical(e){return this.setFromCylindricalCoords(e.radius,e.theta,e.y)}setFromCylindricalCoords(e,t,n){return this.x=e*Math.sin(t),this.y=n,this.z=e*Math.cos(t),this}setFromMatrixPosition(e){let t=e.elements;return this.x=t[12],this.y=t[13],this.z=t[14],this}setFromMatrixScale(e){let t=this.setFromMatrixColumn(e,0).length(),n=this.setFromMatrixColumn(e,1).length(),i=this.setFromMatrixColumn(e,2).length();return this.x=t,this.y=n,this.z=i,this}setFromMatrixColumn(e,t){return this.fromArray(e.elements,t*4)}setFromMatrix3Column(e,t){return this.fromArray(e.elements,t*3)}setFromEuler(e){return this.x=e._x,this.y=e._y,this.z=e._z,this}setFromColor(e){return this.x=e.r,this.y=e.g,this.z=e.b,this}equals(e){return e.x===this.x&&e.y===this.y&&e.z===this.z}fromArray(e,t=0){return this.x=e[t],this.y=e[t+1],this.z=e[t+2],this}toArray(e=[],t=0){return e[t]=this.x,e[t+1]=this.y,e[t+2]=this.z,e}fromBufferAttribute(e,t){return this.x=e.getX(t),this.y=e.getY(t),this.z=e.getZ(t),this}random(){return this.x=Math.random(),this.y=Math.random(),this.z=Math.random(),this}randomDirection(){let e=Math.random()*Math.PI*2,t=Math.random()*2-1,n=Math.sqrt(1-t*t);return this.x=n*Math.cos(e),this.y=t,this.z=n*Math.sin(e),this}*[Symbol.iterator](){yield this.x,yield this.y,yield this.z}},fn=new y,Ri=new Be,Ze=class{constructor(e=new y(1/0,1/0,1/0),t=new y(-1/0,-1/0,-1/0)){this.isBox3=!0,this.min=e,this.max=t}set(e,t){return this.min.copy(e),this.max.copy(t),this}setFromArray(e){this.makeEmpty();for(let t=0,n=e.length;t<n;t+=3)this.expandByPoint(xe.fromArray(e,t));return this}setFromBufferAttribute(e){this.makeEmpty();for(let t=0,n=e.count;t<n;t++)this.expandByPoint(xe.fromBufferAttribute(e,t));return this}setFromPoints(e){this.makeEmpty();for(let t=0,n=e.length;t<n;t++)this.expandByPoint(e[t]);return this}setFromCenterAndSize(e,t){let n=xe.copy(t).multiplyScalar(.5);return this.min.copy(e).sub(n),this.max.copy(e).add(n),this}setFromObject(e,t=!1){return this.makeEmpty(),this.expandByObject(e,t)}clone(){return new this.constructor().copy(this)}copy(e){return this.min.copy(e.min),this.max.copy(e.max),this}makeEmpty(){return this.min.x=this.min.y=this.min.z=1/0,this.max.x=this.max.y=this.max.z=-1/0,this}isEmpty(){return this.max.x<this.min.x||this.max.y<this.min.y||this.max.z<this.min.z}getCenter(e){return this.isEmpty()?e.set(0,0,0):e.addVectors(this.min,this.max).multiplyScalar(.5)}getSize(e){return this.isEmpty()?e.set(0,0,0):e.subVectors(this.max,this.min)}expandByPoint(e){return this.min.min(e),this.max.max(e),this}expandByVector(e){return this.min.sub(e),this.max.add(e),this}expandByScalar(e){return this.min.addScalar(-e),this.max.addScalar(e),this}expandByObject(e,t=!1){e.updateWorldMatrix(!1,!1);let n=e.geometry;if(n!==void 0){let s=n.getAttribute("position");if(t===!0&&s!==void 0&&e.isInstancedMesh!==!0)for(let r=0,h=s.count;r<h;r++)e.isMesh===!0?e.getVertexPosition(r,xe):xe.fromBufferAttribute(s,r),xe.applyMatrix4(e.matrixWorld),this.expandByPoint(xe);else e.boundingBox!==void 0?(e.boundingBox===null&&e.computeBoundingBox(),Nt.copy(e.boundingBox)):(n.boundingBox===null&&n.computeBoundingBox(),Nt.copy(n.boundingBox)),Nt.applyMatrix4(e.matrixWorld),this.union(Nt)}let i=e.children;for(let s=0,r=i.length;s<r;s++)this.expandByObject(i[s],t);return this}containsPoint(e){return e.x>=this.min.x&&e.x<=this.max.x&&e.y>=this.min.y&&e.y<=this.max.y&&e.z>=this.min.z&&e.z<=this.max.z}containsBox(e){return this.min.x<=e.min.x&&e.max.x<=this.max.x&&this.min.y<=e.min.y&&e.max.y<=this.max.y&&this.min.z<=e.min.z&&e.max.z<=this.max.z}getParameter(e,t){return t.set((e.x-this.min.x)/(this.max.x-this.min.x),(e.y-this.min.y)/(this.max.y-this.min.y),(e.z-this.min.z)/(this.max.z-this.min.z))}intersectsBox(e){return e.max.x>=this.min.x&&e.min.x<=this.max.x&&e.max.y>=this.min.y&&e.min.y<=this.max.y&&e.max.z>=this.min.z&&e.min.z<=this.max.z}intersectsSphere(e){return this.clampPoint(e.center,xe),xe.distanceToSquared(e.center)<=e.radius*e.radius}intersectsPlane(e){let t,n;return e.normal.x>0?(t=e.normal.x*this.min.x,n=e.normal.x*this.max.x):(t=e.normal.x*this.max.x,n=e.normal.x*this.min.x),e.normal.y>0?(t+=e.normal.y*this.min.y,n+=e.normal.y*this.max.y):(t+=e.normal.y*this.max.y,n+=e.normal.y*this.min.y),e.normal.z>0?(t+=e.normal.z*this.min.z,n+=e.normal.z*this.max.z):(t+=e.normal.z*this.max.z,n+=e.normal.z*this.min.z),t<=-e.constant&&n>=-e.constant}intersectsTriangle(e){if(this.isEmpty())return!1;this.getCenter(yt),Ft.subVectors(this.max,yt),tt.subVectors(e.a,yt),nt.subVectors(e.b,yt),it.subVectors(e.c,yt),Ue.subVectors(nt,tt),Ne.subVectors(it,nt),Ge.subVectors(tt,it);let t=[0,-Ue.z,Ue.y,0,-Ne.z,Ne.y,0,-Ge.z,Ge.y,Ue.z,0,-Ue.x,Ne.z,0,-Ne.x,Ge.z,0,-Ge.x,-Ue.y,Ue.x,0,-Ne.y,Ne.x,0,-Ge.y,Ge.x,0];return!dn(t,tt,nt,it,Ft)||(t=[1,0,0,0,1,0,0,0,1],!dn(t,tt,nt,it,Ft))?!1:(Ot.crossVectors(Ue,Ne),t=[Ot.x,Ot.y,Ot.z],dn(t,tt,nt,it,Ft))}clampPoint(e,t){return t.copy(e).clamp(this.min,this.max)}distanceToPoint(e){return this.clampPoint(e,xe).distanceTo(e)}getBoundingSphere(e){return this.isEmpty()?e.makeEmpty():(this.getCenter(e.center),e.radius=this.getSize(xe).length()*.5),e}intersect(e){return this.min.max(e.min),this.max.min(e.max),this.isEmpty()&&this.makeEmpty(),this}union(e){return this.min.min(e.min),this.max.max(e.max),this}applyMatrix4(e){return this.isEmpty()?this:(Ae[0].set(this.min.x,this.min.y,this.min.z).applyMatrix4(e),Ae[1].set(this.min.x,this.min.y,this.max.z).applyMatrix4(e),Ae[2].set(this.min.x,this.max.y,this.min.z).applyMatrix4(e),Ae[3].set(this.min.x,this.max.y,this.max.z).applyMatrix4(e),Ae[4].set(this.max.x,this.min.y,this.min.z).applyMatrix4(e),Ae[5].set(this.max.x,this.min.y,this.max.z).applyMatrix4(e),Ae[6].set(this.max.x,this.max.y,this.min.z).applyMatrix4(e),Ae[7].set(this.max.x,this.max.y,this.max.z).applyMatrix4(e),this.setFromPoints(Ae),this)}translate(e){return this.min.add(e),this.max.add(e),this}equals(e){return e.min.equals(this.min)&&e.max.equals(this.max)}},Ae=[new y,new y,new y,new y,new y,new y,new y,new y],xe=new y,Nt=new Ze,tt=new y,nt=new y,it=new y,Ue=new y,Ne=new y,Ge=new y,yt=new y,Ft=new y,Ot=new y,We=new y;function dn(_,e,t,n,i){for(let s=0,r=_.length-3;s<=r;s+=3){We.fromArray(_,s);let h=i.x*Math.abs(We.x)+i.y*Math.abs(We.y)+i.z*Math.abs(We.z),c=e.dot(We),o=t.dot(We),a=n.dot(We);if(Math.max(-Math.max(c,o,a),Math.min(c,o,a))>h)return!1}return!0}var hs=new Ze,Mt=new y,pn=new y,dt=class{constructor(e=new y,t=-1){this.isSphere=!0,this.center=e,this.radius=t}set(e,t){return this.center.copy(e),this.radius=t,this}setFromPoints(e,t){let n=this.center;t!==void 0?n.copy(t):hs.setFromPoints(e).getCenter(n);let i=0;for(let s=0,r=e.length;s<r;s++)i=Math.max(i,n.distanceToSquared(e[s]));return this.radius=Math.sqrt(i),this}copy(e){return this.center.copy(e.center),this.radius=e.radius,this}isEmpty(){return this.radius<0}makeEmpty(){return this.center.set(0,0,0),this.radius=-1,this}containsPoint(e){return e.distanceToSquared(this.center)<=this.radius*this.radius}distanceToPoint(e){return e.distanceTo(this.center)-this.radius}intersectsSphere(e){let t=this.radius+e.radius;return e.center.distanceToSquared(this.center)<=t*t}intersectsBox(e){return e.intersectsSphere(this)}intersectsPlane(e){return Math.abs(e.distanceToPoint(this.center))<=this.radius}clampPoint(e,t){let n=this.center.distanceToSquared(e);return t.copy(e),n>this.radius*this.radius&&(t.sub(this.center).normalize(),t.multiplyScalar(this.radius).add(this.center)),t}getBoundingBox(e){return this.isEmpty()?(e.makeEmpty(),e):(e.set(this.center,this.center),e.expandByScalar(this.radius),e)}applyMatrix4(e){return this.center.applyMatrix4(e),this.radius=this.radius*e.getMaxScaleOnAxis(),this}translate(e){return this.center.add(e),this}expandByPoint(e){if(this.isEmpty())return this.center.copy(e),this.radius=0,this;Mt.subVectors(e,this.center);let t=Mt.lengthSq();if(t>this.radius*this.radius){let n=Math.sqrt(t),i=(n-this.radius)*.5;this.center.addScaledVector(Mt,i/n),this.radius+=i}return this}union(e){return e.isEmpty()?this:this.isEmpty()?(this.copy(e),this):(this.center.equals(e.center)===!0?this.radius=Math.max(this.radius,e.radius):(pn.subVectors(e.center,this.center).setLength(e.radius),this.expandByPoint(Mt.copy(e.center).add(pn)),this.expandByPoint(Mt.copy(e.center).sub(pn))),this)}equals(e){return e.center.equals(this.center)&&e.radius===this.radius}clone(){return new this.constructor().copy(this)}},Re=new y,mn=new y,kt=new y,Fe=new y,gn=new y,Bt=new y,_n=new y,Un=class{constructor(e=new y,t=new y(0,0,-1)){this.origin=e,this.direction=t}set(e,t){return this.origin.copy(e),this.direction.copy(t),this}copy(e){return this.origin.copy(e.origin),this.direction.copy(e.direction),this}at(e,t){return t.copy(this.origin).addScaledVector(this.direction,e)}lookAt(e){return this.direction.copy(e).sub(this.origin).normalize(),this}recast(e){return this.origin.copy(this.at(e,Re)),this}closestPointToPoint(e,t){t.subVectors(e,this.origin);let n=t.dot(this.direction);return n<0?t.copy(this.origin):t.copy(this.origin).addScaledVector(this.direction,n)}distanceToPoint(e){return Math.sqrt(this.distanceSqToPoint(e))}distanceSqToPoint(e){let t=Re.subVectors(e,this.origin).dot(this.direction);return t<0?this.origin.distanceToSquared(e):(Re.copy(this.origin).addScaledVector(this.direction,t),Re.distanceToSquared(e))}distanceSqToSegment(e,t,n,i){mn.copy(e).add(t).multiplyScalar(.5),kt.copy(t).sub(e).normalize(),Fe.copy(this.origin).sub(mn);let s=e.distanceTo(t)*.5,r=-this.direction.dot(kt),h=Fe.dot(this.direction),c=-Fe.dot(kt),o=Fe.lengthSq(),a=Math.abs(1-r*r),l,u,f,d;if(a>0)if(l=r*c-h,u=r*h-c,d=s*a,l>=0)if(u>=-d)if(u<=d){let p=1/a;l*=p,u*=p,f=l*(l+r*u+2*h)+u*(r*l+u+2*c)+o}else u=s,l=Math.max(0,-(r*u+h)),f=-l*l+u*(u+2*c)+o;else u=-s,l=Math.max(0,-(r*u+h)),f=-l*l+u*(u+2*c)+o;else u<=-d?(l=Math.max(0,-(-r*s+h)),u=l>0?-s:Math.min(Math.max(-s,-c),s),f=-l*l+u*(u+2*c)+o):u<=d?(l=0,u=Math.min(Math.max(-s,-c),s),f=u*(u+2*c)+o):(l=Math.max(0,-(r*s+h)),u=l>0?s:Math.min(Math.max(-s,-c),s),f=-l*l+u*(u+2*c)+o);else u=r>0?-s:s,l=Math.max(0,-(r*u+h)),f=-l*l+u*(u+2*c)+o;return n&&n.copy(this.origin).addScaledVector(this.direction,l),i&&i.copy(mn).addScaledVector(kt,u),f}intersectSphere(e,t){Re.subVectors(e.center,this.origin);let n=Re.dot(this.direction),i=Re.dot(Re)-n*n,s=e.radius*e.radius;if(i>s)return null;let r=Math.sqrt(s-i),h=n-r,c=n+r;return c<0?null:h<0?this.at(c,t):this.at(h,t)}intersectsSphere(e){return this.distanceSqToPoint(e.center)<=e.radius*e.radius}distanceToPlane(e){let t=e.normal.dot(this.direction);if(t===0)return e.distanceToPoint(this.origin)===0?0:null;let n=-(this.origin.dot(e.normal)+e.constant)/t;return n>=0?n:null}intersectPlane(e,t){let n=this.distanceToPlane(e);return n===null?null:this.at(n,t)}intersectsPlane(e){let t=e.distanceToPoint(this.origin);return t===0||e.normal.dot(this.direction)*t<0}intersectBox(e,t){let n,i,s,r,h,c,o=1/this.direction.x,a=1/this.direction.y,l=1/this.direction.z,u=this.origin;return o>=0?(n=(e.min.x-u.x)*o,i=(e.max.x-u.x)*o):(n=(e.max.x-u.x)*o,i=(e.min.x-u.x)*o),a>=0?(s=(e.min.y-u.y)*a,r=(e.max.y-u.y)*a):(s=(e.max.y-u.y)*a,r=(e.min.y-u.y)*a),n>r||s>i||((s>n||isNaN(n))&&(n=s),(r<i||isNaN(i))&&(i=r),l>=0?(h=(e.min.z-u.z)*l,c=(e.max.z-u.z)*l):(h=(e.max.z-u.z)*l,c=(e.min.z-u.z)*l),n>c||h>i)||((h>n||n!==n)&&(n=h),(c<i||i!==i)&&(i=c),i<0)?null:this.at(n>=0?n:i,t)}intersectsBox(e){return this.intersectBox(e,Re)!==null}intersectTriangle(e,t,n,i,s){gn.subVectors(t,e),Bt.subVectors(n,e),_n.crossVectors(gn,Bt);let r=this.direction.dot(_n),h;if(r>0){if(i)return null;h=1}else if(r<0)h=-1,r=-r;else return null;Fe.subVectors(this.origin,e);let c=h*this.direction.dot(Bt.crossVectors(Fe,Bt));if(c<0)return null;let o=h*this.direction.dot(gn.cross(Fe));if(o<0||c+o>r)return null;let a=-h*Fe.dot(_n);return a<0?null:this.at(a/r,s)}applyMatrix4(e){return this.origin.applyMatrix4(e),this.direction.transformDirection(e),this}equals(e){return e.origin.equals(this.origin)&&e.direction.equals(this.direction)}clone(){return new this.constructor().copy(this)}},we=class _{constructor(e,t,n,i,s,r,h,c,o,a,l,u,f,d,p,m){_.prototype.isMatrix4=!0,this.elements=[1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1],e!==void 0&&this.set(e,t,n,i,s,r,h,c,o,a,l,u,f,d,p,m)}set(e,t,n,i,s,r,h,c,o,a,l,u,f,d,p,m){let g=this.elements;return g[0]=e,g[4]=t,g[8]=n,g[12]=i,g[1]=s,g[5]=r,g[9]=h,g[13]=c,g[2]=o,g[6]=a,g[10]=l,g[14]=u,g[3]=f,g[7]=d,g[11]=p,g[15]=m,this}identity(){return this.set(1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1),this}clone(){return new _().fromArray(this.elements)}copy(e){let t=this.elements,n=e.elements;return t[0]=n[0],t[1]=n[1],t[2]=n[2],t[3]=n[3],t[4]=n[4],t[5]=n[5],t[6]=n[6],t[7]=n[7],t[8]=n[8],t[9]=n[9],t[10]=n[10],t[11]=n[11],t[12]=n[12],t[13]=n[13],t[14]=n[14],t[15]=n[15],this}copyPosition(e){let t=this.elements,n=e.elements;return t[12]=n[12],t[13]=n[13],t[14]=n[14],this}setFromMatrix3(e){let t=e.elements;return this.set(t[0],t[3],t[6],0,t[1],t[4],t[7],0,t[2],t[5],t[8],0,0,0,0,1),this}extractBasis(e,t,n){return e.setFromMatrixColumn(this,0),t.setFromMatrixColumn(this,1),n.setFromMatrixColumn(this,2),this}makeBasis(e,t,n){return this.set(e.x,t.x,n.x,0,e.y,t.y,n.y,0,e.z,t.z,n.z,0,0,0,0,1),this}extractRotation(e){let t=this.elements,n=e.elements,i=1/st.setFromMatrixColumn(e,0).length(),s=1/st.setFromMatrixColumn(e,1).length(),r=1/st.setFromMatrixColumn(e,2).length();return t[0]=n[0]*i,t[1]=n[1]*i,t[2]=n[2]*i,t[3]=0,t[4]=n[4]*s,t[5]=n[5]*s,t[6]=n[6]*s,t[7]=0,t[8]=n[8]*r,t[9]=n[9]*r,t[10]=n[10]*r,t[11]=0,t[12]=0,t[13]=0,t[14]=0,t[15]=1,this}makeRotationFromEuler(e){let t=this.elements,n=e.x,i=e.y,s=e.z,r=Math.cos(n),h=Math.sin(n),c=Math.cos(i),o=Math.sin(i),a=Math.cos(s),l=Math.sin(s);if(e.order==="XYZ"){let u=r*a,f=r*l,d=h*a,p=h*l;t[0]=c*a,t[4]=-c*l,t[8]=o,t[1]=f+d*o,t[5]=u-p*o,t[9]=-h*c,t[2]=p-u*o,t[6]=d+f*o,t[10]=r*c}else if(e.order==="YXZ"){let u=c*a,f=c*l,d=o*a,p=o*l;t[0]=u+p*h,t[4]=d*h-f,t[8]=r*o,t[1]=r*l,t[5]=r*a,t[9]=-h,t[2]=f*h-d,t[6]=p+u*h,t[10]=r*c}else if(e.order==="ZXY"){let u=c*a,f=c*l,d=o*a,p=o*l;t[0]=u-p*h,t[4]=-r*l,t[8]=d+f*h,t[1]=f+d*h,t[5]=r*a,t[9]=p-u*h,t[2]=-r*o,t[6]=h,t[10]=r*c}else if(e.order==="ZYX"){let u=r*a,f=r*l,d=h*a,p=h*l;t[0]=c*a,t[4]=d*o-f,t[8]=u*o+p,t[1]=c*l,t[5]=p*o+u,t[9]=f*o-d,t[2]=-o,t[6]=h*c,t[10]=r*c}else if(e.order==="YZX"){let u=r*c,f=r*o,d=h*c,p=h*o;t[0]=c*a,t[4]=p-u*l,t[8]=d*l+f,t[1]=l,t[5]=r*a,t[9]=-h*a,t[2]=-o*a,t[6]=f*l+d,t[10]=u-p*l}else if(e.order==="XZY"){let u=r*c,f=r*o,d=h*c,p=h*o;t[0]=c*a,t[4]=-l,t[8]=o*a,t[1]=u*l+p,t[5]=r*a,t[9]=f*l-d,t[2]=d*l-f,t[6]=h*a,t[10]=p*l+u}return t[3]=0,t[7]=0,t[11]=0,t[12]=0,t[13]=0,t[14]=0,t[15]=1,this}makeRotationFromQuaternion(e){return this.compose(us,e,fs)}lookAt(e,t,n){let i=this.elements;return de.subVectors(e,t),de.lengthSq()===0&&(de.z=1),de.normalize(),Oe.crossVectors(n,de),Oe.lengthSq()===0&&(Math.abs(n.z)===1?de.x+=1e-4:de.z+=1e-4,de.normalize(),Oe.crossVectors(n,de)),Oe.normalize(),zt.crossVectors(de,Oe),i[0]=Oe.x,i[4]=zt.x,i[8]=de.x,i[1]=Oe.y,i[5]=zt.y,i[9]=de.y,i[2]=Oe.z,i[6]=zt.z,i[10]=de.z,this}multiply(e){return this.multiplyMatrices(this,e)}premultiply(e){return this.multiplyMatrices(e,this)}multiplyMatrices(e,t){let n=e.elements,i=t.elements,s=this.elements,r=n[0],h=n[4],c=n[8],o=n[12],a=n[1],l=n[5],u=n[9],f=n[13],d=n[2],p=n[6],m=n[10],g=n[14],v=n[3],x=n[7],M=n[11],b=n[15],T=i[0],E=i[4],P=i[8],C=i[12],W=i[1],z=i[5],te=i[9],Z=i[13],fe=i[2],q=i[6],A=i[10],I=i[14],S=i[3],N=i[7],L=i[11],D=i[15];return s[0]=r*T+h*W+c*fe+o*S,s[4]=r*E+h*z+c*q+o*N,s[8]=r*P+h*te+c*A+o*L,s[12]=r*C+h*Z+c*I+o*D,s[1]=a*T+l*W+u*fe+f*S,s[5]=a*E+l*z+u*q+f*N,s[9]=a*P+l*te+u*A+f*L,s[13]=a*C+l*Z+u*I+f*D,s[2]=d*T+p*W+m*fe+g*S,s[6]=d*E+p*z+m*q+g*N,s[10]=d*P+p*te+m*A+g*L,s[14]=d*C+p*Z+m*I+g*D,s[3]=v*T+x*W+M*fe+b*S,s[7]=v*E+x*z+M*q+b*N,s[11]=v*P+x*te+M*A+b*L,s[15]=v*C+x*Z+M*I+b*D,this}multiplyScalar(e){let t=this.elements;return t[0]*=e,t[4]*=e,t[8]*=e,t[12]*=e,t[1]*=e,t[5]*=e,t[9]*=e,t[13]*=e,t[2]*=e,t[6]*=e,t[10]*=e,t[14]*=e,t[3]*=e,t[7]*=e,t[11]*=e,t[15]*=e,this}determinant(){let e=this.elements,t=e[0],n=e[4],i=e[8],s=e[12],r=e[1],h=e[5],c=e[9],o=e[13],a=e[2],l=e[6],u=e[10],f=e[14],d=e[3],p=e[7],m=e[11],g=e[15];return d*(+s*c*l-i*o*l-s*h*u+n*o*u+i*h*f-n*c*f)+p*(+t*c*f-t*o*u+s*r*u-i*r*f+i*o*a-s*c*a)+m*(+t*o*l-t*h*f-s*r*l+n*r*f+s*h*a-n*o*a)+g*(-i*h*a-t*c*l+t*h*u+i*r*l-n*r*u+n*c*a)}transpose(){let e=this.elements,t;return t=e[1],e[1]=e[4],e[4]=t,t=e[2],e[2]=e[8],e[8]=t,t=e[6],e[6]=e[9],e[9]=t,t=e[3],e[3]=e[12],e[12]=t,t=e[7],e[7]=e[13],e[13]=t,t=e[11],e[11]=e[14],e[14]=t,this}setPosition(e,t,n){let i=this.elements;return e.isVector3?(i[12]=e.x,i[13]=e.y,i[14]=e.z):(i[12]=e,i[13]=t,i[14]=n),this}invert(){let e=this.elements,t=e[0],n=e[1],i=e[2],s=e[3],r=e[4],h=e[5],c=e[6],o=e[7],a=e[8],l=e[9],u=e[10],f=e[11],d=e[12],p=e[13],m=e[14],g=e[15],v=l*m*o-p*u*o+p*c*f-h*m*f-l*c*g+h*u*g,x=d*u*o-a*m*o-d*c*f+r*m*f+a*c*g-r*u*g,M=a*p*o-d*l*o+d*h*f-r*p*f-a*h*g+r*l*g,b=d*l*c-a*p*c-d*h*u+r*p*u+a*h*m-r*l*m,T=t*v+n*x+i*M+s*b;if(T===0)return this.set(0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0);let E=1/T;return e[0]=v*E,e[1]=(p*u*s-l*m*s-p*i*f+n*m*f+l*i*g-n*u*g)*E,e[2]=(h*m*s-p*c*s+p*i*o-n*m*o-h*i*g+n*c*g)*E,e[3]=(l*c*s-h*u*s-l*i*o+n*u*o+h*i*f-n*c*f)*E,e[4]=x*E,e[5]=(a*m*s-d*u*s+d*i*f-t*m*f-a*i*g+t*u*g)*E,e[6]=(d*c*s-r*m*s-d*i*o+t*m*o+r*i*g-t*c*g)*E,e[7]=(r*u*s-a*c*s+a*i*o-t*u*o-r*i*f+t*c*f)*E,e[8]=M*E,e[9]=(d*l*s-a*p*s-d*n*f+t*p*f+a*n*g-t*l*g)*E,e[10]=(r*p*s-d*h*s+d*n*o-t*p*o-r*n*g+t*h*g)*E,e[11]=(a*h*s-r*l*s-a*n*o+t*l*o+r*n*f-t*h*f)*E,e[12]=b*E,e[13]=(a*p*i-d*l*i+d*n*u-t*p*u-a*n*m+t*l*m)*E,e[14]=(d*h*i-r*p*i-d*n*c+t*p*c+r*n*m-t*h*m)*E,e[15]=(r*l*i-a*h*i+a*n*c-t*l*c-r*n*u+t*h*u)*E,this}scale(e){let t=this.elements,n=e.x,i=e.y,s=e.z;return t[0]*=n,t[4]*=i,t[8]*=s,t[1]*=n,t[5]*=i,t[9]*=s,t[2]*=n,t[6]*=i,t[10]*=s,t[3]*=n,t[7]*=i,t[11]*=s,this}getMaxScaleOnAxis(){let e=this.elements,t=e[0]*e[0]+e[1]*e[1]+e[2]*e[2],n=e[4]*e[4]+e[5]*e[5]+e[6]*e[6],i=e[8]*e[8]+e[9]*e[9]+e[10]*e[10];return Math.sqrt(Math.max(t,n,i))}makeTranslation(e,t,n){return e.isVector3?this.set(1,0,0,e.x,0,1,0,e.y,0,0,1,e.z,0,0,0,1):this.set(1,0,0,e,0,1,0,t,0,0,1,n,0,0,0,1),this}makeRotationX(e){let t=Math.cos(e),n=Math.sin(e);return this.set(1,0,0,0,0,t,-n,0,0,n,t,0,0,0,0,1),this}makeRotationY(e){let t=Math.cos(e),n=Math.sin(e);return this.set(t,0,n,0,0,1,0,0,-n,0,t,0,0,0,0,1),this}makeRotationZ(e){let t=Math.cos(e),n=Math.sin(e);return this.set(t,-n,0,0,n,t,0,0,0,0,1,0,0,0,0,1),this}makeRotationAxis(e,t){let n=Math.cos(t),i=Math.sin(t),s=1-n,r=e.x,h=e.y,c=e.z,o=s*r,a=s*h;return this.set(o*r+n,o*h-i*c,o*c+i*h,0,o*h+i*c,a*h+n,a*c-i*r,0,o*c-i*h,a*c+i*r,s*c*c+n,0,0,0,0,1),this}makeScale(e,t,n){return this.set(e,0,0,0,0,t,0,0,0,0,n,0,0,0,0,1),this}makeShear(e,t,n,i,s,r){return this.set(1,n,s,0,e,1,r,0,t,i,1,0,0,0,0,1),this}compose(e,t,n){let i=this.elements,s=t._x,r=t._y,h=t._z,c=t._w,o=s+s,a=r+r,l=h+h,u=s*o,f=s*a,d=s*l,p=r*a,m=r*l,g=h*l,v=c*o,x=c*a,M=c*l,b=n.x,T=n.y,E=n.z;return i[0]=(1-(p+g))*b,i[1]=(f+M)*b,i[2]=(d-x)*b,i[3]=0,i[4]=(f-M)*T,i[5]=(1-(u+g))*T,i[6]=(m+v)*T,i[7]=0,i[8]=(d+x)*E,i[9]=(m-v)*E,i[10]=(1-(u+p))*E,i[11]=0,i[12]=e.x,i[13]=e.y,i[14]=e.z,i[15]=1,this}decompose(e,t,n){let i=this.elements,s=st.set(i[0],i[1],i[2]).length(),r=st.set(i[4],i[5],i[6]).length(),h=st.set(i[8],i[9],i[10]).length();this.determinant()<0&&(s=-s),e.x=i[12],e.y=i[13],e.z=i[14],ye.copy(this);let o=1/s,a=1/r,l=1/h;return ye.elements[0]*=o,ye.elements[1]*=o,ye.elements[2]*=o,ye.elements[4]*=a,ye.elements[5]*=a,ye.elements[6]*=a,ye.elements[8]*=l,ye.elements[9]*=l,ye.elements[10]*=l,t.setFromRotationMatrix(ye),n.x=s,n.y=r,n.z=h,this}makePerspective(e,t,n,i,s,r,h=Ut){let c=this.elements,o=2*s/(t-e),a=2*s/(n-i),l=(t+e)/(t-e),u=(n+i)/(n-i),f,d;if(h===Ut)f=-(r+s)/(r-s),d=-2*r*s/(r-s);else if(h===wi)f=-r/(r-s),d=-r*s/(r-s);else throw new Error("THREE.Matrix4.makePerspective(): Invalid coordinate system: "+h);return c[0]=o,c[4]=0,c[8]=l,c[12]=0,c[1]=0,c[5]=a,c[9]=u,c[13]=0,c[2]=0,c[6]=0,c[10]=f,c[14]=d,c[3]=0,c[7]=0,c[11]=-1,c[15]=0,this}makeOrthographic(e,t,n,i,s,r,h=Ut){let c=this.elements,o=1/(t-e),a=1/(n-i),l=1/(r-s),u=(t+e)*o,f=(n+i)*a,d,p;if(h===Ut)d=(r+s)*l,p=-2*l;else if(h===wi)d=s*l,p=-1*l;else throw new Error("THREE.Matrix4.makeOrthographic(): Invalid coordinate system: "+h);return c[0]=2*o,c[4]=0,c[8]=0,c[12]=-u,c[1]=0,c[5]=2*a,c[9]=0,c[13]=-f,c[2]=0,c[6]=0,c[10]=p,c[14]=-d,c[3]=0,c[7]=0,c[11]=0,c[15]=1,this}equals(e){let t=this.elements,n=e.elements;for(let i=0;i<16;i++)if(t[i]!==n[i])return!1;return!0}fromArray(e,t=0){for(let n=0;n<16;n++)this.elements[n]=e[n+t];return this}toArray(e=[],t=0){let n=this.elements;return e[t]=n[0],e[t+1]=n[1],e[t+2]=n[2],e[t+3]=n[3],e[t+4]=n[4],e[t+5]=n[5],e[t+6]=n[6],e[t+7]=n[7],e[t+8]=n[8],e[t+9]=n[9],e[t+10]=n[10],e[t+11]=n[11],e[t+12]=n[12],e[t+13]=n[13],e[t+14]=n[14],e[t+15]=n[15],e}},st=new y,ye=new we,us=new y(0,0,0),fs=new y(1,1,1),Oe=new y,zt=new y,de=new y,Ci=new we,Pi=new Be,Tt=class _{constructor(e=0,t=0,n=0,i=_.DEFAULT_ORDER){this.isEuler=!0,this._x=e,this._y=t,this._z=n,this._order=i}get x(){return this._x}set x(e){this._x=e,this._onChangeCallback()}get y(){return this._y}set y(e){this._y=e,this._onChangeCallback()}get z(){return this._z}set z(e){this._z=e,this._onChangeCallback()}get order(){return this._order}set order(e){this._order=e,this._onChangeCallback()}set(e,t,n,i=this._order){return this._x=e,this._y=t,this._z=n,this._order=i,this._onChangeCallback(),this}clone(){return new this.constructor(this._x,this._y,this._z,this._order)}copy(e){return this._x=e._x,this._y=e._y,this._z=e._z,this._order=e._order,this._onChangeCallback(),this}setFromRotationMatrix(e,t=this._order,n=!0){let i=e.elements,s=i[0],r=i[4],h=i[8],c=i[1],o=i[5],a=i[9],l=i[2],u=i[6],f=i[10];switch(t){case"XYZ":this._y=Math.asin(he(h,-1,1)),Math.abs(h)<.9999999?(this._x=Math.atan2(-a,f),this._z=Math.atan2(-r,s)):(this._x=Math.atan2(u,o),this._z=0);break;case"YXZ":this._x=Math.asin(-he(a,-1,1)),Math.abs(a)<.9999999?(this._y=Math.atan2(h,f),this._z=Math.atan2(c,o)):(this._y=Math.atan2(-l,s),this._z=0);break;case"ZXY":this._x=Math.asin(he(u,-1,1)),Math.abs(u)<.9999999?(this._y=Math.atan2(-l,f),this._z=Math.atan2(-r,o)):(this._y=0,this._z=Math.atan2(c,s));break;case"ZYX":this._y=Math.asin(-he(l,-1,1)),Math.abs(l)<.9999999?(this._x=Math.atan2(u,f),this._z=Math.atan2(c,s)):(this._x=0,this._z=Math.atan2(-r,o));break;case"YZX":this._z=Math.asin(he(c,-1,1)),Math.abs(c)<.9999999?(this._x=Math.atan2(-a,o),this._y=Math.atan2(-l,s)):(this._x=0,this._y=Math.atan2(h,f));break;case"XZY":this._z=Math.asin(-he(r,-1,1)),Math.abs(r)<.9999999?(this._x=Math.atan2(u,o),this._y=Math.atan2(h,s)):(this._x=Math.atan2(-a,f),this._y=0);break;default:console.warn("THREE.Euler: .setFromRotationMatrix() encountered an unknown order: "+t)}return this._order=t,n===!0&&this._onChangeCallback(),this}setFromQuaternion(e,t,n){return Ci.makeRotationFromQuaternion(e),this.setFromRotationMatrix(Ci,t,n)}setFromVector3(e,t=this._order){return this.set(e.x,e.y,e.z,t)}reorder(e){return Pi.setFromEuler(this),this.setFromQuaternion(Pi,e)}equals(e){return e._x===this._x&&e._y===this._y&&e._z===this._z&&e._order===this._order}fromArray(e){return this._x=e[0],this._y=e[1],this._z=e[2],e[3]!==void 0&&(this._order=e[3]),this._onChangeCallback(),this}toArray(e=[],t=0){return e[t]=this._x,e[t+1]=this._y,e[t+2]=this._z,e[t+3]=this._order,e}_onChange(e){return this._onChangeCallback=e,this}_onChangeCallback(){}*[Symbol.iterator](){yield this._x,yield this._y,yield this._z,yield this._order}};Tt.DEFAULT_ORDER="XYZ";var Nn=class{constructor(){this.mask=1}set(e){this.mask=(1<<e|0)>>>0}enable(e){this.mask|=1<<e|0}enableAll(){this.mask=-1}toggle(e){this.mask^=1<<e|0}disable(e){this.mask&=~(1<<e|0)}disableAll(){this.mask=0}test(e){return(this.mask&e.mask)!==0}isEnabled(e){return(this.mask&(1<<e|0))!==0}},ds=0,Ii=new y,rt=new Be,Ce=new we,Vt=new y,bt=new y,ps=new y,ms=new Be,Li=new y(1,0,0),Di=new y(0,1,0),Ui=new y(0,0,1),Ni={type:"added"},gs={type:"removed"},at={type:"childadded",child:null},vn={type:"childremoved",child:null},ze=class _ extends ft{constructor(){super(),this.isObject3D=!0,Object.defineProperty(this,"id",{value:ds++}),this.uuid=Ct(),this.name="",this.type="Object3D",this.parent=null,this.children=[],this.up=_.DEFAULT_UP.clone();let e=new y,t=new Tt,n=new Be,i=new y(1,1,1);function s(){n.setFromEuler(t,!1)}function r(){t.setFromQuaternion(n,void 0,!1)}t._onChange(s),n._onChange(r),Object.defineProperties(this,{position:{configurable:!0,enumerable:!0,value:e},rotation:{configurable:!0,enumerable:!0,value:t},quaternion:{configurable:!0,enumerable:!0,value:n},scale:{configurable:!0,enumerable:!0,value:i},modelViewMatrix:{value:new we},normalMatrix:{value:new B}}),this.matrix=new we,this.matrixWorld=new we,this.matrixAutoUpdate=_.DEFAULT_MATRIX_AUTO_UPDATE,this.matrixWorldAutoUpdate=_.DEFAULT_MATRIX_WORLD_AUTO_UPDATE,this.matrixWorldNeedsUpdate=!1,this.layers=new Nn,this.visible=!0,this.castShadow=!1,this.receiveShadow=!1,this.frustumCulled=!0,this.renderOrder=0,this.animations=[],this.userData={}}onBeforeShadow(){}onAfterShadow(){}onBeforeRender(){}onAfterRender(){}applyMatrix4(e){this.matrixAutoUpdate&&this.updateMatrix(),this.matrix.premultiply(e),this.matrix.decompose(this.position,this.quaternion,this.scale)}applyQuaternion(e){return this.quaternion.premultiply(e),this}setRotationFromAxisAngle(e,t){this.quaternion.setFromAxisAngle(e,t)}setRotationFromEuler(e){this.quaternion.setFromEuler(e,!0)}setRotationFromMatrix(e){this.quaternion.setFromRotationMatrix(e)}setRotationFromQuaternion(e){this.quaternion.copy(e)}rotateOnAxis(e,t){return rt.setFromAxisAngle(e,t),this.quaternion.multiply(rt),this}rotateOnWorldAxis(e,t){return rt.setFromAxisAngle(e,t),this.quaternion.premultiply(rt),this}rotateX(e){return this.rotateOnAxis(Li,e)}rotateY(e){return this.rotateOnAxis(Di,e)}rotateZ(e){return this.rotateOnAxis(Ui,e)}translateOnAxis(e,t){return Ii.copy(e).applyQuaternion(this.quaternion),this.position.add(Ii.multiplyScalar(t)),this}translateX(e){return this.translateOnAxis(Li,e)}translateY(e){return this.translateOnAxis(Di,e)}translateZ(e){return this.translateOnAxis(Ui,e)}localToWorld(e){return this.updateWorldMatrix(!0,!1),e.applyMatrix4(this.matrixWorld)}worldToLocal(e){return this.updateWorldMatrix(!0,!1),e.applyMatrix4(Ce.copy(this.matrixWorld).invert())}lookAt(e,t,n){e.isVector3?Vt.copy(e):Vt.set(e,t,n);let i=this.parent;this.updateWorldMatrix(!0,!1),bt.setFromMatrixPosition(this.matrixWorld),this.isCamera||this.isLight?Ce.lookAt(bt,Vt,this.up):Ce.lookAt(Vt,bt,this.up),this.quaternion.setFromRotationMatrix(Ce),i&&(Ce.extractRotation(i.matrixWorld),rt.setFromRotationMatrix(Ce),this.quaternion.premultiply(rt.invert()))}add(e){if(arguments.length>1){for(let t=0;t<arguments.length;t++)this.add(arguments[t]);return this}return e===this?(console.error("THREE.Object3D.add: object can't be added as a child of itself.",e),this):(e&&e.isObject3D?(e.removeFromParent(),e.parent=this,this.children.push(e),e.dispatchEvent(Ni),at.child=e,this.dispatchEvent(at),at.child=null):console.error("THREE.Object3D.add: object not an instance of THREE.Object3D.",e),this)}remove(e){if(arguments.length>1){for(let n=0;n<arguments.length;n++)this.remove(arguments[n]);return this}let t=this.children.indexOf(e);return t!==-1&&(e.parent=null,this.children.splice(t,1),e.dispatchEvent(gs),vn.child=e,this.dispatchEvent(vn),vn.child=null),this}removeFromParent(){let e=this.parent;return e!==null&&e.remove(this),this}clear(){return this.remove(...this.children)}attach(e){return this.updateWorldMatrix(!0,!1),Ce.copy(this.matrixWorld).invert(),e.parent!==null&&(e.parent.updateWorldMatrix(!0,!1),Ce.multiply(e.parent.matrixWorld)),e.applyMatrix4(Ce),e.removeFromParent(),e.parent=this,this.children.push(e),e.updateWorldMatrix(!1,!0),e.dispatchEvent(Ni),at.child=e,this.dispatchEvent(at),at.child=null,this}getObjectById(e){return this.getObjectByProperty("id",e)}getObjectByName(e){return this.getObjectByProperty("name",e)}getObjectByProperty(e,t){if(this[e]===t)return this;for(let n=0,i=this.children.length;n<i;n++){let r=this.children[n].getObjectByProperty(e,t);if(r!==void 0)return r}}getObjectsByProperty(e,t,n=[]){this[e]===t&&n.push(this);let i=this.children;for(let s=0,r=i.length;s<r;s++)i[s].getObjectsByProperty(e,t,n);return n}getWorldPosition(e){return this.updateWorldMatrix(!0,!1),e.setFromMatrixPosition(this.matrixWorld)}getWorldQuaternion(e){return this.updateWorldMatrix(!0,!1),this.matrixWorld.decompose(bt,e,ps),e}getWorldScale(e){return this.updateWorldMatrix(!0,!1),this.matrixWorld.decompose(bt,ms,e),e}getWorldDirection(e){this.updateWorldMatrix(!0,!1);let t=this.matrixWorld.elements;return e.set(t[8],t[9],t[10]).normalize()}raycast(){}traverse(e){e(this);let t=this.children;for(let n=0,i=t.length;n<i;n++)t[n].traverse(e)}traverseVisible(e){if(this.visible===!1)return;e(this);let t=this.children;for(let n=0,i=t.length;n<i;n++)t[n].traverseVisible(e)}traverseAncestors(e){let t=this.parent;t!==null&&(e(t),t.traverseAncestors(e))}updateMatrix(){this.matrix.compose(this.position,this.quaternion,this.scale),this.matrixWorldNeedsUpdate=!0}updateMatrixWorld(e){this.matrixAutoUpdate&&this.updateMatrix(),(this.matrixWorldNeedsUpdate||e)&&(this.matrixWorldAutoUpdate===!0&&(this.parent===null?this.matrixWorld.copy(this.matrix):this.matrixWorld.multiplyMatrices(this.parent.matrixWorld,this.matrix)),this.matrixWorldNeedsUpdate=!1,e=!0);let t=this.children;for(let n=0,i=t.length;n<i;n++)t[n].updateMatrixWorld(e)}updateWorldMatrix(e,t){let n=this.parent;if(e===!0&&n!==null&&n.updateWorldMatrix(!0,!1),this.matrixAutoUpdate&&this.updateMatrix(),this.matrixWorldAutoUpdate===!0&&(this.parent===null?this.matrixWorld.copy(this.matrix):this.matrixWorld.multiplyMatrices(this.parent.matrixWorld,this.matrix)),t===!0){let i=this.children;for(let s=0,r=i.length;s<r;s++)i[s].updateWorldMatrix(!1,!0)}}toJSON(e){let t=e===void 0||typeof e=="string",n={};t&&(e={geometries:{},materials:{},textures:{},images:{},shapes:{},skeletons:{},animations:{},nodes:{}},n.metadata={version:4.6,type:"Object",generator:"Object3D.toJSON"});let i={};i.uuid=this.uuid,i.type=this.type,this.name!==""&&(i.name=this.name),this.castShadow===!0&&(i.castShadow=!0),this.receiveShadow===!0&&(i.receiveShadow=!0),this.visible===!1&&(i.visible=!1),this.frustumCulled===!1&&(i.frustumCulled=!1),this.renderOrder!==0&&(i.renderOrder=this.renderOrder),Object.keys(this.userData).length>0&&(i.userData=this.userData),i.layers=this.layers.mask,i.matrix=this.matrix.toArray(),i.up=this.up.toArray(),this.matrixAutoUpdate===!1&&(i.matrixAutoUpdate=!1),this.isInstancedMesh&&(i.type="InstancedMesh",i.count=this.count,i.instanceMatrix=this.instanceMatrix.toJSON(),this.instanceColor!==null&&(i.instanceColor=this.instanceColor.toJSON())),this.isBatchedMesh&&(i.type="BatchedMesh",i.perObjectFrustumCulled=this.perObjectFrustumCulled,i.sortObjects=this.sortObjects,i.drawRanges=this._drawRanges,i.reservedRanges=this._reservedRanges,i.visibility=this._visibility,i.active=this._active,i.bounds=this._bounds.map(h=>({boxInitialized:h.boxInitialized,boxMin:h.box.min.toArray(),boxMax:h.box.max.toArray(),sphereInitialized:h.sphereInitialized,sphereRadius:h.sphere.radius,sphereCenter:h.sphere.center.toArray()})),i.maxInstanceCount=this._maxInstanceCount,i.maxVertexCount=this._maxVertexCount,i.maxIndexCount=this._maxIndexCount,i.geometryInitialized=this._geometryInitialized,i.geometryCount=this._geometryCount,i.matricesTexture=this._matricesTexture.toJSON(e),this._colorsTexture!==null&&(i.colorsTexture=this._colorsTexture.toJSON(e)),this.boundingSphere!==null&&(i.boundingSphere={center:i.boundingSphere.center.toArray(),radius:i.boundingSphere.radius}),this.boundingBox!==null&&(i.boundingBox={min:i.boundingBox.min.toArray(),max:i.boundingBox.max.toArray()}));function s(h,c){return h[c.uuid]===void 0&&(h[c.uuid]=c.toJSON(e)),c.uuid}if(this.isScene)this.background&&(this.background.isColor?i.background=this.background.toJSON():this.background.isTexture&&(i.background=this.background.toJSON(e).uuid)),this.environment&&this.environment.isTexture&&this.environment.isRenderTargetTexture!==!0&&(i.environment=this.environment.toJSON(e).uuid);else if(this.isMesh||this.isLine||this.isPoints){i.geometry=s(e.geometries,this.geometry);let h=this.geometry.parameters;if(h!==void 0&&h.shapes!==void 0){let c=h.shapes;if(Array.isArray(c))for(let o=0,a=c.length;o<a;o++){let l=c[o];s(e.shapes,l)}else s(e.shapes,c)}}if(this.isSkinnedMesh&&(i.bindMode=this.bindMode,i.bindMatrix=this.bindMatrix.toArray(),this.skeleton!==void 0&&(s(e.skeletons,this.skeleton),i.skeleton=this.skeleton.uuid)),this.material!==void 0)if(Array.isArray(this.material)){let h=[];for(let c=0,o=this.material.length;c<o;c++)h.push(s(e.materials,this.material[c]));i.material=h}else i.material=s(e.materials,this.material);if(this.children.length>0){i.children=[];for(let h=0;h<this.children.length;h++)i.children.push(this.children[h].toJSON(e).object)}if(this.animations.length>0){i.animations=[];for(let h=0;h<this.animations.length;h++){let c=this.animations[h];i.animations.push(s(e.animations,c))}}if(t){let h=r(e.geometries),c=r(e.materials),o=r(e.textures),a=r(e.images),l=r(e.shapes),u=r(e.skeletons),f=r(e.animations),d=r(e.nodes);h.length>0&&(n.geometries=h),c.length>0&&(n.materials=c),o.length>0&&(n.textures=o),a.length>0&&(n.images=a),l.length>0&&(n.shapes=l),u.length>0&&(n.skeletons=u),f.length>0&&(n.animations=f),d.length>0&&(n.nodes=d)}return n.object=i,n;function r(h){let c=[];for(let o in h){let a=h[o];delete a.metadata,c.push(a)}return c}}clone(e){return new this.constructor().copy(this,e)}copy(e,t=!0){if(this.name=e.name,this.up.copy(e.up),this.position.copy(e.position),this.rotation.order=e.rotation.order,this.quaternion.copy(e.quaternion),this.scale.copy(e.scale),this.matrix.copy(e.matrix),this.matrixWorld.copy(e.matrixWorld),this.matrixAutoUpdate=e.matrixAutoUpdate,this.matrixWorldAutoUpdate=e.matrixWorldAutoUpdate,this.matrixWorldNeedsUpdate=e.matrixWorldNeedsUpdate,this.layers.mask=e.layers.mask,this.visible=e.visible,this.castShadow=e.castShadow,this.receiveShadow=e.receiveShadow,this.frustumCulled=e.frustumCulled,this.renderOrder=e.renderOrder,this.animations=e.animations.slice(),this.userData=JSON.parse(JSON.stringify(e.userData)),t===!0)for(let n=0;n<e.children.length;n++){let i=e.children[n];this.add(i.clone())}return this}};ze.DEFAULT_UP=new y(0,1,0);ze.DEFAULT_MATRIX_AUTO_UPDATE=!0;ze.DEFAULT_MATRIX_WORLD_AUTO_UPDATE=!0;var Me=new y,Pe=new y,xn=new y,Ie=new y,ot=new y,lt=new y,Fi=new y,yn=new y,Mn=new y,bn=new y,Sn=new Et,wn=new Et,En=new Et,Ye=class _{constructor(e=new y,t=new y,n=new y){this.a=e,this.b=t,this.c=n}static getNormal(e,t,n,i){i.subVectors(n,t),Me.subVectors(e,t),i.cross(Me);let s=i.lengthSq();return s>0?i.multiplyScalar(1/Math.sqrt(s)):i.set(0,0,0)}static getBarycoord(e,t,n,i,s){Me.subVectors(i,t),Pe.subVectors(n,t),xn.subVectors(e,t);let r=Me.dot(Me),h=Me.dot(Pe),c=Me.dot(xn),o=Pe.dot(Pe),a=Pe.dot(xn),l=r*o-h*h;if(l===0)return s.set(0,0,0),null;let u=1/l,f=(o*c-h*a)*u,d=(r*a-h*c)*u;return s.set(1-f-d,d,f)}static containsPoint(e,t,n,i){return this.getBarycoord(e,t,n,i,Ie)===null?!1:Ie.x>=0&&Ie.y>=0&&Ie.x+Ie.y<=1}static getInterpolation(e,t,n,i,s,r,h,c){return this.getBarycoord(e,t,n,i,Ie)===null?(c.x=0,c.y=0,"z"in c&&(c.z=0),"w"in c&&(c.w=0),null):(c.setScalar(0),c.addScaledVector(s,Ie.x),c.addScaledVector(r,Ie.y),c.addScaledVector(h,Ie.z),c)}static getInterpolatedAttribute(e,t,n,i,s,r){return Sn.setScalar(0),wn.setScalar(0),En.setScalar(0),Sn.fromBufferAttribute(e,t),wn.fromBufferAttribute(e,n),En.fromBufferAttribute(e,i),r.setScalar(0),r.addScaledVector(Sn,s.x),r.addScaledVector(wn,s.y),r.addScaledVector(En,s.z),r}static isFrontFacing(e,t,n,i){return Me.subVectors(n,t),Pe.subVectors(e,t),Me.cross(Pe).dot(i)<0}set(e,t,n){return this.a.copy(e),this.b.copy(t),this.c.copy(n),this}setFromPointsAndIndices(e,t,n,i){return this.a.copy(e[t]),this.b.copy(e[n]),this.c.copy(e[i]),this}setFromAttributeAndIndices(e,t,n,i){return this.a.fromBufferAttribute(e,t),this.b.fromBufferAttribute(e,n),this.c.fromBufferAttribute(e,i),this}clone(){return new this.constructor().copy(this)}copy(e){return this.a.copy(e.a),this.b.copy(e.b),this.c.copy(e.c),this}getArea(){return Me.subVectors(this.c,this.b),Pe.subVectors(this.a,this.b),Me.cross(Pe).length()*.5}getMidpoint(e){return e.addVectors(this.a,this.b).add(this.c).multiplyScalar(1/3)}getNormal(e){return _.getNormal(this.a,this.b,this.c,e)}getPlane(e){return e.setFromCoplanarPoints(this.a,this.b,this.c)}getBarycoord(e,t){return _.getBarycoord(e,this.a,this.b,this.c,t)}getInterpolation(e,t,n,i,s){return _.getInterpolation(e,this.a,this.b,this.c,t,n,i,s)}containsPoint(e){return _.containsPoint(e,this.a,this.b,this.c)}isFrontFacing(e){return _.isFrontFacing(this.a,this.b,this.c,e)}intersectsBox(e){return e.intersectsTriangle(this)}closestPointToPoint(e,t){let n=this.a,i=this.b,s=this.c,r,h;ot.subVectors(i,n),lt.subVectors(s,n),yn.subVectors(e,n);let c=ot.dot(yn),o=lt.dot(yn);if(c<=0&&o<=0)return t.copy(n);Mn.subVectors(e,i);let a=ot.dot(Mn),l=lt.dot(Mn);if(a>=0&&l<=a)return t.copy(i);let u=c*l-a*o;if(u<=0&&c>=0&&a<=0)return r=c/(c-a),t.copy(n).addScaledVector(ot,r);bn.subVectors(e,s);let f=ot.dot(bn),d=lt.dot(bn);if(d>=0&&f<=d)return t.copy(s);let p=f*o-c*d;if(p<=0&&o>=0&&d<=0)return h=o/(o-d),t.copy(n).addScaledVector(lt,h);let m=a*d-f*l;if(m<=0&&l-a>=0&&f-d>=0)return Fi.subVectors(s,i),h=(l-a)/(l-a+(f-d)),t.copy(i).addScaledVector(Fi,h);let g=1/(m+p+u);return r=p*g,h=u*g,t.copy(n).addScaledVector(ot,r).addScaledVector(lt,h)}equals(e){return e.a.equals(this.a)&&e.b.equals(this.b)&&e.c.equals(this.c)}},Zi={aliceblue:15792383,antiquewhite:16444375,aqua:65535,aquamarine:8388564,azure:15794175,beige:16119260,bisque:16770244,black:0,blanchedalmond:16772045,blue:255,blueviolet:9055202,brown:10824234,burlywood:14596231,cadetblue:6266528,chartreuse:8388352,chocolate:13789470,coral:16744272,cornflowerblue:6591981,cornsilk:16775388,crimson:14423100,cyan:65535,darkblue:139,darkcyan:35723,darkgoldenrod:12092939,darkgray:11119017,darkgreen:25600,darkgrey:11119017,darkkhaki:12433259,darkmagenta:9109643,darkolivegreen:5597999,darkorange:16747520,darkorchid:10040012,darkred:9109504,darksalmon:15308410,darkseagreen:9419919,darkslateblue:4734347,darkslategray:3100495,darkslategrey:3100495,darkturquoise:52945,darkviolet:9699539,deeppink:16716947,deepskyblue:49151,dimgray:6908265,dimgrey:6908265,dodgerblue:2003199,firebrick:11674146,floralwhite:16775920,forestgreen:2263842,fuchsia:16711935,gainsboro:14474460,ghostwhite:16316671,gold:16766720,goldenrod:14329120,gray:8421504,green:32768,greenyellow:11403055,grey:8421504,honeydew:15794160,hotpink:16738740,indianred:13458524,indigo:4915330,ivory:16777200,khaki:15787660,lavender:15132410,lavenderblush:16773365,lawngreen:8190976,lemonchiffon:16775885,lightblue:11393254,lightcoral:15761536,lightcyan:14745599,lightgoldenrodyellow:16448210,lightgray:13882323,lightgreen:9498256,lightgrey:13882323,lightpink:16758465,lightsalmon:16752762,lightseagreen:2142890,lightskyblue:8900346,lightslategray:7833753,lightslategrey:7833753,lightsteelblue:11584734,lightyellow:16777184,lime:65280,limegreen:3329330,linen:16445670,magenta:16711935,maroon:8388608,mediumaquamarine:6737322,mediumblue:205,mediumorchid:12211667,mediumpurple:9662683,mediumseagreen:3978097,mediumslateblue:8087790,mediumspringgreen:64154,mediumturquoise:4772300,mediumvioletred:13047173,midnightblue:1644912,mintcream:16121850,mistyrose:16770273,moccasin:16770229,navajowhite:16768685,navy:128,oldlace:16643558,olive:8421376,olivedrab:7048739,orange:16753920,orangered:16729344,orchid:14315734,palegoldenrod:15657130,palegreen:10025880,paleturquoise:11529966,palevioletred:14381203,papayawhip:16773077,peachpuff:16767673,peru:13468991,pink:16761035,plum:14524637,powderblue:11591910,purple:8388736,rebeccapurple:6697881,red:16711680,rosybrown:12357519,royalblue:4286945,saddlebrown:9127187,salmon:16416882,sandybrown:16032864,seagreen:3050327,seashell:16774638,sienna:10506797,silver:12632256,skyblue:8900331,slateblue:6970061,slategray:7372944,slategrey:7372944,snow:16775930,springgreen:65407,steelblue:4620980,tan:13808780,teal:32896,thistle:14204888,tomato:16737095,turquoise:4251856,violet:15631086,wheat:16113331,white:16777215,whitesmoke:16119285,yellow:16776960,yellowgreen:10145074},ke={h:0,s:0,l:0},Ht={h:0,s:0,l:0};function Tn(_,e,t){return t<0&&(t+=1),t>1&&(t-=1),t<1/6?_+(e-_)*6*t:t<1/2?e:t<2/3?_+(e-_)*6*(2/3-t):_}var G=class{constructor(e,t,n){return this.isColor=!0,this.r=1,this.g=1,this.b=1,this.set(e,t,n)}set(e,t,n){if(t===void 0&&n===void 0){let i=e;i&&i.isColor?this.copy(i):typeof i=="number"?this.setHex(i):typeof i=="string"&&this.setStyle(i)}else this.setRGB(e,t,n);return this}setScalar(e){return this.r=e,this.g=e,this.b=e,this}setHex(e,t=Le){return e=Math.floor(e),this.r=(e>>16&255)/255,this.g=(e>>8&255)/255,this.b=(e&255)/255,ve.toWorkingColorSpace(this,t),this}setRGB(e,t,n,i=ve.workingColorSpace){return this.r=e,this.g=t,this.b=n,ve.toWorkingColorSpace(this,i),this}setHSL(e,t,n,i=ve.workingColorSpace){if(e=rs(e,1),t=he(t,0,1),n=he(n,0,1),t===0)this.r=this.g=this.b=n;else{let s=n<=.5?n*(1+t):n+t-n*t,r=2*n-s;this.r=Tn(r,s,e+1/3),this.g=Tn(r,s,e),this.b=Tn(r,s,e-1/3)}return ve.toWorkingColorSpace(this,i),this}setStyle(e,t=Le){function n(s){s!==void 0&&parseFloat(s)<1&&console.warn("THREE.Color: Alpha component of "+e+" will be ignored.")}let i;if(i=/^(\w+)\(([^\)]*)\)/.exec(e)){let s,r=i[1],h=i[2];switch(r){case"rgb":case"rgba":if(s=/^\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*(?:,\s*(\d*\.?\d+)\s*)?$/.exec(h))return n(s[4]),this.setRGB(Math.min(255,parseInt(s[1],10))/255,Math.min(255,parseInt(s[2],10))/255,Math.min(255,parseInt(s[3],10))/255,t);if(s=/^\s*(\d+)\%\s*,\s*(\d+)\%\s*,\s*(\d+)\%\s*(?:,\s*(\d*\.?\d+)\s*)?$/.exec(h))return n(s[4]),this.setRGB(Math.min(100,parseInt(s[1],10))/100,Math.min(100,parseInt(s[2],10))/100,Math.min(100,parseInt(s[3],10))/100,t);break;case"hsl":case"hsla":if(s=/^\s*(\d*\.?\d+)\s*,\s*(\d*\.?\d+)\%\s*,\s*(\d*\.?\d+)\%\s*(?:,\s*(\d*\.?\d+)\s*)?$/.exec(h))return n(s[4]),this.setHSL(parseFloat(s[1])/360,parseFloat(s[2])/100,parseFloat(s[3])/100,t);break;default:console.warn("THREE.Color: Unknown color model "+e)}}else if(i=/^\#([A-Fa-f\d]+)$/.exec(e)){let s=i[1],r=s.length;if(r===3)return this.setRGB(parseInt(s.charAt(0),16)/15,parseInt(s.charAt(1),16)/15,parseInt(s.charAt(2),16)/15,t);if(r===6)return this.setHex(parseInt(s,16),t);console.warn("THREE.Color: Invalid hex color "+e)}else if(e&&e.length>0)return this.setColorName(e,t);return this}setColorName(e,t=Le){let n=Zi[e.toLowerCase()];return n!==void 0?this.setHex(n,t):console.warn("THREE.Color: Unknown color "+e),this}clone(){return new this.constructor(this.r,this.g,this.b)}copy(e){return this.r=e.r,this.g=e.g,this.b=e.b,this}copySRGBToLinear(e){return this.r=ut(e.r),this.g=ut(e.g),this.b=ut(e.b),this}copyLinearToSRGB(e){return this.r=hn(e.r),this.g=hn(e.g),this.b=hn(e.b),this}convertSRGBToLinear(){return this.copySRGBToLinear(this),this}convertLinearToSRGB(){return this.copyLinearToSRGB(this),this}getHex(e=Le){return ve.fromWorkingColorSpace(ae.copy(this),e),Math.round(he(ae.r*255,0,255))*65536+Math.round(he(ae.g*255,0,255))*256+Math.round(he(ae.b*255,0,255))}getHexString(e=Le){return("000000"+this.getHex(e).toString(16)).slice(-6)}getHSL(e,t=ve.workingColorSpace){ve.fromWorkingColorSpace(ae.copy(this),t);let n=ae.r,i=ae.g,s=ae.b,r=Math.max(n,i,s),h=Math.min(n,i,s),c,o,a=(h+r)/2;if(h===r)c=0,o=0;else{let l=r-h;switch(o=a<=.5?l/(r+h):l/(2-r-h),r){case n:c=(i-s)/l+(i<s?6:0);break;case i:c=(s-n)/l+2;break;case s:c=(n-i)/l+4;break}c/=6}return e.h=c,e.s=o,e.l=a,e}getRGB(e,t=ve.workingColorSpace){return ve.fromWorkingColorSpace(ae.copy(this),t),e.r=ae.r,e.g=ae.g,e.b=ae.b,e}getStyle(e=Le){ve.fromWorkingColorSpace(ae.copy(this),e);let t=ae.r,n=ae.g,i=ae.b;return e!==Le?`color(${e} ${t.toFixed(3)} ${n.toFixed(3)} ${i.toFixed(3)})`:`rgb(${Math.round(t*255)},${Math.round(n*255)},${Math.round(i*255)})`}offsetHSL(e,t,n){return this.getHSL(ke),this.setHSL(ke.h+e,ke.s+t,ke.l+n)}add(e){return this.r+=e.r,this.g+=e.g,this.b+=e.b,this}addColors(e,t){return this.r=e.r+t.r,this.g=e.g+t.g,this.b=e.b+t.b,this}addScalar(e){return this.r+=e,this.g+=e,this.b+=e,this}sub(e){return this.r=Math.max(0,this.r-e.r),this.g=Math.max(0,this.g-e.g),this.b=Math.max(0,this.b-e.b),this}multiply(e){return this.r*=e.r,this.g*=e.g,this.b*=e.b,this}multiplyScalar(e){return this.r*=e,this.g*=e,this.b*=e,this}lerp(e,t){return this.r+=(e.r-this.r)*t,this.g+=(e.g-this.g)*t,this.b+=(e.b-this.b)*t,this}lerpColors(e,t,n){return this.r=e.r+(t.r-e.r)*n,this.g=e.g+(t.g-e.g)*n,this.b=e.b+(t.b-e.b)*n,this}lerpHSL(e,t){this.getHSL(ke),e.getHSL(Ht);let n=ln(ke.h,Ht.h,t),i=ln(ke.s,Ht.s,t),s=ln(ke.l,Ht.l,t);return this.setHSL(n,i,s),this}setFromVector3(e){return this.r=e.x,this.g=e.y,this.b=e.z,this}applyMatrix3(e){let t=this.r,n=this.g,i=this.b,s=e.elements;return this.r=s[0]*t+s[3]*n+s[6]*i,this.g=s[1]*t+s[4]*n+s[7]*i,this.b=s[2]*t+s[5]*n+s[8]*i,this}equals(e){return e.r===this.r&&e.g===this.g&&e.b===this.b}fromArray(e,t=0){return this.r=e[t],this.g=e[t+1],this.b=e[t+2],this}toArray(e=[],t=0){return e[t]=this.r,e[t+1]=this.g,e[t+2]=this.b,e}fromBufferAttribute(e,t){return this.r=e.getX(t),this.g=e.getY(t),this.b=e.getZ(t),this}toJSON(){return this.getHex()}*[Symbol.iterator](){yield this.r,yield this.g,yield this.b}},ae=new G;G.NAMES=Zi;var _s=0,Fn=class extends ft{constructor(){super(),this.isMaterial=!0,Object.defineProperty(this,"id",{value:_s++}),this.uuid=Ct(),this.name="",this.type="Material",this.blending=si,this.side=jt,this.vertexColors=!1,this.opacity=1,this.transparent=!1,this.alphaHash=!1,this.blendSrc=ai,this.blendDst=oi,this.blendEquation=ri,this.blendSrcAlpha=null,this.blendDstAlpha=null,this.blendEquationAlpha=null,this.blendColor=new G(0,0,0),this.blendAlpha=0,this.depthFunc=Qt,this.depthTest=!0,this.depthWrite=!0,this.stencilWriteMask=255,this.stencilFunc=bi,this.stencilRef=0,this.stencilFuncMask=255,this.stencilFail=Qe,this.stencilZFail=Qe,this.stencilZPass=Qe,this.stencilWrite=!1,this.clippingPlanes=null,this.clipIntersection=!1,this.clipShadows=!1,this.shadowSide=null,this.colorWrite=!0,this.precision=null,this.polygonOffset=!1,this.polygonOffsetFactor=0,this.polygonOffsetUnits=0,this.dithering=!1,this.alphaToCoverage=!1,this.premultipliedAlpha=!1,this.forceSinglePass=!1,this.visible=!0,this.toneMapped=!0,this.userData={},this.version=0,this._alphaTest=0}get alphaTest(){return this._alphaTest}set alphaTest(e){this._alphaTest>0!=e>0&&this.version++,this._alphaTest=e}onBeforeRender(){}onBeforeCompile(){}customProgramCacheKey(){return this.onBeforeCompile.toString()}setValues(e){if(e!==void 0)for(let t in e){let n=e[t];if(n===void 0){console.warn(`THREE.Material: parameter '${t}' has value of undefined.`);continue}let i=this[t];if(i===void 0){console.warn(`THREE.Material: '${t}' is not a property of THREE.${this.type}.`);continue}i&&i.isColor?i.set(n):i&&i.isVector3&&n&&n.isVector3?i.copy(n):this[t]=n}}toJSON(e){let t=e===void 0||typeof e=="string";t&&(e={textures:{},images:{}});let n={metadata:{version:4.6,type:"Material",generator:"Material.toJSON"}};n.uuid=this.uuid,n.type=this.type,this.name!==""&&(n.name=this.name),this.color&&this.color.isColor&&(n.color=this.color.getHex()),this.roughness!==void 0&&(n.roughness=this.roughness),this.metalness!==void 0&&(n.metalness=this.metalness),this.sheen!==void 0&&(n.sheen=this.sheen),this.sheenColor&&this.sheenColor.isColor&&(n.sheenColor=this.sheenColor.getHex()),this.sheenRoughness!==void 0&&(n.sheenRoughness=this.sheenRoughness),this.emissive&&this.emissive.isColor&&(n.emissive=this.emissive.getHex()),this.emissiveIntensity!==void 0&&this.emissiveIntensity!==1&&(n.emissiveIntensity=this.emissiveIntensity),this.specular&&this.specular.isColor&&(n.specular=this.specular.getHex()),this.specularIntensity!==void 0&&(n.specularIntensity=this.specularIntensity),this.specularColor&&this.specularColor.isColor&&(n.specularColor=this.specularColor.getHex()),this.shininess!==void 0&&(n.shininess=this.shininess),this.clearcoat!==void 0&&(n.clearcoat=this.clearcoat),this.clearcoatRoughness!==void 0&&(n.clearcoatRoughness=this.clearcoatRoughness),this.clearcoatMap&&this.clearcoatMap.isTexture&&(n.clearcoatMap=this.clearcoatMap.toJSON(e).uuid),this.clearcoatRoughnessMap&&this.clearcoatRoughnessMap.isTexture&&(n.clearcoatRoughnessMap=this.clearcoatRoughnessMap.toJSON(e).uuid),this.clearcoatNormalMap&&this.clearcoatNormalMap.isTexture&&(n.clearcoatNormalMap=this.clearcoatNormalMap.toJSON(e).uuid,n.clearcoatNormalScale=this.clearcoatNormalScale.toArray()),this.dispersion!==void 0&&(n.dispersion=this.dispersion),this.iridescence!==void 0&&(n.iridescence=this.iridescence),this.iridescenceIOR!==void 0&&(n.iridescenceIOR=this.iridescenceIOR),this.iridescenceThicknessRange!==void 0&&(n.iridescenceThicknessRange=this.iridescenceThicknessRange),this.iridescenceMap&&this.iridescenceMap.isTexture&&(n.iridescenceMap=this.iridescenceMap.toJSON(e).uuid),this.iridescenceThicknessMap&&this.iridescenceThicknessMap.isTexture&&(n.iridescenceThicknessMap=this.iridescenceThicknessMap.toJSON(e).uuid),this.anisotropy!==void 0&&(n.anisotropy=this.anisotropy),this.anisotropyRotation!==void 0&&(n.anisotropyRotation=this.anisotropyRotation),this.anisotropyMap&&this.anisotropyMap.isTexture&&(n.anisotropyMap=this.anisotropyMap.toJSON(e).uuid),this.map&&this.map.isTexture&&(n.map=this.map.toJSON(e).uuid),this.matcap&&this.matcap.isTexture&&(n.matcap=this.matcap.toJSON(e).uuid),this.alphaMap&&this.alphaMap.isTexture&&(n.alphaMap=this.alphaMap.toJSON(e).uuid),this.lightMap&&this.lightMap.isTexture&&(n.lightMap=this.lightMap.toJSON(e).uuid,n.lightMapIntensity=this.lightMapIntensity),this.aoMap&&this.aoMap.isTexture&&(n.aoMap=this.aoMap.toJSON(e).uuid,n.aoMapIntensity=this.aoMapIntensity),this.bumpMap&&this.bumpMap.isTexture&&(n.bumpMap=this.bumpMap.toJSON(e).uuid,n.bumpScale=this.bumpScale),this.normalMap&&this.normalMap.isTexture&&(n.normalMap=this.normalMap.toJSON(e).uuid,n.normalMapType=this.normalMapType,n.normalScale=this.normalScale.toArray()),this.displacementMap&&this.displacementMap.isTexture&&(n.displacementMap=this.displacementMap.toJSON(e).uuid,n.displacementScale=this.displacementScale,n.displacementBias=this.displacementBias),this.roughnessMap&&this.roughnessMap.isTexture&&(n.roughnessMap=this.roughnessMap.toJSON(e).uuid),this.metalnessMap&&this.metalnessMap.isTexture&&(n.metalnessMap=this.metalnessMap.toJSON(e).uuid),this.emissiveMap&&this.emissiveMap.isTexture&&(n.emissiveMap=this.emissiveMap.toJSON(e).uuid),this.specularMap&&this.specularMap.isTexture&&(n.specularMap=this.specularMap.toJSON(e).uuid),this.specularIntensityMap&&this.specularIntensityMap.isTexture&&(n.specularIntensityMap=this.specularIntensityMap.toJSON(e).uuid),this.specularColorMap&&this.specularColorMap.isTexture&&(n.specularColorMap=this.specularColorMap.toJSON(e).uuid),this.envMap&&this.envMap.isTexture&&(n.envMap=this.envMap.toJSON(e).uuid,this.combine!==void 0&&(n.combine=this.combine)),this.envMapRotation!==void 0&&(n.envMapRotation=this.envMapRotation.toArray()),this.envMapIntensity!==void 0&&(n.envMapIntensity=this.envMapIntensity),this.reflectivity!==void 0&&(n.reflectivity=this.reflectivity),this.refractionRatio!==void 0&&(n.refractionRatio=this.refractionRatio),this.gradientMap&&this.gradientMap.isTexture&&(n.gradientMap=this.gradientMap.toJSON(e).uuid),this.transmission!==void 0&&(n.transmission=this.transmission),this.transmissionMap&&this.transmissionMap.isTexture&&(n.transmissionMap=this.transmissionMap.toJSON(e).uuid),this.thickness!==void 0&&(n.thickness=this.thickness),this.thicknessMap&&this.thicknessMap.isTexture&&(n.thicknessMap=this.thicknessMap.toJSON(e).uuid),this.attenuationDistance!==void 0&&this.attenuationDistance!==1/0&&(n.attenuationDistance=this.attenuationDistance),this.attenuationColor!==void 0&&(n.attenuationColor=this.attenuationColor.getHex()),this.size!==void 0&&(n.size=this.size),this.shadowSide!==null&&(n.shadowSide=this.shadowSide),this.sizeAttenuation!==void 0&&(n.sizeAttenuation=this.sizeAttenuation),this.blending!==si&&(n.blending=this.blending),this.side!==jt&&(n.side=this.side),this.vertexColors===!0&&(n.vertexColors=!0),this.opacity<1&&(n.opacity=this.opacity),this.transparent===!0&&(n.transparent=!0),this.blendSrc!==ai&&(n.blendSrc=this.blendSrc),this.blendDst!==oi&&(n.blendDst=this.blendDst),this.blendEquation!==ri&&(n.blendEquation=this.blendEquation),this.blendSrcAlpha!==null&&(n.blendSrcAlpha=this.blendSrcAlpha),this.blendDstAlpha!==null&&(n.blendDstAlpha=this.blendDstAlpha),this.blendEquationAlpha!==null&&(n.blendEquationAlpha=this.blendEquationAlpha),this.blendColor&&this.blendColor.isColor&&(n.blendColor=this.blendColor.getHex()),this.blendAlpha!==0&&(n.blendAlpha=this.blendAlpha),this.depthFunc!==Qt&&(n.depthFunc=this.depthFunc),this.depthTest===!1&&(n.depthTest=this.depthTest),this.depthWrite===!1&&(n.depthWrite=this.depthWrite),this.colorWrite===!1&&(n.colorWrite=this.colorWrite),this.stencilWriteMask!==255&&(n.stencilWriteMask=this.stencilWriteMask),this.stencilFunc!==bi&&(n.stencilFunc=this.stencilFunc),this.stencilRef!==0&&(n.stencilRef=this.stencilRef),this.stencilFuncMask!==255&&(n.stencilFuncMask=this.stencilFuncMask),this.stencilFail!==Qe&&(n.stencilFail=this.stencilFail),this.stencilZFail!==Qe&&(n.stencilZFail=this.stencilZFail),this.stencilZPass!==Qe&&(n.stencilZPass=this.stencilZPass),this.stencilWrite===!0&&(n.stencilWrite=this.stencilWrite),this.rotation!==void 0&&this.rotation!==0&&(n.rotation=this.rotation),this.polygonOffset===!0&&(n.polygonOffset=!0),this.polygonOffsetFactor!==0&&(n.polygonOffsetFactor=this.polygonOffsetFactor),this.polygonOffsetUnits!==0&&(n.polygonOffsetUnits=this.polygonOffsetUnits),this.linewidth!==void 0&&this.linewidth!==1&&(n.linewidth=this.linewidth),this.dashSize!==void 0&&(n.dashSize=this.dashSize),this.gapSize!==void 0&&(n.gapSize=this.gapSize),this.scale!==void 0&&(n.scale=this.scale),this.dithering===!0&&(n.dithering=!0),this.alphaTest>0&&(n.alphaTest=this.alphaTest),this.alphaHash===!0&&(n.alphaHash=!0),this.alphaToCoverage===!0&&(n.alphaToCoverage=!0),this.premultipliedAlpha===!0&&(n.premultipliedAlpha=!0),this.forceSinglePass===!0&&(n.forceSinglePass=!0),this.wireframe===!0&&(n.wireframe=!0),this.wireframeLinewidth>1&&(n.wireframeLinewidth=this.wireframeLinewidth),this.wireframeLinecap!=="round"&&(n.wireframeLinecap=this.wireframeLinecap),this.wireframeLinejoin!=="round"&&(n.wireframeLinejoin=this.wireframeLinejoin),this.flatShading===!0&&(n.flatShading=!0),this.visible===!1&&(n.visible=!1),this.toneMapped===!1&&(n.toneMapped=!1),this.fog===!1&&(n.fog=!1),Object.keys(this.userData).length>0&&(n.userData=this.userData);function i(s){let r=[];for(let h in s){let c=s[h];delete c.metadata,r.push(c)}return r}if(t){let s=i(e.textures),r=i(e.images);s.length>0&&(n.textures=s),r.length>0&&(n.images=r)}return n}clone(){return new this.constructor().copy(this)}copy(e){this.name=e.name,this.blending=e.blending,this.side=e.side,this.vertexColors=e.vertexColors,this.opacity=e.opacity,this.transparent=e.transparent,this.blendSrc=e.blendSrc,this.blendDst=e.blendDst,this.blendEquation=e.blendEquation,this.blendSrcAlpha=e.blendSrcAlpha,this.blendDstAlpha=e.blendDstAlpha,this.blendEquationAlpha=e.blendEquationAlpha,this.blendColor.copy(e.blendColor),this.blendAlpha=e.blendAlpha,this.depthFunc=e.depthFunc,this.depthTest=e.depthTest,this.depthWrite=e.depthWrite,this.stencilWriteMask=e.stencilWriteMask,this.stencilFunc=e.stencilFunc,this.stencilRef=e.stencilRef,this.stencilFuncMask=e.stencilFuncMask,this.stencilFail=e.stencilFail,this.stencilZFail=e.stencilZFail,this.stencilZPass=e.stencilZPass,this.stencilWrite=e.stencilWrite;let t=e.clippingPlanes,n=null;if(t!==null){let i=t.length;n=new Array(i);for(let s=0;s!==i;++s)n[s]=t[s].clone()}return this.clippingPlanes=n,this.clipIntersection=e.clipIntersection,this.clipShadows=e.clipShadows,this.shadowSide=e.shadowSide,this.colorWrite=e.colorWrite,this.precision=e.precision,this.polygonOffset=e.polygonOffset,this.polygonOffsetFactor=e.polygonOffsetFactor,this.polygonOffsetUnits=e.polygonOffsetUnits,this.dithering=e.dithering,this.alphaTest=e.alphaTest,this.alphaHash=e.alphaHash,this.alphaToCoverage=e.alphaToCoverage,this.premultipliedAlpha=e.premultipliedAlpha,this.forceSinglePass=e.forceSinglePass,this.visible=e.visible,this.toneMapped=e.toneMapped,this.userData=JSON.parse(JSON.stringify(e.userData)),this}dispose(){this.dispatchEvent({type:"dispose"})}set needsUpdate(e){e===!0&&this.version++}onBuild(){console.warn("Material: onBuild() has been removed.")}},On=class extends Fn{constructor(e){super(),this.isMeshBasicMaterial=!0,this.type="MeshBasicMaterial",this.color=new G(16777215),this.map=null,this.lightMap=null,this.lightMapIntensity=1,this.aoMap=null,this.aoMapIntensity=1,this.specularMap=null,this.alphaMap=null,this.envMap=null,this.envMapRotation=new Tt,this.combine=ts,this.reflectivity=1,this.refractionRatio=.98,this.wireframe=!1,this.wireframeLinewidth=1,this.wireframeLinecap="round",this.wireframeLinejoin="round",this.fog=!0,this.setValues(e)}copy(e){return super.copy(e),this.color.copy(e.color),this.map=e.map,this.lightMap=e.lightMap,this.lightMapIntensity=e.lightMapIntensity,this.aoMap=e.aoMap,this.aoMapIntensity=e.aoMapIntensity,this.specularMap=e.specularMap,this.alphaMap=e.alphaMap,this.envMap=e.envMap,this.envMapRotation.copy(e.envMapRotation),this.combine=e.combine,this.reflectivity=e.reflectivity,this.refractionRatio=e.refractionRatio,this.wireframe=e.wireframe,this.wireframeLinewidth=e.wireframeLinewidth,this.wireframeLinecap=e.wireframeLinecap,this.wireframeLinejoin=e.wireframeLinejoin,this.fog=e.fog,this}};var Q=new y,Gt=new ee,oe=class{constructor(e,t,n=!1){if(Array.isArray(e))throw new TypeError("THREE.BufferAttribute: array should be a Typed Array.");this.isBufferAttribute=!0,this.name="",this.array=e,this.itemSize=t,this.count=e!==void 0?e.length/t:0,this.normalized=n,this.usage=Si,this.updateRanges=[],this.gpuType=is,this.version=0}onUploadCallback(){}set needsUpdate(e){e===!0&&this.version++}setUsage(e){return this.usage=e,this}addUpdateRange(e,t){this.updateRanges.push({start:e,count:t})}clearUpdateRanges(){this.updateRanges.length=0}copy(e){return this.name=e.name,this.array=new e.array.constructor(e.array),this.itemSize=e.itemSize,this.count=e.count,this.normalized=e.normalized,this.usage=e.usage,this.gpuType=e.gpuType,this}copyAt(e,t,n){e*=this.itemSize,n*=t.itemSize;for(let i=0,s=this.itemSize;i<s;i++)this.array[e+i]=t.array[n+i];return this}copyArray(e){return this.array.set(e),this}applyMatrix3(e){if(this.itemSize===2)for(let t=0,n=this.count;t<n;t++)Gt.fromBufferAttribute(this,t),Gt.applyMatrix3(e),this.setXY(t,Gt.x,Gt.y);else if(this.itemSize===3)for(let t=0,n=this.count;t<n;t++)Q.fromBufferAttribute(this,t),Q.applyMatrix3(e),this.setXYZ(t,Q.x,Q.y,Q.z);return this}applyMatrix4(e){for(let t=0,n=this.count;t<n;t++)Q.fromBufferAttribute(this,t),Q.applyMatrix4(e),this.setXYZ(t,Q.x,Q.y,Q.z);return this}applyNormalMatrix(e){for(let t=0,n=this.count;t<n;t++)Q.fromBufferAttribute(this,t),Q.applyNormalMatrix(e),this.setXYZ(t,Q.x,Q.y,Q.z);return this}transformDirection(e){for(let t=0,n=this.count;t<n;t++)Q.fromBufferAttribute(this,t),Q.transformDirection(e),this.setXYZ(t,Q.x,Q.y,Q.z);return this}set(e,t=0){return this.array.set(e,t),this}getComponent(e,t){let n=this.array[e*this.itemSize+t];return this.normalized&&(n=vt(n,this.array)),n}setComponent(e,t,n){return this.normalized&&(n=le(n,this.array)),this.array[e*this.itemSize+t]=n,this}getX(e){let t=this.array[e*this.itemSize];return this.normalized&&(t=vt(t,this.array)),t}setX(e,t){return this.normalized&&(t=le(t,this.array)),this.array[e*this.itemSize]=t,this}getY(e){let t=this.array[e*this.itemSize+1];return this.normalized&&(t=vt(t,this.array)),t}setY(e,t){return this.normalized&&(t=le(t,this.array)),this.array[e*this.itemSize+1]=t,this}getZ(e){let t=this.array[e*this.itemSize+2];return this.normalized&&(t=vt(t,this.array)),t}setZ(e,t){return this.normalized&&(t=le(t,this.array)),this.array[e*this.itemSize+2]=t,this}getW(e){let t=this.array[e*this.itemSize+3];return this.normalized&&(t=vt(t,this.array)),t}setW(e,t){return this.normalized&&(t=le(t,this.array)),this.array[e*this.itemSize+3]=t,this}setXY(e,t,n){return e*=this.itemSize,this.normalized&&(t=le(t,this.array),n=le(n,this.array)),this.array[e+0]=t,this.array[e+1]=n,this}setXYZ(e,t,n,i){return e*=this.itemSize,this.normalized&&(t=le(t,this.array),n=le(n,this.array),i=le(i,this.array)),this.array[e+0]=t,this.array[e+1]=n,this.array[e+2]=i,this}setXYZW(e,t,n,i,s){return e*=this.itemSize,this.normalized&&(t=le(t,this.array),n=le(n,this.array),i=le(i,this.array),s=le(s,this.array)),this.array[e+0]=t,this.array[e+1]=n,this.array[e+2]=i,this.array[e+3]=s,this}onUpload(e){return this.onUploadCallback=e,this}clone(){return new this.constructor(this.array,this.itemSize).copy(this)}toJSON(){let e={itemSize:this.itemSize,type:this.array.constructor.name,array:Array.from(this.array),normalized:this.normalized};return this.name!==""&&(e.name=this.name),this.usage!==Si&&(e.usage=this.usage),e}};var kn=class extends oe{constructor(e,t,n){super(new Uint16Array(e),t,n)}};var Bn=class extends oe{constructor(e,t,n){super(new Uint32Array(e),t,n)}};var zn=class extends oe{constructor(e,t,n){super(new Float32Array(e),t,n)}},vs=0,me=new we,An=new ze,ct=new y,pe=new Ze,St=new Ze,ne=new y,At=class _ extends ft{constructor(){super(),this.isBufferGeometry=!0,Object.defineProperty(this,"id",{value:vs++}),this.uuid=Ct(),this.name="",this.type="BufferGeometry",this.index=null,this.attributes={},this.morphAttributes={},this.morphTargetsRelative=!1,this.groups=[],this.boundingBox=null,this.boundingSphere=null,this.drawRange={start:0,count:1/0},this.userData={}}getIndex(){return this.index}setIndex(e){return Array.isArray(e)?this.index=new(as(e)?Bn:kn)(e,1):this.index=e,this}getAttribute(e){return this.attributes[e]}setAttribute(e,t){return this.attributes[e]=t,this}deleteAttribute(e){return delete this.attributes[e],this}hasAttribute(e){return this.attributes[e]!==void 0}addGroup(e,t,n=0){this.groups.push({start:e,count:t,materialIndex:n})}clearGroups(){this.groups=[]}setDrawRange(e,t){this.drawRange.start=e,this.drawRange.count=t}applyMatrix4(e){let t=this.attributes.position;t!==void 0&&(t.applyMatrix4(e),t.needsUpdate=!0);let n=this.attributes.normal;if(n!==void 0){let s=new B().getNormalMatrix(e);n.applyNormalMatrix(s),n.needsUpdate=!0}let i=this.attributes.tangent;return i!==void 0&&(i.transformDirection(e),i.needsUpdate=!0),this.boundingBox!==null&&this.computeBoundingBox(),this.boundingSphere!==null&&this.computeBoundingSphere(),this}applyQuaternion(e){return me.makeRotationFromQuaternion(e),this.applyMatrix4(me),this}rotateX(e){return me.makeRotationX(e),this.applyMatrix4(me),this}rotateY(e){return me.makeRotationY(e),this.applyMatrix4(me),this}rotateZ(e){return me.makeRotationZ(e),this.applyMatrix4(me),this}translate(e,t,n){return me.makeTranslation(e,t,n),this.applyMatrix4(me),this}scale(e,t,n){return me.makeScale(e,t,n),this.applyMatrix4(me),this}lookAt(e){return An.lookAt(e),An.updateMatrix(),this.applyMatrix4(An.matrix),this}center(){return this.computeBoundingBox(),this.boundingBox.getCenter(ct).negate(),this.translate(ct.x,ct.y,ct.z),this}setFromPoints(e){let t=[];for(let n=0,i=e.length;n<i;n++){let s=e[n];t.push(s.x,s.y,s.z||0)}return this.setAttribute("position",new zn(t,3)),this}computeBoundingBox(){this.boundingBox===null&&(this.boundingBox=new Ze);let e=this.attributes.position,t=this.morphAttributes.position;if(e&&e.isGLBufferAttribute){console.error("THREE.BufferGeometry.computeBoundingBox(): GLBufferAttribute requires a manual bounding box.",this),this.boundingBox.set(new y(-1/0,-1/0,-1/0),new y(1/0,1/0,1/0));return}if(e!==void 0){if(this.boundingBox.setFromBufferAttribute(e),t)for(let n=0,i=t.length;n<i;n++){let s=t[n];pe.setFromBufferAttribute(s),this.morphTargetsRelative?(ne.addVectors(this.boundingBox.min,pe.min),this.boundingBox.expandByPoint(ne),ne.addVectors(this.boundingBox.max,pe.max),this.boundingBox.expandByPoint(ne)):(this.boundingBox.expandByPoint(pe.min),this.boundingBox.expandByPoint(pe.max))}}else this.boundingBox.makeEmpty();(isNaN(this.boundingBox.min.x)||isNaN(this.boundingBox.min.y)||isNaN(this.boundingBox.min.z))&&console.error('THREE.BufferGeometry.computeBoundingBox(): Computed min/max have NaN values. The "position" attribute is likely to have NaN values.',this)}computeBoundingSphere(){this.boundingSphere===null&&(this.boundingSphere=new dt);let e=this.attributes.position,t=this.morphAttributes.position;if(e&&e.isGLBufferAttribute){console.error("THREE.BufferGeometry.computeBoundingSphere(): GLBufferAttribute requires a manual bounding sphere.",this),this.boundingSphere.set(new y,1/0);return}if(e){let n=this.boundingSphere.center;if(pe.setFromBufferAttribute(e),t)for(let s=0,r=t.length;s<r;s++){let h=t[s];St.setFromBufferAttribute(h),this.morphTargetsRelative?(ne.addVectors(pe.min,St.min),pe.expandByPoint(ne),ne.addVectors(pe.max,St.max),pe.expandByPoint(ne)):(pe.expandByPoint(St.min),pe.expandByPoint(St.max))}pe.getCenter(n);let i=0;for(let s=0,r=e.count;s<r;s++)ne.fromBufferAttribute(e,s),i=Math.max(i,n.distanceToSquared(ne));if(t)for(let s=0,r=t.length;s<r;s++){let h=t[s],c=this.morphTargetsRelative;for(let o=0,a=h.count;o<a;o++)ne.fromBufferAttribute(h,o),c&&(ct.fromBufferAttribute(e,o),ne.add(ct)),i=Math.max(i,n.distanceToSquared(ne))}this.boundingSphere.radius=Math.sqrt(i),isNaN(this.boundingSphere.radius)&&console.error('THREE.BufferGeometry.computeBoundingSphere(): Computed radius is NaN. The "position" attribute is likely to have NaN values.',this)}}computeTangents(){let e=this.index,t=this.attributes;if(e===null||t.position===void 0||t.normal===void 0||t.uv===void 0){console.error("THREE.BufferGeometry: .computeTangents() failed. Missing required attributes (index, position, normal or uv)");return}let n=t.position,i=t.normal,s=t.uv;this.hasAttribute("tangent")===!1&&this.setAttribute("tangent",new oe(new Float32Array(4*n.count),4));let r=this.getAttribute("tangent"),h=[],c=[];for(let P=0;P<n.count;P++)h[P]=new y,c[P]=new y;let o=new y,a=new y,l=new y,u=new ee,f=new ee,d=new ee,p=new y,m=new y;function g(P,C,W){o.fromBufferAttribute(n,P),a.fromBufferAttribute(n,C),l.fromBufferAttribute(n,W),u.fromBufferAttribute(s,P),f.fromBufferAttribute(s,C),d.fromBufferAttribute(s,W),a.sub(o),l.sub(o),f.sub(u),d.sub(u);let z=1/(f.x*d.y-d.x*f.y);isFinite(z)&&(p.copy(a).multiplyScalar(d.y).addScaledVector(l,-f.y).multiplyScalar(z),m.copy(l).multiplyScalar(f.x).addScaledVector(a,-d.x).multiplyScalar(z),h[P].add(p),h[C].add(p),h[W].add(p),c[P].add(m),c[C].add(m),c[W].add(m))}let v=this.groups;v.length===0&&(v=[{start:0,count:e.count}]);for(let P=0,C=v.length;P<C;++P){let W=v[P],z=W.start,te=W.count;for(let Z=z,fe=z+te;Z<fe;Z+=3)g(e.getX(Z+0),e.getX(Z+1),e.getX(Z+2))}let x=new y,M=new y,b=new y,T=new y;function E(P){b.fromBufferAttribute(i,P),T.copy(b);let C=h[P];x.copy(C),x.sub(b.multiplyScalar(b.dot(C))).normalize(),M.crossVectors(T,C);let z=M.dot(c[P])<0?-1:1;r.setXYZW(P,x.x,x.y,x.z,z)}for(let P=0,C=v.length;P<C;++P){let W=v[P],z=W.start,te=W.count;for(let Z=z,fe=z+te;Z<fe;Z+=3)E(e.getX(Z+0)),E(e.getX(Z+1)),E(e.getX(Z+2))}}computeVertexNormals(){let e=this.index,t=this.getAttribute("position");if(t!==void 0){let n=this.getAttribute("normal");if(n===void 0)n=new oe(new Float32Array(t.count*3),3),this.setAttribute("normal",n);else for(let u=0,f=n.count;u<f;u++)n.setXYZ(u,0,0,0);let i=new y,s=new y,r=new y,h=new y,c=new y,o=new y,a=new y,l=new y;if(e)for(let u=0,f=e.count;u<f;u+=3){let d=e.getX(u+0),p=e.getX(u+1),m=e.getX(u+2);i.fromBufferAttribute(t,d),s.fromBufferAttribute(t,p),r.fromBufferAttribute(t,m),a.subVectors(r,s),l.subVectors(i,s),a.cross(l),h.fromBufferAttribute(n,d),c.fromBufferAttribute(n,p),o.fromBufferAttribute(n,m),h.add(a),c.add(a),o.add(a),n.setXYZ(d,h.x,h.y,h.z),n.setXYZ(p,c.x,c.y,c.z),n.setXYZ(m,o.x,o.y,o.z)}else for(let u=0,f=t.count;u<f;u+=3)i.fromBufferAttribute(t,u+0),s.fromBufferAttribute(t,u+1),r.fromBufferAttribute(t,u+2),a.subVectors(r,s),l.subVectors(i,s),a.cross(l),n.setXYZ(u+0,a.x,a.y,a.z),n.setXYZ(u+1,a.x,a.y,a.z),n.setXYZ(u+2,a.x,a.y,a.z);this.normalizeNormals(),n.needsUpdate=!0}}normalizeNormals(){let e=this.attributes.normal;for(let t=0,n=e.count;t<n;t++)ne.fromBufferAttribute(e,t),ne.normalize(),e.setXYZ(t,ne.x,ne.y,ne.z)}toNonIndexed(){function e(h,c){let o=h.array,a=h.itemSize,l=h.normalized,u=new o.constructor(c.length*a),f=0,d=0;for(let p=0,m=c.length;p<m;p++){h.isInterleavedBufferAttribute?f=c[p]*h.data.stride+h.offset:f=c[p]*a;for(let g=0;g<a;g++)u[d++]=o[f++]}return new oe(u,a,l)}if(this.index===null)return console.warn("THREE.BufferGeometry.toNonIndexed(): BufferGeometry is already non-indexed."),this;let t=new _,n=this.index.array,i=this.attributes;for(let h in i){let c=i[h],o=e(c,n);t.setAttribute(h,o)}let s=this.morphAttributes;for(let h in s){let c=[],o=s[h];for(let a=0,l=o.length;a<l;a++){let u=o[a],f=e(u,n);c.push(f)}t.morphAttributes[h]=c}t.morphTargetsRelative=this.morphTargetsRelative;let r=this.groups;for(let h=0,c=r.length;h<c;h++){let o=r[h];t.addGroup(o.start,o.count,o.materialIndex)}return t}toJSON(){let e={metadata:{version:4.6,type:"BufferGeometry",generator:"BufferGeometry.toJSON"}};if(e.uuid=this.uuid,e.type=this.type,this.name!==""&&(e.name=this.name),Object.keys(this.userData).length>0&&(e.userData=this.userData),this.parameters!==void 0){let c=this.parameters;for(let o in c)c[o]!==void 0&&(e[o]=c[o]);return e}e.data={attributes:{}};let t=this.index;t!==null&&(e.data.index={type:t.array.constructor.name,array:Array.prototype.slice.call(t.array)});let n=this.attributes;for(let c in n){let o=n[c];e.data.attributes[c]=o.toJSON(e.data)}let i={},s=!1;for(let c in this.morphAttributes){let o=this.morphAttributes[c],a=[];for(let l=0,u=o.length;l<u;l++){let f=o[l];a.push(f.toJSON(e.data))}a.length>0&&(i[c]=a,s=!0)}s&&(e.data.morphAttributes=i,e.data.morphTargetsRelative=this.morphTargetsRelative);let r=this.groups;r.length>0&&(e.data.groups=JSON.parse(JSON.stringify(r)));let h=this.boundingSphere;return h!==null&&(e.data.boundingSphere={center:h.center.toArray(),radius:h.radius}),e}clone(){return new this.constructor().copy(this)}copy(e){this.index=null,this.attributes={},this.morphAttributes={},this.groups=[],this.boundingBox=null,this.boundingSphere=null;let t={};this.name=e.name;let n=e.index;n!==null&&this.setIndex(n.clone(t));let i=e.attributes;for(let o in i){let a=i[o];this.setAttribute(o,a.clone(t))}let s=e.morphAttributes;for(let o in s){let a=[],l=s[o];for(let u=0,f=l.length;u<f;u++)a.push(l[u].clone(t));this.morphAttributes[o]=a}this.morphTargetsRelative=e.morphTargetsRelative;let r=e.groups;for(let o=0,a=r.length;o<a;o++){let l=r[o];this.addGroup(l.start,l.count,l.materialIndex)}let h=e.boundingBox;h!==null&&(this.boundingBox=h.clone());let c=e.boundingSphere;return c!==null&&(this.boundingSphere=c.clone()),this.drawRange.start=e.drawRange.start,this.drawRange.count=e.drawRange.count,this.userData=e.userData,this}dispose(){this.dispatchEvent({type:"dispose"})}},Oi=new we,Xe=new Un,Wt=new dt,ki=new y,Xt=new y,qt=new y,Yt=new y,Rn=new y,Zt=new y,Bi=new y,$t=new y,Rt=class extends ze{constructor(e=new At,t=new On){super(),this.isMesh=!0,this.type="Mesh",this.geometry=e,this.material=t,this.updateMorphTargets()}copy(e,t){return super.copy(e,t),e.morphTargetInfluences!==void 0&&(this.morphTargetInfluences=e.morphTargetInfluences.slice()),e.morphTargetDictionary!==void 0&&(this.morphTargetDictionary=Object.assign({},e.morphTargetDictionary)),this.material=Array.isArray(e.material)?e.material.slice():e.material,this.geometry=e.geometry,this}updateMorphTargets(){let t=this.geometry.morphAttributes,n=Object.keys(t);if(n.length>0){let i=t[n[0]];if(i!==void 0){this.morphTargetInfluences=[],this.morphTargetDictionary={};for(let s=0,r=i.length;s<r;s++){let h=i[s].name||String(s);this.morphTargetInfluences.push(0),this.morphTargetDictionary[h]=s}}}}getVertexPosition(e,t){let n=this.geometry,i=n.attributes.position,s=n.morphAttributes.position,r=n.morphTargetsRelative;t.fromBufferAttribute(i,e);let h=this.morphTargetInfluences;if(s&&h){Zt.set(0,0,0);for(let c=0,o=s.length;c<o;c++){let a=h[c],l=s[c];a!==0&&(Rn.fromBufferAttribute(l,e),r?Zt.addScaledVector(Rn,a):Zt.addScaledVector(Rn.sub(t),a))}t.add(Zt)}return t}raycast(e,t){let n=this.geometry,i=this.material,s=this.matrixWorld;i!==void 0&&(n.boundingSphere===null&&n.computeBoundingSphere(),Wt.copy(n.boundingSphere),Wt.applyMatrix4(s),Xe.copy(e.ray).recast(e.near),!(Wt.containsPoint(Xe.origin)===!1&&(Xe.intersectSphere(Wt,ki)===null||Xe.origin.distanceToSquared(ki)>(e.far-e.near)**2))&&(Oi.copy(s).invert(),Xe.copy(e.ray).applyMatrix4(Oi),!(n.boundingBox!==null&&Xe.intersectsBox(n.boundingBox)===!1)&&this._computeIntersections(e,t,Xe)))}_computeIntersections(e,t,n){let i,s=this.geometry,r=this.material,h=s.index,c=s.attributes.position,o=s.attributes.uv,a=s.attributes.uv1,l=s.attributes.normal,u=s.groups,f=s.drawRange;if(h!==null)if(Array.isArray(r))for(let d=0,p=u.length;d<p;d++){let m=u[d],g=r[m.materialIndex],v=Math.max(m.start,f.start),x=Math.min(h.count,Math.min(m.start+m.count,f.start+f.count));for(let M=v,b=x;M<b;M+=3){let T=h.getX(M),E=h.getX(M+1),P=h.getX(M+2);i=Jt(this,g,e,n,o,a,l,T,E,P),i&&(i.faceIndex=Math.floor(M/3),i.face.materialIndex=m.materialIndex,t.push(i))}}else{let d=Math.max(0,f.start),p=Math.min(h.count,f.start+f.count);for(let m=d,g=p;m<g;m+=3){let v=h.getX(m),x=h.getX(m+1),M=h.getX(m+2);i=Jt(this,r,e,n,o,a,l,v,x,M),i&&(i.faceIndex=Math.floor(m/3),t.push(i))}}else if(c!==void 0)if(Array.isArray(r))for(let d=0,p=u.length;d<p;d++){let m=u[d],g=r[m.materialIndex],v=Math.max(m.start,f.start),x=Math.min(c.count,Math.min(m.start+m.count,f.start+f.count));for(let M=v,b=x;M<b;M+=3){let T=M,E=M+1,P=M+2;i=Jt(this,g,e,n,o,a,l,T,E,P),i&&(i.faceIndex=Math.floor(M/3),i.face.materialIndex=m.materialIndex,t.push(i))}}else{let d=Math.max(0,f.start),p=Math.min(c.count,f.start+f.count);for(let m=d,g=p;m<g;m+=3){let v=m,x=m+1,M=m+2;i=Jt(this,r,e,n,o,a,l,v,x,M),i&&(i.faceIndex=Math.floor(m/3),t.push(i))}}}};function xs(_,e,t,n,i,s,r,h){let c;if(e.side===Hi?c=n.intersectTriangle(r,s,i,!0,h):c=n.intersectTriangle(i,s,r,e.side===jt,h),c===null)return null;$t.copy(h),$t.applyMatrix4(_.matrixWorld);let o=t.ray.origin.distanceTo($t);return o<t.near||o>t.far?null:{distance:o,point:$t.clone(),object:_}}function Jt(_,e,t,n,i,s,r,h,c,o){_.getVertexPosition(h,Xt),_.getVertexPosition(c,qt),_.getVertexPosition(o,Yt);let a=xs(_,e,t,n,Xt,qt,Yt,Bi);if(a){let l=new y;Ye.getBarycoord(Bi,Xt,qt,Yt,l),i&&(a.uv=Ye.getInterpolatedAttribute(i,h,c,o,l,new ee)),s&&(a.uv1=Ye.getInterpolatedAttribute(s,h,c,o,l,new ee)),r&&(a.normal=Ye.getInterpolatedAttribute(r,h,c,o,l,new y),a.normal.dot(n.direction)>0&&a.normal.multiplyScalar(-1));let u={a:h,b:c,c:o,normal:new y,materialIndex:0};Ye.getNormal(Xt,qt,Yt,u.normal),a.face=u,a.barycoord=l}return a}function ys(_){let e={};for(let t in _){e[t]={};for(let n in _[t]){let i=_[t][n];i&&(i.isColor||i.isMatrix3||i.isMatrix4||i.isVector2||i.isVector3||i.isVector4||i.isTexture||i.isQuaternion)?i.isRenderTargetTexture?(console.warn("UniformsUtils: Textures of render targets cannot be cloned via cloneUniforms() or mergeUniforms()."),e[t][n]=null):e[t][n]=i.clone():Array.isArray(i)?e[t][n]=i.slice():e[t][n]=i}}return e}function ce(_){let e={};for(let t=0;t<_.length;t++){let n=ys(_[t]);for(let i in n)e[i]=n[i]}return e}var Ms=`#ifdef USE_ALPHAHASH
	if ( diffuseColor.a < getAlphaHashThreshold( vPosition ) ) discard;
#endif`,bs=`#ifdef USE_ALPHAHASH
	const float ALPHA_HASH_SCALE = 0.05;
	float hash2D( vec2 value ) {
		return fract( 1.0e4 * sin( 17.0 * value.x + 0.1 * value.y ) * ( 0.1 + abs( sin( 13.0 * value.y + value.x ) ) ) );
	}
	float hash3D( vec3 value ) {
		return hash2D( vec2( hash2D( value.xy ), value.z ) );
	}
	float getAlphaHashThreshold( vec3 position ) {
		float maxDeriv = max(
			length( dFdx( position.xyz ) ),
			length( dFdy( position.xyz ) )
		);
		float pixScale = 1.0 / ( ALPHA_HASH_SCALE * maxDeriv );
		vec2 pixScales = vec2(
			exp2( floor( log2( pixScale ) ) ),
			exp2( ceil( log2( pixScale ) ) )
		);
		vec2 alpha = vec2(
			hash3D( floor( pixScales.x * position.xyz ) ),
			hash3D( floor( pixScales.y * position.xyz ) )
		);
		float lerpFactor = fract( log2( pixScale ) );
		float x = ( 1.0 - lerpFactor ) * alpha.x + lerpFactor * alpha.y;
		float a = min( lerpFactor, 1.0 - lerpFactor );
		vec3 cases = vec3(
			x * x / ( 2.0 * a * ( 1.0 - a ) ),
			( x - 0.5 * a ) / ( 1.0 - a ),
			1.0 - ( ( 1.0 - x ) * ( 1.0 - x ) / ( 2.0 * a * ( 1.0 - a ) ) )
		);
		float threshold = ( x < ( 1.0 - a ) )
			? ( ( x < a ) ? cases.x : cases.y )
			: cases.z;
		return clamp( threshold , 1.0e-6, 1.0 );
	}
#endif`,Ss=`#ifdef USE_ALPHAMAP
	diffuseColor.a *= texture2D( alphaMap, vAlphaMapUv ).g;
#endif`,ws=`#ifdef USE_ALPHAMAP
	uniform sampler2D alphaMap;
#endif`,Es=`#ifdef USE_ALPHATEST
	#ifdef ALPHA_TO_COVERAGE
	diffuseColor.a = smoothstep( alphaTest, alphaTest + fwidth( diffuseColor.a ), diffuseColor.a );
	if ( diffuseColor.a == 0.0 ) discard;
	#else
	if ( diffuseColor.a < alphaTest ) discard;
	#endif
#endif`,Ts=`#ifdef USE_ALPHATEST
	uniform float alphaTest;
#endif`,As=`#ifdef USE_AOMAP
	float ambientOcclusion = ( texture2D( aoMap, vAoMapUv ).r - 1.0 ) * aoMapIntensity + 1.0;
	reflectedLight.indirectDiffuse *= ambientOcclusion;
	#if defined( USE_CLEARCOAT ) 
		clearcoatSpecularIndirect *= ambientOcclusion;
	#endif
	#if defined( USE_SHEEN ) 
		sheenSpecularIndirect *= ambientOcclusion;
	#endif
	#if defined( USE_ENVMAP ) && defined( STANDARD )
		float dotNV = saturate( dot( geometryNormal, geometryViewDir ) );
		reflectedLight.indirectSpecular *= computeSpecularOcclusion( dotNV, ambientOcclusion, material.roughness );
	#endif
#endif`,Rs=`#ifdef USE_AOMAP
	uniform sampler2D aoMap;
	uniform float aoMapIntensity;
#endif`,Cs=`#ifdef USE_BATCHING
	#if ! defined( GL_ANGLE_multi_draw )
	#define gl_DrawID _gl_DrawID
	uniform int _gl_DrawID;
	#endif
	uniform highp sampler2D batchingTexture;
	uniform highp usampler2D batchingIdTexture;
	mat4 getBatchingMatrix( const in float i ) {
		int size = textureSize( batchingTexture, 0 ).x;
		int j = int( i ) * 4;
		int x = j % size;
		int y = j / size;
		vec4 v1 = texelFetch( batchingTexture, ivec2( x, y ), 0 );
		vec4 v2 = texelFetch( batchingTexture, ivec2( x + 1, y ), 0 );
		vec4 v3 = texelFetch( batchingTexture, ivec2( x + 2, y ), 0 );
		vec4 v4 = texelFetch( batchingTexture, ivec2( x + 3, y ), 0 );
		return mat4( v1, v2, v3, v4 );
	}
	float getIndirectIndex( const in int i ) {
		int size = textureSize( batchingIdTexture, 0 ).x;
		int x = i % size;
		int y = i / size;
		return float( texelFetch( batchingIdTexture, ivec2( x, y ), 0 ).r );
	}
#endif
#ifdef USE_BATCHING_COLOR
	uniform sampler2D batchingColorTexture;
	vec3 getBatchingColor( const in float i ) {
		int size = textureSize( batchingColorTexture, 0 ).x;
		int j = int( i );
		int x = j % size;
		int y = j / size;
		return texelFetch( batchingColorTexture, ivec2( x, y ), 0 ).rgb;
	}
#endif`,Ps=`#ifdef USE_BATCHING
	mat4 batchingMatrix = getBatchingMatrix( getIndirectIndex( gl_DrawID ) );
#endif`,Is=`vec3 transformed = vec3( position );
#ifdef USE_ALPHAHASH
	vPosition = vec3( position );
#endif`,Ls=`vec3 objectNormal = vec3( normal );
#ifdef USE_TANGENT
	vec3 objectTangent = vec3( tangent.xyz );
#endif`,Ds=`float G_BlinnPhong_Implicit( ) {
	return 0.25;
}
float D_BlinnPhong( const in float shininess, const in float dotNH ) {
	return RECIPROCAL_PI * ( shininess * 0.5 + 1.0 ) * pow( dotNH, shininess );
}
vec3 BRDF_BlinnPhong( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, const in vec3 specularColor, const in float shininess ) {
	vec3 halfDir = normalize( lightDir + viewDir );
	float dotNH = saturate( dot( normal, halfDir ) );
	float dotVH = saturate( dot( viewDir, halfDir ) );
	vec3 F = F_Schlick( specularColor, 1.0, dotVH );
	float G = G_BlinnPhong_Implicit( );
	float D = D_BlinnPhong( shininess, dotNH );
	return F * ( G * D );
} // validated`,Us=`#ifdef USE_IRIDESCENCE
	const mat3 XYZ_TO_REC709 = mat3(
		 3.2404542, -0.9692660,  0.0556434,
		-1.5371385,  1.8760108, -0.2040259,
		-0.4985314,  0.0415560,  1.0572252
	);
	vec3 Fresnel0ToIor( vec3 fresnel0 ) {
		vec3 sqrtF0 = sqrt( fresnel0 );
		return ( vec3( 1.0 ) + sqrtF0 ) / ( vec3( 1.0 ) - sqrtF0 );
	}
	vec3 IorToFresnel0( vec3 transmittedIor, float incidentIor ) {
		return pow2( ( transmittedIor - vec3( incidentIor ) ) / ( transmittedIor + vec3( incidentIor ) ) );
	}
	float IorToFresnel0( float transmittedIor, float incidentIor ) {
		return pow2( ( transmittedIor - incidentIor ) / ( transmittedIor + incidentIor ));
	}
	vec3 evalSensitivity( float OPD, vec3 shift ) {
		float phase = 2.0 * PI * OPD * 1.0e-9;
		vec3 val = vec3( 5.4856e-13, 4.4201e-13, 5.2481e-13 );
		vec3 pos = vec3( 1.6810e+06, 1.7953e+06, 2.2084e+06 );
		vec3 var = vec3( 4.3278e+09, 9.3046e+09, 6.6121e+09 );
		vec3 xyz = val * sqrt( 2.0 * PI * var ) * cos( pos * phase + shift ) * exp( - pow2( phase ) * var );
		xyz.x += 9.7470e-14 * sqrt( 2.0 * PI * 4.5282e+09 ) * cos( 2.2399e+06 * phase + shift[ 0 ] ) * exp( - 4.5282e+09 * pow2( phase ) );
		xyz /= 1.0685e-7;
		vec3 rgb = XYZ_TO_REC709 * xyz;
		return rgb;
	}
	vec3 evalIridescence( float outsideIOR, float eta2, float cosTheta1, float thinFilmThickness, vec3 baseF0 ) {
		vec3 I;
		float iridescenceIOR = mix( outsideIOR, eta2, smoothstep( 0.0, 0.03, thinFilmThickness ) );
		float sinTheta2Sq = pow2( outsideIOR / iridescenceIOR ) * ( 1.0 - pow2( cosTheta1 ) );
		float cosTheta2Sq = 1.0 - sinTheta2Sq;
		if ( cosTheta2Sq < 0.0 ) {
			return vec3( 1.0 );
		}
		float cosTheta2 = sqrt( cosTheta2Sq );
		float R0 = IorToFresnel0( iridescenceIOR, outsideIOR );
		float R12 = F_Schlick( R0, 1.0, cosTheta1 );
		float T121 = 1.0 - R12;
		float phi12 = 0.0;
		if ( iridescenceIOR < outsideIOR ) phi12 = PI;
		float phi21 = PI - phi12;
		vec3 baseIOR = Fresnel0ToIor( clamp( baseF0, 0.0, 0.9999 ) );		vec3 R1 = IorToFresnel0( baseIOR, iridescenceIOR );
		vec3 R23 = F_Schlick( R1, 1.0, cosTheta2 );
		vec3 phi23 = vec3( 0.0 );
		if ( baseIOR[ 0 ] < iridescenceIOR ) phi23[ 0 ] = PI;
		if ( baseIOR[ 1 ] < iridescenceIOR ) phi23[ 1 ] = PI;
		if ( baseIOR[ 2 ] < iridescenceIOR ) phi23[ 2 ] = PI;
		float OPD = 2.0 * iridescenceIOR * thinFilmThickness * cosTheta2;
		vec3 phi = vec3( phi21 ) + phi23;
		vec3 R123 = clamp( R12 * R23, 1e-5, 0.9999 );
		vec3 r123 = sqrt( R123 );
		vec3 Rs = pow2( T121 ) * R23 / ( vec3( 1.0 ) - R123 );
		vec3 C0 = R12 + Rs;
		I = C0;
		vec3 Cm = Rs - T121;
		for ( int m = 1; m <= 2; ++ m ) {
			Cm *= r123;
			vec3 Sm = 2.0 * evalSensitivity( float( m ) * OPD, float( m ) * phi );
			I += Cm * Sm;
		}
		return max( I, vec3( 0.0 ) );
	}
#endif`,Ns=`#ifdef USE_BUMPMAP
	uniform sampler2D bumpMap;
	uniform float bumpScale;
	vec2 dHdxy_fwd() {
		vec2 dSTdx = dFdx( vBumpMapUv );
		vec2 dSTdy = dFdy( vBumpMapUv );
		float Hll = bumpScale * texture2D( bumpMap, vBumpMapUv ).x;
		float dBx = bumpScale * texture2D( bumpMap, vBumpMapUv + dSTdx ).x - Hll;
		float dBy = bumpScale * texture2D( bumpMap, vBumpMapUv + dSTdy ).x - Hll;
		return vec2( dBx, dBy );
	}
	vec3 perturbNormalArb( vec3 surf_pos, vec3 surf_norm, vec2 dHdxy, float faceDirection ) {
		vec3 vSigmaX = normalize( dFdx( surf_pos.xyz ) );
		vec3 vSigmaY = normalize( dFdy( surf_pos.xyz ) );
		vec3 vN = surf_norm;
		vec3 R1 = cross( vSigmaY, vN );
		vec3 R2 = cross( vN, vSigmaX );
		float fDet = dot( vSigmaX, R1 ) * faceDirection;
		vec3 vGrad = sign( fDet ) * ( dHdxy.x * R1 + dHdxy.y * R2 );
		return normalize( abs( fDet ) * surf_norm - vGrad );
	}
#endif`,Fs=`#if NUM_CLIPPING_PLANES > 0
	vec4 plane;
	#ifdef ALPHA_TO_COVERAGE
		float distanceToPlane, distanceGradient;
		float clipOpacity = 1.0;
		#pragma unroll_loop_start
		for ( int i = 0; i < UNION_CLIPPING_PLANES; i ++ ) {
			plane = clippingPlanes[ i ];
			distanceToPlane = - dot( vClipPosition, plane.xyz ) + plane.w;
			distanceGradient = fwidth( distanceToPlane ) / 2.0;
			clipOpacity *= smoothstep( - distanceGradient, distanceGradient, distanceToPlane );
			if ( clipOpacity == 0.0 ) discard;
		}
		#pragma unroll_loop_end
		#if UNION_CLIPPING_PLANES < NUM_CLIPPING_PLANES
			float unionClipOpacity = 1.0;
			#pragma unroll_loop_start
			for ( int i = UNION_CLIPPING_PLANES; i < NUM_CLIPPING_PLANES; i ++ ) {
				plane = clippingPlanes[ i ];
				distanceToPlane = - dot( vClipPosition, plane.xyz ) + plane.w;
				distanceGradient = fwidth( distanceToPlane ) / 2.0;
				unionClipOpacity *= 1.0 - smoothstep( - distanceGradient, distanceGradient, distanceToPlane );
			}
			#pragma unroll_loop_end
			clipOpacity *= 1.0 - unionClipOpacity;
		#endif
		diffuseColor.a *= clipOpacity;
		if ( diffuseColor.a == 0.0 ) discard;
	#else
		#pragma unroll_loop_start
		for ( int i = 0; i < UNION_CLIPPING_PLANES; i ++ ) {
			plane = clippingPlanes[ i ];
			if ( dot( vClipPosition, plane.xyz ) > plane.w ) discard;
		}
		#pragma unroll_loop_end
		#if UNION_CLIPPING_PLANES < NUM_CLIPPING_PLANES
			bool clipped = true;
			#pragma unroll_loop_start
			for ( int i = UNION_CLIPPING_PLANES; i < NUM_CLIPPING_PLANES; i ++ ) {
				plane = clippingPlanes[ i ];
				clipped = ( dot( vClipPosition, plane.xyz ) > plane.w ) && clipped;
			}
			#pragma unroll_loop_end
			if ( clipped ) discard;
		#endif
	#endif
#endif`,Os=`#if NUM_CLIPPING_PLANES > 0
	varying vec3 vClipPosition;
	uniform vec4 clippingPlanes[ NUM_CLIPPING_PLANES ];
#endif`,ks=`#if NUM_CLIPPING_PLANES > 0
	varying vec3 vClipPosition;
#endif`,Bs=`#if NUM_CLIPPING_PLANES > 0
	vClipPosition = - mvPosition.xyz;
#endif`,zs=`#if defined( USE_COLOR_ALPHA )
	diffuseColor *= vColor;
#elif defined( USE_COLOR )
	diffuseColor.rgb *= vColor;
#endif`,Vs=`#if defined( USE_COLOR_ALPHA )
	varying vec4 vColor;
#elif defined( USE_COLOR )
	varying vec3 vColor;
#endif`,Hs=`#if defined( USE_COLOR_ALPHA )
	varying vec4 vColor;
#elif defined( USE_COLOR ) || defined( USE_INSTANCING_COLOR ) || defined( USE_BATCHING_COLOR )
	varying vec3 vColor;
#endif`,Gs=`#if defined( USE_COLOR_ALPHA )
	vColor = vec4( 1.0 );
#elif defined( USE_COLOR ) || defined( USE_INSTANCING_COLOR ) || defined( USE_BATCHING_COLOR )
	vColor = vec3( 1.0 );
#endif
#ifdef USE_COLOR
	vColor *= color;
#endif
#ifdef USE_INSTANCING_COLOR
	vColor.xyz *= instanceColor.xyz;
#endif
#ifdef USE_BATCHING_COLOR
	vec3 batchingColor = getBatchingColor( getIndirectIndex( gl_DrawID ) );
	vColor.xyz *= batchingColor.xyz;
#endif`,Ws=`#define PI 3.141592653589793
#define PI2 6.283185307179586
#define PI_HALF 1.5707963267948966
#define RECIPROCAL_PI 0.3183098861837907
#define RECIPROCAL_PI2 0.15915494309189535
#define EPSILON 1e-6
#ifndef saturate
#define saturate( a ) clamp( a, 0.0, 1.0 )
#endif
#define whiteComplement( a ) ( 1.0 - saturate( a ) )
float pow2( const in float x ) { return x*x; }
vec3 pow2( const in vec3 x ) { return x*x; }
float pow3( const in float x ) { return x*x*x; }
float pow4( const in float x ) { float x2 = x*x; return x2*x2; }
float max3( const in vec3 v ) { return max( max( v.x, v.y ), v.z ); }
float average( const in vec3 v ) { return dot( v, vec3( 0.3333333 ) ); }
highp float rand( const in vec2 uv ) {
	const highp float a = 12.9898, b = 78.233, c = 43758.5453;
	highp float dt = dot( uv.xy, vec2( a,b ) ), sn = mod( dt, PI );
	return fract( sin( sn ) * c );
}
#ifdef HIGH_PRECISION
	float precisionSafeLength( vec3 v ) { return length( v ); }
#else
	float precisionSafeLength( vec3 v ) {
		float maxComponent = max3( abs( v ) );
		return length( v / maxComponent ) * maxComponent;
	}
#endif
struct IncidentLight {
	vec3 color;
	vec3 direction;
	bool visible;
};
struct ReflectedLight {
	vec3 directDiffuse;
	vec3 directSpecular;
	vec3 indirectDiffuse;
	vec3 indirectSpecular;
};
#ifdef USE_ALPHAHASH
	varying vec3 vPosition;
#endif
vec3 transformDirection( in vec3 dir, in mat4 matrix ) {
	return normalize( ( matrix * vec4( dir, 0.0 ) ).xyz );
}
vec3 inverseTransformDirection( in vec3 dir, in mat4 matrix ) {
	return normalize( ( vec4( dir, 0.0 ) * matrix ).xyz );
}
mat3 transposeMat3( const in mat3 m ) {
	mat3 tmp;
	tmp[ 0 ] = vec3( m[ 0 ].x, m[ 1 ].x, m[ 2 ].x );
	tmp[ 1 ] = vec3( m[ 0 ].y, m[ 1 ].y, m[ 2 ].y );
	tmp[ 2 ] = vec3( m[ 0 ].z, m[ 1 ].z, m[ 2 ].z );
	return tmp;
}
bool isPerspectiveMatrix( mat4 m ) {
	return m[ 2 ][ 3 ] == - 1.0;
}
vec2 equirectUv( in vec3 dir ) {
	float u = atan( dir.z, dir.x ) * RECIPROCAL_PI2 + 0.5;
	float v = asin( clamp( dir.y, - 1.0, 1.0 ) ) * RECIPROCAL_PI + 0.5;
	return vec2( u, v );
}
vec3 BRDF_Lambert( const in vec3 diffuseColor ) {
	return RECIPROCAL_PI * diffuseColor;
}
vec3 F_Schlick( const in vec3 f0, const in float f90, const in float dotVH ) {
	float fresnel = exp2( ( - 5.55473 * dotVH - 6.98316 ) * dotVH );
	return f0 * ( 1.0 - fresnel ) + ( f90 * fresnel );
}
float F_Schlick( const in float f0, const in float f90, const in float dotVH ) {
	float fresnel = exp2( ( - 5.55473 * dotVH - 6.98316 ) * dotVH );
	return f0 * ( 1.0 - fresnel ) + ( f90 * fresnel );
} // validated`,Xs=`#ifdef ENVMAP_TYPE_CUBE_UV
	#define cubeUV_minMipLevel 4.0
	#define cubeUV_minTileSize 16.0
	float getFace( vec3 direction ) {
		vec3 absDirection = abs( direction );
		float face = - 1.0;
		if ( absDirection.x > absDirection.z ) {
			if ( absDirection.x > absDirection.y )
				face = direction.x > 0.0 ? 0.0 : 3.0;
			else
				face = direction.y > 0.0 ? 1.0 : 4.0;
		} else {
			if ( absDirection.z > absDirection.y )
				face = direction.z > 0.0 ? 2.0 : 5.0;
			else
				face = direction.y > 0.0 ? 1.0 : 4.0;
		}
		return face;
	}
	vec2 getUV( vec3 direction, float face ) {
		vec2 uv;
		if ( face == 0.0 ) {
			uv = vec2( direction.z, direction.y ) / abs( direction.x );
		} else if ( face == 1.0 ) {
			uv = vec2( - direction.x, - direction.z ) / abs( direction.y );
		} else if ( face == 2.0 ) {
			uv = vec2( - direction.x, direction.y ) / abs( direction.z );
		} else if ( face == 3.0 ) {
			uv = vec2( - direction.z, direction.y ) / abs( direction.x );
		} else if ( face == 4.0 ) {
			uv = vec2( - direction.x, direction.z ) / abs( direction.y );
		} else {
			uv = vec2( direction.x, direction.y ) / abs( direction.z );
		}
		return 0.5 * ( uv + 1.0 );
	}
	vec3 bilinearCubeUV( sampler2D envMap, vec3 direction, float mipInt ) {
		float face = getFace( direction );
		float filterInt = max( cubeUV_minMipLevel - mipInt, 0.0 );
		mipInt = max( mipInt, cubeUV_minMipLevel );
		float faceSize = exp2( mipInt );
		highp vec2 uv = getUV( direction, face ) * ( faceSize - 2.0 ) + 1.0;
		if ( face > 2.0 ) {
			uv.y += faceSize;
			face -= 3.0;
		}
		uv.x += face * faceSize;
		uv.x += filterInt * 3.0 * cubeUV_minTileSize;
		uv.y += 4.0 * ( exp2( CUBEUV_MAX_MIP ) - faceSize );
		uv.x *= CUBEUV_TEXEL_WIDTH;
		uv.y *= CUBEUV_TEXEL_HEIGHT;
		#ifdef texture2DGradEXT
			return texture2DGradEXT( envMap, uv, vec2( 0.0 ), vec2( 0.0 ) ).rgb;
		#else
			return texture2D( envMap, uv ).rgb;
		#endif
	}
	#define cubeUV_r0 1.0
	#define cubeUV_m0 - 2.0
	#define cubeUV_r1 0.8
	#define cubeUV_m1 - 1.0
	#define cubeUV_r4 0.4
	#define cubeUV_m4 2.0
	#define cubeUV_r5 0.305
	#define cubeUV_m5 3.0
	#define cubeUV_r6 0.21
	#define cubeUV_m6 4.0
	float roughnessToMip( float roughness ) {
		float mip = 0.0;
		if ( roughness >= cubeUV_r1 ) {
			mip = ( cubeUV_r0 - roughness ) * ( cubeUV_m1 - cubeUV_m0 ) / ( cubeUV_r0 - cubeUV_r1 ) + cubeUV_m0;
		} else if ( roughness >= cubeUV_r4 ) {
			mip = ( cubeUV_r1 - roughness ) * ( cubeUV_m4 - cubeUV_m1 ) / ( cubeUV_r1 - cubeUV_r4 ) + cubeUV_m1;
		} else if ( roughness >= cubeUV_r5 ) {
			mip = ( cubeUV_r4 - roughness ) * ( cubeUV_m5 - cubeUV_m4 ) / ( cubeUV_r4 - cubeUV_r5 ) + cubeUV_m4;
		} else if ( roughness >= cubeUV_r6 ) {
			mip = ( cubeUV_r5 - roughness ) * ( cubeUV_m6 - cubeUV_m5 ) / ( cubeUV_r5 - cubeUV_r6 ) + cubeUV_m5;
		} else {
			mip = - 2.0 * log2( 1.16 * roughness );		}
		return mip;
	}
	vec4 textureCubeUV( sampler2D envMap, vec3 sampleDir, float roughness ) {
		float mip = clamp( roughnessToMip( roughness ), cubeUV_m0, CUBEUV_MAX_MIP );
		float mipF = fract( mip );
		float mipInt = floor( mip );
		vec3 color0 = bilinearCubeUV( envMap, sampleDir, mipInt );
		if ( mipF == 0.0 ) {
			return vec4( color0, 1.0 );
		} else {
			vec3 color1 = bilinearCubeUV( envMap, sampleDir, mipInt + 1.0 );
			return vec4( mix( color0, color1, mipF ), 1.0 );
		}
	}
#endif`,qs=`vec3 transformedNormal = objectNormal;
#ifdef USE_TANGENT
	vec3 transformedTangent = objectTangent;
#endif
#ifdef USE_BATCHING
	mat3 bm = mat3( batchingMatrix );
	transformedNormal /= vec3( dot( bm[ 0 ], bm[ 0 ] ), dot( bm[ 1 ], bm[ 1 ] ), dot( bm[ 2 ], bm[ 2 ] ) );
	transformedNormal = bm * transformedNormal;
	#ifdef USE_TANGENT
		transformedTangent = bm * transformedTangent;
	#endif
#endif
#ifdef USE_INSTANCING
	mat3 im = mat3( instanceMatrix );
	transformedNormal /= vec3( dot( im[ 0 ], im[ 0 ] ), dot( im[ 1 ], im[ 1 ] ), dot( im[ 2 ], im[ 2 ] ) );
	transformedNormal = im * transformedNormal;
	#ifdef USE_TANGENT
		transformedTangent = im * transformedTangent;
	#endif
#endif
transformedNormal = normalMatrix * transformedNormal;
#ifdef FLIP_SIDED
	transformedNormal = - transformedNormal;
#endif
#ifdef USE_TANGENT
	transformedTangent = ( modelViewMatrix * vec4( transformedTangent, 0.0 ) ).xyz;
	#ifdef FLIP_SIDED
		transformedTangent = - transformedTangent;
	#endif
#endif`,Ys=`#ifdef USE_DISPLACEMENTMAP
	uniform sampler2D displacementMap;
	uniform float displacementScale;
	uniform float displacementBias;
#endif`,Zs=`#ifdef USE_DISPLACEMENTMAP
	transformed += normalize( objectNormal ) * ( texture2D( displacementMap, vDisplacementMapUv ).x * displacementScale + displacementBias );
#endif`,$s=`#ifdef USE_EMISSIVEMAP
	vec4 emissiveColor = texture2D( emissiveMap, vEmissiveMapUv );
	totalEmissiveRadiance *= emissiveColor.rgb;
#endif`,Js=`#ifdef USE_EMISSIVEMAP
	uniform sampler2D emissiveMap;
#endif`,Ks="gl_FragColor = linearToOutputTexel( gl_FragColor );",js=`
const mat3 LINEAR_SRGB_TO_LINEAR_DISPLAY_P3 = mat3(
	vec3( 0.8224621, 0.177538, 0.0 ),
	vec3( 0.0331941, 0.9668058, 0.0 ),
	vec3( 0.0170827, 0.0723974, 0.9105199 )
);
const mat3 LINEAR_DISPLAY_P3_TO_LINEAR_SRGB = mat3(
	vec3( 1.2249401, - 0.2249404, 0.0 ),
	vec3( - 0.0420569, 1.0420571, 0.0 ),
	vec3( - 0.0196376, - 0.0786361, 1.0982735 )
);
vec4 LinearSRGBToLinearDisplayP3( in vec4 value ) {
	return vec4( value.rgb * LINEAR_SRGB_TO_LINEAR_DISPLAY_P3, value.a );
}
vec4 LinearDisplayP3ToLinearSRGB( in vec4 value ) {
	return vec4( value.rgb * LINEAR_DISPLAY_P3_TO_LINEAR_SRGB, value.a );
}
vec4 LinearTransferOETF( in vec4 value ) {
	return value;
}
vec4 sRGBTransferOETF( in vec4 value ) {
	return vec4( mix( pow( value.rgb, vec3( 0.41666 ) ) * 1.055 - vec3( 0.055 ), value.rgb * 12.92, vec3( lessThanEqual( value.rgb, vec3( 0.0031308 ) ) ) ), value.a );
}`,Qs=`#ifdef USE_ENVMAP
	#ifdef ENV_WORLDPOS
		vec3 cameraToFrag;
		if ( isOrthographic ) {
			cameraToFrag = normalize( vec3( - viewMatrix[ 0 ][ 2 ], - viewMatrix[ 1 ][ 2 ], - viewMatrix[ 2 ][ 2 ] ) );
		} else {
			cameraToFrag = normalize( vWorldPosition - cameraPosition );
		}
		vec3 worldNormal = inverseTransformDirection( normal, viewMatrix );
		#ifdef ENVMAP_MODE_REFLECTION
			vec3 reflectVec = reflect( cameraToFrag, worldNormal );
		#else
			vec3 reflectVec = refract( cameraToFrag, worldNormal, refractionRatio );
		#endif
	#else
		vec3 reflectVec = vReflect;
	#endif
	#ifdef ENVMAP_TYPE_CUBE
		vec4 envColor = textureCube( envMap, envMapRotation * vec3( flipEnvMap * reflectVec.x, reflectVec.yz ) );
	#else
		vec4 envColor = vec4( 0.0 );
	#endif
	#ifdef ENVMAP_BLENDING_MULTIPLY
		outgoingLight = mix( outgoingLight, outgoingLight * envColor.xyz, specularStrength * reflectivity );
	#elif defined( ENVMAP_BLENDING_MIX )
		outgoingLight = mix( outgoingLight, envColor.xyz, specularStrength * reflectivity );
	#elif defined( ENVMAP_BLENDING_ADD )
		outgoingLight += envColor.xyz * specularStrength * reflectivity;
	#endif
#endif`,er=`#ifdef USE_ENVMAP
	uniform float envMapIntensity;
	uniform float flipEnvMap;
	uniform mat3 envMapRotation;
	#ifdef ENVMAP_TYPE_CUBE
		uniform samplerCube envMap;
	#else
		uniform sampler2D envMap;
	#endif
	
#endif`,tr=`#ifdef USE_ENVMAP
	uniform float reflectivity;
	#if defined( USE_BUMPMAP ) || defined( USE_NORMALMAP ) || defined( PHONG ) || defined( LAMBERT )
		#define ENV_WORLDPOS
	#endif
	#ifdef ENV_WORLDPOS
		varying vec3 vWorldPosition;
		uniform float refractionRatio;
	#else
		varying vec3 vReflect;
	#endif
#endif`,nr=`#ifdef USE_ENVMAP
	#if defined( USE_BUMPMAP ) || defined( USE_NORMALMAP ) || defined( PHONG ) || defined( LAMBERT )
		#define ENV_WORLDPOS
	#endif
	#ifdef ENV_WORLDPOS
		
		varying vec3 vWorldPosition;
	#else
		varying vec3 vReflect;
		uniform float refractionRatio;
	#endif
#endif`,ir=`#ifdef USE_ENVMAP
	#ifdef ENV_WORLDPOS
		vWorldPosition = worldPosition.xyz;
	#else
		vec3 cameraToVertex;
		if ( isOrthographic ) {
			cameraToVertex = normalize( vec3( - viewMatrix[ 0 ][ 2 ], - viewMatrix[ 1 ][ 2 ], - viewMatrix[ 2 ][ 2 ] ) );
		} else {
			cameraToVertex = normalize( worldPosition.xyz - cameraPosition );
		}
		vec3 worldNormal = inverseTransformDirection( transformedNormal, viewMatrix );
		#ifdef ENVMAP_MODE_REFLECTION
			vReflect = reflect( cameraToVertex, worldNormal );
		#else
			vReflect = refract( cameraToVertex, worldNormal, refractionRatio );
		#endif
	#endif
#endif`,sr=`#ifdef USE_FOG
	vFogDepth = - mvPosition.z;
#endif`,rr=`#ifdef USE_FOG
	varying float vFogDepth;
#endif`,ar=`#ifdef USE_FOG
	#ifdef FOG_EXP2
		float fogFactor = 1.0 - exp( - fogDensity * fogDensity * vFogDepth * vFogDepth );
	#else
		float fogFactor = smoothstep( fogNear, fogFar, vFogDepth );
	#endif
	gl_FragColor.rgb = mix( gl_FragColor.rgb, fogColor, fogFactor );
#endif`,or=`#ifdef USE_FOG
	uniform vec3 fogColor;
	varying float vFogDepth;
	#ifdef FOG_EXP2
		uniform float fogDensity;
	#else
		uniform float fogNear;
		uniform float fogFar;
	#endif
#endif`,lr=`#ifdef USE_GRADIENTMAP
	uniform sampler2D gradientMap;
#endif
vec3 getGradientIrradiance( vec3 normal, vec3 lightDirection ) {
	float dotNL = dot( normal, lightDirection );
	vec2 coord = vec2( dotNL * 0.5 + 0.5, 0.0 );
	#ifdef USE_GRADIENTMAP
		return vec3( texture2D( gradientMap, coord ).r );
	#else
		vec2 fw = fwidth( coord ) * 0.5;
		return mix( vec3( 0.7 ), vec3( 1.0 ), smoothstep( 0.7 - fw.x, 0.7 + fw.x, coord.x ) );
	#endif
}`,cr=`#ifdef USE_LIGHTMAP
	uniform sampler2D lightMap;
	uniform float lightMapIntensity;
#endif`,hr=`LambertMaterial material;
material.diffuseColor = diffuseColor.rgb;
material.specularStrength = specularStrength;`,ur=`varying vec3 vViewPosition;
struct LambertMaterial {
	vec3 diffuseColor;
	float specularStrength;
};
void RE_Direct_Lambert( const in IncidentLight directLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in LambertMaterial material, inout ReflectedLight reflectedLight ) {
	float dotNL = saturate( dot( geometryNormal, directLight.direction ) );
	vec3 irradiance = dotNL * directLight.color;
	reflectedLight.directDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
void RE_IndirectDiffuse_Lambert( const in vec3 irradiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in LambertMaterial material, inout ReflectedLight reflectedLight ) {
	reflectedLight.indirectDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
#define RE_Direct				RE_Direct_Lambert
#define RE_IndirectDiffuse		RE_IndirectDiffuse_Lambert`,fr=`uniform bool receiveShadow;
uniform vec3 ambientLightColor;
#if defined( USE_LIGHT_PROBES )
	uniform vec3 lightProbe[ 9 ];
#endif
vec3 shGetIrradianceAt( in vec3 normal, in vec3 shCoefficients[ 9 ] ) {
	float x = normal.x, y = normal.y, z = normal.z;
	vec3 result = shCoefficients[ 0 ] * 0.886227;
	result += shCoefficients[ 1 ] * 2.0 * 0.511664 * y;
	result += shCoefficients[ 2 ] * 2.0 * 0.511664 * z;
	result += shCoefficients[ 3 ] * 2.0 * 0.511664 * x;
	result += shCoefficients[ 4 ] * 2.0 * 0.429043 * x * y;
	result += shCoefficients[ 5 ] * 2.0 * 0.429043 * y * z;
	result += shCoefficients[ 6 ] * ( 0.743125 * z * z - 0.247708 );
	result += shCoefficients[ 7 ] * 2.0 * 0.429043 * x * z;
	result += shCoefficients[ 8 ] * 0.429043 * ( x * x - y * y );
	return result;
}
vec3 getLightProbeIrradiance( const in vec3 lightProbe[ 9 ], const in vec3 normal ) {
	vec3 worldNormal = inverseTransformDirection( normal, viewMatrix );
	vec3 irradiance = shGetIrradianceAt( worldNormal, lightProbe );
	return irradiance;
}
vec3 getAmbientLightIrradiance( const in vec3 ambientLightColor ) {
	vec3 irradiance = ambientLightColor;
	return irradiance;
}
float getDistanceAttenuation( const in float lightDistance, const in float cutoffDistance, const in float decayExponent ) {
	float distanceFalloff = 1.0 / max( pow( lightDistance, decayExponent ), 0.01 );
	if ( cutoffDistance > 0.0 ) {
		distanceFalloff *= pow2( saturate( 1.0 - pow4( lightDistance / cutoffDistance ) ) );
	}
	return distanceFalloff;
}
float getSpotAttenuation( const in float coneCosine, const in float penumbraCosine, const in float angleCosine ) {
	return smoothstep( coneCosine, penumbraCosine, angleCosine );
}
#if NUM_DIR_LIGHTS > 0
	struct DirectionalLight {
		vec3 direction;
		vec3 color;
	};
	uniform DirectionalLight directionalLights[ NUM_DIR_LIGHTS ];
	void getDirectionalLightInfo( const in DirectionalLight directionalLight, out IncidentLight light ) {
		light.color = directionalLight.color;
		light.direction = directionalLight.direction;
		light.visible = true;
	}
#endif
#if NUM_POINT_LIGHTS > 0
	struct PointLight {
		vec3 position;
		vec3 color;
		float distance;
		float decay;
	};
	uniform PointLight pointLights[ NUM_POINT_LIGHTS ];
	void getPointLightInfo( const in PointLight pointLight, const in vec3 geometryPosition, out IncidentLight light ) {
		vec3 lVector = pointLight.position - geometryPosition;
		light.direction = normalize( lVector );
		float lightDistance = length( lVector );
		light.color = pointLight.color;
		light.color *= getDistanceAttenuation( lightDistance, pointLight.distance, pointLight.decay );
		light.visible = ( light.color != vec3( 0.0 ) );
	}
#endif
#if NUM_SPOT_LIGHTS > 0
	struct SpotLight {
		vec3 position;
		vec3 direction;
		vec3 color;
		float distance;
		float decay;
		float coneCos;
		float penumbraCos;
	};
	uniform SpotLight spotLights[ NUM_SPOT_LIGHTS ];
	void getSpotLightInfo( const in SpotLight spotLight, const in vec3 geometryPosition, out IncidentLight light ) {
		vec3 lVector = spotLight.position - geometryPosition;
		light.direction = normalize( lVector );
		float angleCos = dot( light.direction, spotLight.direction );
		float spotAttenuation = getSpotAttenuation( spotLight.coneCos, spotLight.penumbraCos, angleCos );
		if ( spotAttenuation > 0.0 ) {
			float lightDistance = length( lVector );
			light.color = spotLight.color * spotAttenuation;
			light.color *= getDistanceAttenuation( lightDistance, spotLight.distance, spotLight.decay );
			light.visible = ( light.color != vec3( 0.0 ) );
		} else {
			light.color = vec3( 0.0 );
			light.visible = false;
		}
	}
#endif
#if NUM_RECT_AREA_LIGHTS > 0
	struct RectAreaLight {
		vec3 color;
		vec3 position;
		vec3 halfWidth;
		vec3 halfHeight;
	};
	uniform sampler2D ltc_1;	uniform sampler2D ltc_2;
	uniform RectAreaLight rectAreaLights[ NUM_RECT_AREA_LIGHTS ];
#endif
#if NUM_HEMI_LIGHTS > 0
	struct HemisphereLight {
		vec3 direction;
		vec3 skyColor;
		vec3 groundColor;
	};
	uniform HemisphereLight hemisphereLights[ NUM_HEMI_LIGHTS ];
	vec3 getHemisphereLightIrradiance( const in HemisphereLight hemiLight, const in vec3 normal ) {
		float dotNL = dot( normal, hemiLight.direction );
		float hemiDiffuseWeight = 0.5 * dotNL + 0.5;
		vec3 irradiance = mix( hemiLight.groundColor, hemiLight.skyColor, hemiDiffuseWeight );
		return irradiance;
	}
#endif`,dr=`#ifdef USE_ENVMAP
	vec3 getIBLIrradiance( const in vec3 normal ) {
		#ifdef ENVMAP_TYPE_CUBE_UV
			vec3 worldNormal = inverseTransformDirection( normal, viewMatrix );
			vec4 envMapColor = textureCubeUV( envMap, envMapRotation * worldNormal, 1.0 );
			return PI * envMapColor.rgb * envMapIntensity;
		#else
			return vec3( 0.0 );
		#endif
	}
	vec3 getIBLRadiance( const in vec3 viewDir, const in vec3 normal, const in float roughness ) {
		#ifdef ENVMAP_TYPE_CUBE_UV
			vec3 reflectVec = reflect( - viewDir, normal );
			reflectVec = normalize( mix( reflectVec, normal, roughness * roughness) );
			reflectVec = inverseTransformDirection( reflectVec, viewMatrix );
			vec4 envMapColor = textureCubeUV( envMap, envMapRotation * reflectVec, roughness );
			return envMapColor.rgb * envMapIntensity;
		#else
			return vec3( 0.0 );
		#endif
	}
	#ifdef USE_ANISOTROPY
		vec3 getIBLAnisotropyRadiance( const in vec3 viewDir, const in vec3 normal, const in float roughness, const in vec3 bitangent, const in float anisotropy ) {
			#ifdef ENVMAP_TYPE_CUBE_UV
				vec3 bentNormal = cross( bitangent, viewDir );
				bentNormal = normalize( cross( bentNormal, bitangent ) );
				bentNormal = normalize( mix( bentNormal, normal, pow2( pow2( 1.0 - anisotropy * ( 1.0 - roughness ) ) ) ) );
				return getIBLRadiance( viewDir, bentNormal, roughness );
			#else
				return vec3( 0.0 );
			#endif
		}
	#endif
#endif`,pr=`ToonMaterial material;
material.diffuseColor = diffuseColor.rgb;`,mr=`varying vec3 vViewPosition;
struct ToonMaterial {
	vec3 diffuseColor;
};
void RE_Direct_Toon( const in IncidentLight directLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in ToonMaterial material, inout ReflectedLight reflectedLight ) {
	vec3 irradiance = getGradientIrradiance( geometryNormal, directLight.direction ) * directLight.color;
	reflectedLight.directDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
void RE_IndirectDiffuse_Toon( const in vec3 irradiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in ToonMaterial material, inout ReflectedLight reflectedLight ) {
	reflectedLight.indirectDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
#define RE_Direct				RE_Direct_Toon
#define RE_IndirectDiffuse		RE_IndirectDiffuse_Toon`,gr=`BlinnPhongMaterial material;
material.diffuseColor = diffuseColor.rgb;
material.specularColor = specular;
material.specularShininess = shininess;
material.specularStrength = specularStrength;`,_r=`varying vec3 vViewPosition;
struct BlinnPhongMaterial {
	vec3 diffuseColor;
	vec3 specularColor;
	float specularShininess;
	float specularStrength;
};
void RE_Direct_BlinnPhong( const in IncidentLight directLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in BlinnPhongMaterial material, inout ReflectedLight reflectedLight ) {
	float dotNL = saturate( dot( geometryNormal, directLight.direction ) );
	vec3 irradiance = dotNL * directLight.color;
	reflectedLight.directDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
	reflectedLight.directSpecular += irradiance * BRDF_BlinnPhong( directLight.direction, geometryViewDir, geometryNormal, material.specularColor, material.specularShininess ) * material.specularStrength;
}
void RE_IndirectDiffuse_BlinnPhong( const in vec3 irradiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in BlinnPhongMaterial material, inout ReflectedLight reflectedLight ) {
	reflectedLight.indirectDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
#define RE_Direct				RE_Direct_BlinnPhong
#define RE_IndirectDiffuse		RE_IndirectDiffuse_BlinnPhong`,vr=`PhysicalMaterial material;
material.diffuseColor = diffuseColor.rgb * ( 1.0 - metalnessFactor );
vec3 dxy = max( abs( dFdx( nonPerturbedNormal ) ), abs( dFdy( nonPerturbedNormal ) ) );
float geometryRoughness = max( max( dxy.x, dxy.y ), dxy.z );
material.roughness = max( roughnessFactor, 0.0525 );material.roughness += geometryRoughness;
material.roughness = min( material.roughness, 1.0 );
#ifdef IOR
	material.ior = ior;
	#ifdef USE_SPECULAR
		float specularIntensityFactor = specularIntensity;
		vec3 specularColorFactor = specularColor;
		#ifdef USE_SPECULAR_COLORMAP
			specularColorFactor *= texture2D( specularColorMap, vSpecularColorMapUv ).rgb;
		#endif
		#ifdef USE_SPECULAR_INTENSITYMAP
			specularIntensityFactor *= texture2D( specularIntensityMap, vSpecularIntensityMapUv ).a;
		#endif
		material.specularF90 = mix( specularIntensityFactor, 1.0, metalnessFactor );
	#else
		float specularIntensityFactor = 1.0;
		vec3 specularColorFactor = vec3( 1.0 );
		material.specularF90 = 1.0;
	#endif
	material.specularColor = mix( min( pow2( ( material.ior - 1.0 ) / ( material.ior + 1.0 ) ) * specularColorFactor, vec3( 1.0 ) ) * specularIntensityFactor, diffuseColor.rgb, metalnessFactor );
#else
	material.specularColor = mix( vec3( 0.04 ), diffuseColor.rgb, metalnessFactor );
	material.specularF90 = 1.0;
#endif
#ifdef USE_CLEARCOAT
	material.clearcoat = clearcoat;
	material.clearcoatRoughness = clearcoatRoughness;
	material.clearcoatF0 = vec3( 0.04 );
	material.clearcoatF90 = 1.0;
	#ifdef USE_CLEARCOATMAP
		material.clearcoat *= texture2D( clearcoatMap, vClearcoatMapUv ).x;
	#endif
	#ifdef USE_CLEARCOAT_ROUGHNESSMAP
		material.clearcoatRoughness *= texture2D( clearcoatRoughnessMap, vClearcoatRoughnessMapUv ).y;
	#endif
	material.clearcoat = saturate( material.clearcoat );	material.clearcoatRoughness = max( material.clearcoatRoughness, 0.0525 );
	material.clearcoatRoughness += geometryRoughness;
	material.clearcoatRoughness = min( material.clearcoatRoughness, 1.0 );
#endif
#ifdef USE_DISPERSION
	material.dispersion = dispersion;
#endif
#ifdef USE_IRIDESCENCE
	material.iridescence = iridescence;
	material.iridescenceIOR = iridescenceIOR;
	#ifdef USE_IRIDESCENCEMAP
		material.iridescence *= texture2D( iridescenceMap, vIridescenceMapUv ).r;
	#endif
	#ifdef USE_IRIDESCENCE_THICKNESSMAP
		material.iridescenceThickness = (iridescenceThicknessMaximum - iridescenceThicknessMinimum) * texture2D( iridescenceThicknessMap, vIridescenceThicknessMapUv ).g + iridescenceThicknessMinimum;
	#else
		material.iridescenceThickness = iridescenceThicknessMaximum;
	#endif
#endif
#ifdef USE_SHEEN
	material.sheenColor = sheenColor;
	#ifdef USE_SHEEN_COLORMAP
		material.sheenColor *= texture2D( sheenColorMap, vSheenColorMapUv ).rgb;
	#endif
	material.sheenRoughness = clamp( sheenRoughness, 0.07, 1.0 );
	#ifdef USE_SHEEN_ROUGHNESSMAP
		material.sheenRoughness *= texture2D( sheenRoughnessMap, vSheenRoughnessMapUv ).a;
	#endif
#endif
#ifdef USE_ANISOTROPY
	#ifdef USE_ANISOTROPYMAP
		mat2 anisotropyMat = mat2( anisotropyVector.x, anisotropyVector.y, - anisotropyVector.y, anisotropyVector.x );
		vec3 anisotropyPolar = texture2D( anisotropyMap, vAnisotropyMapUv ).rgb;
		vec2 anisotropyV = anisotropyMat * normalize( 2.0 * anisotropyPolar.rg - vec2( 1.0 ) ) * anisotropyPolar.b;
	#else
		vec2 anisotropyV = anisotropyVector;
	#endif
	material.anisotropy = length( anisotropyV );
	if( material.anisotropy == 0.0 ) {
		anisotropyV = vec2( 1.0, 0.0 );
	} else {
		anisotropyV /= material.anisotropy;
		material.anisotropy = saturate( material.anisotropy );
	}
	material.alphaT = mix( pow2( material.roughness ), 1.0, pow2( material.anisotropy ) );
	material.anisotropyT = tbn[ 0 ] * anisotropyV.x + tbn[ 1 ] * anisotropyV.y;
	material.anisotropyB = tbn[ 1 ] * anisotropyV.x - tbn[ 0 ] * anisotropyV.y;
#endif`,xr=`struct PhysicalMaterial {
	vec3 diffuseColor;
	float roughness;
	vec3 specularColor;
	float specularF90;
	float dispersion;
	#ifdef USE_CLEARCOAT
		float clearcoat;
		float clearcoatRoughness;
		vec3 clearcoatF0;
		float clearcoatF90;
	#endif
	#ifdef USE_IRIDESCENCE
		float iridescence;
		float iridescenceIOR;
		float iridescenceThickness;
		vec3 iridescenceFresnel;
		vec3 iridescenceF0;
	#endif
	#ifdef USE_SHEEN
		vec3 sheenColor;
		float sheenRoughness;
	#endif
	#ifdef IOR
		float ior;
	#endif
	#ifdef USE_TRANSMISSION
		float transmission;
		float transmissionAlpha;
		float thickness;
		float attenuationDistance;
		vec3 attenuationColor;
	#endif
	#ifdef USE_ANISOTROPY
		float anisotropy;
		float alphaT;
		vec3 anisotropyT;
		vec3 anisotropyB;
	#endif
};
vec3 clearcoatSpecularDirect = vec3( 0.0 );
vec3 clearcoatSpecularIndirect = vec3( 0.0 );
vec3 sheenSpecularDirect = vec3( 0.0 );
vec3 sheenSpecularIndirect = vec3(0.0 );
vec3 Schlick_to_F0( const in vec3 f, const in float f90, const in float dotVH ) {
    float x = clamp( 1.0 - dotVH, 0.0, 1.0 );
    float x2 = x * x;
    float x5 = clamp( x * x2 * x2, 0.0, 0.9999 );
    return ( f - vec3( f90 ) * x5 ) / ( 1.0 - x5 );
}
float V_GGX_SmithCorrelated( const in float alpha, const in float dotNL, const in float dotNV ) {
	float a2 = pow2( alpha );
	float gv = dotNL * sqrt( a2 + ( 1.0 - a2 ) * pow2( dotNV ) );
	float gl = dotNV * sqrt( a2 + ( 1.0 - a2 ) * pow2( dotNL ) );
	return 0.5 / max( gv + gl, EPSILON );
}
float D_GGX( const in float alpha, const in float dotNH ) {
	float a2 = pow2( alpha );
	float denom = pow2( dotNH ) * ( a2 - 1.0 ) + 1.0;
	return RECIPROCAL_PI * a2 / pow2( denom );
}
#ifdef USE_ANISOTROPY
	float V_GGX_SmithCorrelated_Anisotropic( const in float alphaT, const in float alphaB, const in float dotTV, const in float dotBV, const in float dotTL, const in float dotBL, const in float dotNV, const in float dotNL ) {
		float gv = dotNL * length( vec3( alphaT * dotTV, alphaB * dotBV, dotNV ) );
		float gl = dotNV * length( vec3( alphaT * dotTL, alphaB * dotBL, dotNL ) );
		float v = 0.5 / ( gv + gl );
		return saturate(v);
	}
	float D_GGX_Anisotropic( const in float alphaT, const in float alphaB, const in float dotNH, const in float dotTH, const in float dotBH ) {
		float a2 = alphaT * alphaB;
		highp vec3 v = vec3( alphaB * dotTH, alphaT * dotBH, a2 * dotNH );
		highp float v2 = dot( v, v );
		float w2 = a2 / v2;
		return RECIPROCAL_PI * a2 * pow2 ( w2 );
	}
#endif
#ifdef USE_CLEARCOAT
	vec3 BRDF_GGX_Clearcoat( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, const in PhysicalMaterial material) {
		vec3 f0 = material.clearcoatF0;
		float f90 = material.clearcoatF90;
		float roughness = material.clearcoatRoughness;
		float alpha = pow2( roughness );
		vec3 halfDir = normalize( lightDir + viewDir );
		float dotNL = saturate( dot( normal, lightDir ) );
		float dotNV = saturate( dot( normal, viewDir ) );
		float dotNH = saturate( dot( normal, halfDir ) );
		float dotVH = saturate( dot( viewDir, halfDir ) );
		vec3 F = F_Schlick( f0, f90, dotVH );
		float V = V_GGX_SmithCorrelated( alpha, dotNL, dotNV );
		float D = D_GGX( alpha, dotNH );
		return F * ( V * D );
	}
#endif
vec3 BRDF_GGX( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, const in PhysicalMaterial material ) {
	vec3 f0 = material.specularColor;
	float f90 = material.specularF90;
	float roughness = material.roughness;
	float alpha = pow2( roughness );
	vec3 halfDir = normalize( lightDir + viewDir );
	float dotNL = saturate( dot( normal, lightDir ) );
	float dotNV = saturate( dot( normal, viewDir ) );
	float dotNH = saturate( dot( normal, halfDir ) );
	float dotVH = saturate( dot( viewDir, halfDir ) );
	vec3 F = F_Schlick( f0, f90, dotVH );
	#ifdef USE_IRIDESCENCE
		F = mix( F, material.iridescenceFresnel, material.iridescence );
	#endif
	#ifdef USE_ANISOTROPY
		float dotTL = dot( material.anisotropyT, lightDir );
		float dotTV = dot( material.anisotropyT, viewDir );
		float dotTH = dot( material.anisotropyT, halfDir );
		float dotBL = dot( material.anisotropyB, lightDir );
		float dotBV = dot( material.anisotropyB, viewDir );
		float dotBH = dot( material.anisotropyB, halfDir );
		float V = V_GGX_SmithCorrelated_Anisotropic( material.alphaT, alpha, dotTV, dotBV, dotTL, dotBL, dotNV, dotNL );
		float D = D_GGX_Anisotropic( material.alphaT, alpha, dotNH, dotTH, dotBH );
	#else
		float V = V_GGX_SmithCorrelated( alpha, dotNL, dotNV );
		float D = D_GGX( alpha, dotNH );
	#endif
	return F * ( V * D );
}
vec2 LTC_Uv( const in vec3 N, const in vec3 V, const in float roughness ) {
	const float LUT_SIZE = 64.0;
	const float LUT_SCALE = ( LUT_SIZE - 1.0 ) / LUT_SIZE;
	const float LUT_BIAS = 0.5 / LUT_SIZE;
	float dotNV = saturate( dot( N, V ) );
	vec2 uv = vec2( roughness, sqrt( 1.0 - dotNV ) );
	uv = uv * LUT_SCALE + LUT_BIAS;
	return uv;
}
float LTC_ClippedSphereFormFactor( const in vec3 f ) {
	float l = length( f );
	return max( ( l * l + f.z ) / ( l + 1.0 ), 0.0 );
}
vec3 LTC_EdgeVectorFormFactor( const in vec3 v1, const in vec3 v2 ) {
	float x = dot( v1, v2 );
	float y = abs( x );
	float a = 0.8543985 + ( 0.4965155 + 0.0145206 * y ) * y;
	float b = 3.4175940 + ( 4.1616724 + y ) * y;
	float v = a / b;
	float theta_sintheta = ( x > 0.0 ) ? v : 0.5 * inversesqrt( max( 1.0 - x * x, 1e-7 ) ) - v;
	return cross( v1, v2 ) * theta_sintheta;
}
vec3 LTC_Evaluate( const in vec3 N, const in vec3 V, const in vec3 P, const in mat3 mInv, const in vec3 rectCoords[ 4 ] ) {
	vec3 v1 = rectCoords[ 1 ] - rectCoords[ 0 ];
	vec3 v2 = rectCoords[ 3 ] - rectCoords[ 0 ];
	vec3 lightNormal = cross( v1, v2 );
	if( dot( lightNormal, P - rectCoords[ 0 ] ) < 0.0 ) return vec3( 0.0 );
	vec3 T1, T2;
	T1 = normalize( V - N * dot( V, N ) );
	T2 = - cross( N, T1 );
	mat3 mat = mInv * transposeMat3( mat3( T1, T2, N ) );
	vec3 coords[ 4 ];
	coords[ 0 ] = mat * ( rectCoords[ 0 ] - P );
	coords[ 1 ] = mat * ( rectCoords[ 1 ] - P );
	coords[ 2 ] = mat * ( rectCoords[ 2 ] - P );
	coords[ 3 ] = mat * ( rectCoords[ 3 ] - P );
	coords[ 0 ] = normalize( coords[ 0 ] );
	coords[ 1 ] = normalize( coords[ 1 ] );
	coords[ 2 ] = normalize( coords[ 2 ] );
	coords[ 3 ] = normalize( coords[ 3 ] );
	vec3 vectorFormFactor = vec3( 0.0 );
	vectorFormFactor += LTC_EdgeVectorFormFactor( coords[ 0 ], coords[ 1 ] );
	vectorFormFactor += LTC_EdgeVectorFormFactor( coords[ 1 ], coords[ 2 ] );
	vectorFormFactor += LTC_EdgeVectorFormFactor( coords[ 2 ], coords[ 3 ] );
	vectorFormFactor += LTC_EdgeVectorFormFactor( coords[ 3 ], coords[ 0 ] );
	float result = LTC_ClippedSphereFormFactor( vectorFormFactor );
	return vec3( result );
}
#if defined( USE_SHEEN )
float D_Charlie( float roughness, float dotNH ) {
	float alpha = pow2( roughness );
	float invAlpha = 1.0 / alpha;
	float cos2h = dotNH * dotNH;
	float sin2h = max( 1.0 - cos2h, 0.0078125 );
	return ( 2.0 + invAlpha ) * pow( sin2h, invAlpha * 0.5 ) / ( 2.0 * PI );
}
float V_Neubelt( float dotNV, float dotNL ) {
	return saturate( 1.0 / ( 4.0 * ( dotNL + dotNV - dotNL * dotNV ) ) );
}
vec3 BRDF_Sheen( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, vec3 sheenColor, const in float sheenRoughness ) {
	vec3 halfDir = normalize( lightDir + viewDir );
	float dotNL = saturate( dot( normal, lightDir ) );
	float dotNV = saturate( dot( normal, viewDir ) );
	float dotNH = saturate( dot( normal, halfDir ) );
	float D = D_Charlie( sheenRoughness, dotNH );
	float V = V_Neubelt( dotNV, dotNL );
	return sheenColor * ( D * V );
}
#endif
float IBLSheenBRDF( const in vec3 normal, const in vec3 viewDir, const in float roughness ) {
	float dotNV = saturate( dot( normal, viewDir ) );
	float r2 = roughness * roughness;
	float a = roughness < 0.25 ? -339.2 * r2 + 161.4 * roughness - 25.9 : -8.48 * r2 + 14.3 * roughness - 9.95;
	float b = roughness < 0.25 ? 44.0 * r2 - 23.7 * roughness + 3.26 : 1.97 * r2 - 3.27 * roughness + 0.72;
	float DG = exp( a * dotNV + b ) + ( roughness < 0.25 ? 0.0 : 0.1 * ( roughness - 0.25 ) );
	return saturate( DG * RECIPROCAL_PI );
}
vec2 DFGApprox( const in vec3 normal, const in vec3 viewDir, const in float roughness ) {
	float dotNV = saturate( dot( normal, viewDir ) );
	const vec4 c0 = vec4( - 1, - 0.0275, - 0.572, 0.022 );
	const vec4 c1 = vec4( 1, 0.0425, 1.04, - 0.04 );
	vec4 r = roughness * c0 + c1;
	float a004 = min( r.x * r.x, exp2( - 9.28 * dotNV ) ) * r.x + r.y;
	vec2 fab = vec2( - 1.04, 1.04 ) * a004 + r.zw;
	return fab;
}
vec3 EnvironmentBRDF( const in vec3 normal, const in vec3 viewDir, const in vec3 specularColor, const in float specularF90, const in float roughness ) {
	vec2 fab = DFGApprox( normal, viewDir, roughness );
	return specularColor * fab.x + specularF90 * fab.y;
}
#ifdef USE_IRIDESCENCE
void computeMultiscatteringIridescence( const in vec3 normal, const in vec3 viewDir, const in vec3 specularColor, const in float specularF90, const in float iridescence, const in vec3 iridescenceF0, const in float roughness, inout vec3 singleScatter, inout vec3 multiScatter ) {
#else
void computeMultiscattering( const in vec3 normal, const in vec3 viewDir, const in vec3 specularColor, const in float specularF90, const in float roughness, inout vec3 singleScatter, inout vec3 multiScatter ) {
#endif
	vec2 fab = DFGApprox( normal, viewDir, roughness );
	#ifdef USE_IRIDESCENCE
		vec3 Fr = mix( specularColor, iridescenceF0, iridescence );
	#else
		vec3 Fr = specularColor;
	#endif
	vec3 FssEss = Fr * fab.x + specularF90 * fab.y;
	float Ess = fab.x + fab.y;
	float Ems = 1.0 - Ess;
	vec3 Favg = Fr + ( 1.0 - Fr ) * 0.047619;	vec3 Fms = FssEss * Favg / ( 1.0 - Ems * Favg );
	singleScatter += FssEss;
	multiScatter += Fms * Ems;
}
#if NUM_RECT_AREA_LIGHTS > 0
	void RE_Direct_RectArea_Physical( const in RectAreaLight rectAreaLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in PhysicalMaterial material, inout ReflectedLight reflectedLight ) {
		vec3 normal = geometryNormal;
		vec3 viewDir = geometryViewDir;
		vec3 position = geometryPosition;
		vec3 lightPos = rectAreaLight.position;
		vec3 halfWidth = rectAreaLight.halfWidth;
		vec3 halfHeight = rectAreaLight.halfHeight;
		vec3 lightColor = rectAreaLight.color;
		float roughness = material.roughness;
		vec3 rectCoords[ 4 ];
		rectCoords[ 0 ] = lightPos + halfWidth - halfHeight;		rectCoords[ 1 ] = lightPos - halfWidth - halfHeight;
		rectCoords[ 2 ] = lightPos - halfWidth + halfHeight;
		rectCoords[ 3 ] = lightPos + halfWidth + halfHeight;
		vec2 uv = LTC_Uv( normal, viewDir, roughness );
		vec4 t1 = texture2D( ltc_1, uv );
		vec4 t2 = texture2D( ltc_2, uv );
		mat3 mInv = mat3(
			vec3( t1.x, 0, t1.y ),
			vec3(    0, 1,    0 ),
			vec3( t1.z, 0, t1.w )
		);
		vec3 fresnel = ( material.specularColor * t2.x + ( vec3( 1.0 ) - material.specularColor ) * t2.y );
		reflectedLight.directSpecular += lightColor * fresnel * LTC_Evaluate( normal, viewDir, position, mInv, rectCoords );
		reflectedLight.directDiffuse += lightColor * material.diffuseColor * LTC_Evaluate( normal, viewDir, position, mat3( 1.0 ), rectCoords );
	}
#endif
void RE_Direct_Physical( const in IncidentLight directLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in PhysicalMaterial material, inout ReflectedLight reflectedLight ) {
	float dotNL = saturate( dot( geometryNormal, directLight.direction ) );
	vec3 irradiance = dotNL * directLight.color;
	#ifdef USE_CLEARCOAT
		float dotNLcc = saturate( dot( geometryClearcoatNormal, directLight.direction ) );
		vec3 ccIrradiance = dotNLcc * directLight.color;
		clearcoatSpecularDirect += ccIrradiance * BRDF_GGX_Clearcoat( directLight.direction, geometryViewDir, geometryClearcoatNormal, material );
	#endif
	#ifdef USE_SHEEN
		sheenSpecularDirect += irradiance * BRDF_Sheen( directLight.direction, geometryViewDir, geometryNormal, material.sheenColor, material.sheenRoughness );
	#endif
	reflectedLight.directSpecular += irradiance * BRDF_GGX( directLight.direction, geometryViewDir, geometryNormal, material );
	reflectedLight.directDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
void RE_IndirectDiffuse_Physical( const in vec3 irradiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in PhysicalMaterial material, inout ReflectedLight reflectedLight ) {
	reflectedLight.indirectDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
void RE_IndirectSpecular_Physical( const in vec3 radiance, const in vec3 irradiance, const in vec3 clearcoatRadiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in PhysicalMaterial material, inout ReflectedLight reflectedLight) {
	#ifdef USE_CLEARCOAT
		clearcoatSpecularIndirect += clearcoatRadiance * EnvironmentBRDF( geometryClearcoatNormal, geometryViewDir, material.clearcoatF0, material.clearcoatF90, material.clearcoatRoughness );
	#endif
	#ifdef USE_SHEEN
		sheenSpecularIndirect += irradiance * material.sheenColor * IBLSheenBRDF( geometryNormal, geometryViewDir, material.sheenRoughness );
	#endif
	vec3 singleScattering = vec3( 0.0 );
	vec3 multiScattering = vec3( 0.0 );
	vec3 cosineWeightedIrradiance = irradiance * RECIPROCAL_PI;
	#ifdef USE_IRIDESCENCE
		computeMultiscatteringIridescence( geometryNormal, geometryViewDir, material.specularColor, material.specularF90, material.iridescence, material.iridescenceFresnel, material.roughness, singleScattering, multiScattering );
	#else
		computeMultiscattering( geometryNormal, geometryViewDir, material.specularColor, material.specularF90, material.roughness, singleScattering, multiScattering );
	#endif
	vec3 totalScattering = singleScattering + multiScattering;
	vec3 diffuse = material.diffuseColor * ( 1.0 - max( max( totalScattering.r, totalScattering.g ), totalScattering.b ) );
	reflectedLight.indirectSpecular += radiance * singleScattering;
	reflectedLight.indirectSpecular += multiScattering * cosineWeightedIrradiance;
	reflectedLight.indirectDiffuse += diffuse * cosineWeightedIrradiance;
}
#define RE_Direct				RE_Direct_Physical
#define RE_Direct_RectArea		RE_Direct_RectArea_Physical
#define RE_IndirectDiffuse		RE_IndirectDiffuse_Physical
#define RE_IndirectSpecular		RE_IndirectSpecular_Physical
float computeSpecularOcclusion( const in float dotNV, const in float ambientOcclusion, const in float roughness ) {
	return saturate( pow( dotNV + ambientOcclusion, exp2( - 16.0 * roughness - 1.0 ) ) - 1.0 + ambientOcclusion );
}`,yr=`
vec3 geometryPosition = - vViewPosition;
vec3 geometryNormal = normal;
vec3 geometryViewDir = ( isOrthographic ) ? vec3( 0, 0, 1 ) : normalize( vViewPosition );
vec3 geometryClearcoatNormal = vec3( 0.0 );
#ifdef USE_CLEARCOAT
	geometryClearcoatNormal = clearcoatNormal;
#endif
#ifdef USE_IRIDESCENCE
	float dotNVi = saturate( dot( normal, geometryViewDir ) );
	if ( material.iridescenceThickness == 0.0 ) {
		material.iridescence = 0.0;
	} else {
		material.iridescence = saturate( material.iridescence );
	}
	if ( material.iridescence > 0.0 ) {
		material.iridescenceFresnel = evalIridescence( 1.0, material.iridescenceIOR, dotNVi, material.iridescenceThickness, material.specularColor );
		material.iridescenceF0 = Schlick_to_F0( material.iridescenceFresnel, 1.0, dotNVi );
	}
#endif
IncidentLight directLight;
#if ( NUM_POINT_LIGHTS > 0 ) && defined( RE_Direct )
	PointLight pointLight;
	#if defined( USE_SHADOWMAP ) && NUM_POINT_LIGHT_SHADOWS > 0
	PointLightShadow pointLightShadow;
	#endif
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_POINT_LIGHTS; i ++ ) {
		pointLight = pointLights[ i ];
		getPointLightInfo( pointLight, geometryPosition, directLight );
		#if defined( USE_SHADOWMAP ) && ( UNROLLED_LOOP_INDEX < NUM_POINT_LIGHT_SHADOWS )
		pointLightShadow = pointLightShadows[ i ];
		directLight.color *= ( directLight.visible && receiveShadow ) ? getPointShadow( pointShadowMap[ i ], pointLightShadow.shadowMapSize, pointLightShadow.shadowIntensity, pointLightShadow.shadowBias, pointLightShadow.shadowRadius, vPointShadowCoord[ i ], pointLightShadow.shadowCameraNear, pointLightShadow.shadowCameraFar ) : 1.0;
		#endif
		RE_Direct( directLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
	}
	#pragma unroll_loop_end
#endif
#if ( NUM_SPOT_LIGHTS > 0 ) && defined( RE_Direct )
	SpotLight spotLight;
	vec4 spotColor;
	vec3 spotLightCoord;
	bool inSpotLightMap;
	#if defined( USE_SHADOWMAP ) && NUM_SPOT_LIGHT_SHADOWS > 0
	SpotLightShadow spotLightShadow;
	#endif
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_SPOT_LIGHTS; i ++ ) {
		spotLight = spotLights[ i ];
		getSpotLightInfo( spotLight, geometryPosition, directLight );
		#if ( UNROLLED_LOOP_INDEX < NUM_SPOT_LIGHT_SHADOWS_WITH_MAPS )
		#define SPOT_LIGHT_MAP_INDEX UNROLLED_LOOP_INDEX
		#elif ( UNROLLED_LOOP_INDEX < NUM_SPOT_LIGHT_SHADOWS )
		#define SPOT_LIGHT_MAP_INDEX NUM_SPOT_LIGHT_MAPS
		#else
		#define SPOT_LIGHT_MAP_INDEX ( UNROLLED_LOOP_INDEX - NUM_SPOT_LIGHT_SHADOWS + NUM_SPOT_LIGHT_SHADOWS_WITH_MAPS )
		#endif
		#if ( SPOT_LIGHT_MAP_INDEX < NUM_SPOT_LIGHT_MAPS )
			spotLightCoord = vSpotLightCoord[ i ].xyz / vSpotLightCoord[ i ].w;
			inSpotLightMap = all( lessThan( abs( spotLightCoord * 2. - 1. ), vec3( 1.0 ) ) );
			spotColor = texture2D( spotLightMap[ SPOT_LIGHT_MAP_INDEX ], spotLightCoord.xy );
			directLight.color = inSpotLightMap ? directLight.color * spotColor.rgb : directLight.color;
		#endif
		#undef SPOT_LIGHT_MAP_INDEX
		#if defined( USE_SHADOWMAP ) && ( UNROLLED_LOOP_INDEX < NUM_SPOT_LIGHT_SHADOWS )
		spotLightShadow = spotLightShadows[ i ];
		directLight.color *= ( directLight.visible && receiveShadow ) ? getShadow( spotShadowMap[ i ], spotLightShadow.shadowMapSize, spotLightShadow.shadowIntensity, spotLightShadow.shadowBias, spotLightShadow.shadowRadius, vSpotLightCoord[ i ] ) : 1.0;
		#endif
		RE_Direct( directLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
	}
	#pragma unroll_loop_end
#endif
#if ( NUM_DIR_LIGHTS > 0 ) && defined( RE_Direct )
	DirectionalLight directionalLight;
	#if defined( USE_SHADOWMAP ) && NUM_DIR_LIGHT_SHADOWS > 0
	DirectionalLightShadow directionalLightShadow;
	#endif
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_DIR_LIGHTS; i ++ ) {
		directionalLight = directionalLights[ i ];
		getDirectionalLightInfo( directionalLight, directLight );
		#if defined( USE_SHADOWMAP ) && ( UNROLLED_LOOP_INDEX < NUM_DIR_LIGHT_SHADOWS )
		directionalLightShadow = directionalLightShadows[ i ];
		directLight.color *= ( directLight.visible && receiveShadow ) ? getShadow( directionalShadowMap[ i ], directionalLightShadow.shadowMapSize, directionalLightShadow.shadowIntensity, directionalLightShadow.shadowBias, directionalLightShadow.shadowRadius, vDirectionalShadowCoord[ i ] ) : 1.0;
		#endif
		RE_Direct( directLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
	}
	#pragma unroll_loop_end
#endif
#if ( NUM_RECT_AREA_LIGHTS > 0 ) && defined( RE_Direct_RectArea )
	RectAreaLight rectAreaLight;
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_RECT_AREA_LIGHTS; i ++ ) {
		rectAreaLight = rectAreaLights[ i ];
		RE_Direct_RectArea( rectAreaLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
	}
	#pragma unroll_loop_end
#endif
#if defined( RE_IndirectDiffuse )
	vec3 iblIrradiance = vec3( 0.0 );
	vec3 irradiance = getAmbientLightIrradiance( ambientLightColor );
	#if defined( USE_LIGHT_PROBES )
		irradiance += getLightProbeIrradiance( lightProbe, geometryNormal );
	#endif
	#if ( NUM_HEMI_LIGHTS > 0 )
		#pragma unroll_loop_start
		for ( int i = 0; i < NUM_HEMI_LIGHTS; i ++ ) {
			irradiance += getHemisphereLightIrradiance( hemisphereLights[ i ], geometryNormal );
		}
		#pragma unroll_loop_end
	#endif
#endif
#if defined( RE_IndirectSpecular )
	vec3 radiance = vec3( 0.0 );
	vec3 clearcoatRadiance = vec3( 0.0 );
#endif`,Mr=`#if defined( RE_IndirectDiffuse )
	#ifdef USE_LIGHTMAP
		vec4 lightMapTexel = texture2D( lightMap, vLightMapUv );
		vec3 lightMapIrradiance = lightMapTexel.rgb * lightMapIntensity;
		irradiance += lightMapIrradiance;
	#endif
	#if defined( USE_ENVMAP ) && defined( STANDARD ) && defined( ENVMAP_TYPE_CUBE_UV )
		iblIrradiance += getIBLIrradiance( geometryNormal );
	#endif
#endif
#if defined( USE_ENVMAP ) && defined( RE_IndirectSpecular )
	#ifdef USE_ANISOTROPY
		radiance += getIBLAnisotropyRadiance( geometryViewDir, geometryNormal, material.roughness, material.anisotropyB, material.anisotropy );
	#else
		radiance += getIBLRadiance( geometryViewDir, geometryNormal, material.roughness );
	#endif
	#ifdef USE_CLEARCOAT
		clearcoatRadiance += getIBLRadiance( geometryViewDir, geometryClearcoatNormal, material.clearcoatRoughness );
	#endif
#endif`,br=`#if defined( RE_IndirectDiffuse )
	RE_IndirectDiffuse( irradiance, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
#endif
#if defined( RE_IndirectSpecular )
	RE_IndirectSpecular( radiance, iblIrradiance, clearcoatRadiance, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
#endif`,Sr=`#if defined( USE_LOGDEPTHBUF )
	gl_FragDepth = vIsPerspective == 0.0 ? gl_FragCoord.z : log2( vFragDepth ) * logDepthBufFC * 0.5;
#endif`,wr=`#if defined( USE_LOGDEPTHBUF )
	uniform float logDepthBufFC;
	varying float vFragDepth;
	varying float vIsPerspective;
#endif`,Er=`#ifdef USE_LOGDEPTHBUF
	varying float vFragDepth;
	varying float vIsPerspective;
#endif`,Tr=`#ifdef USE_LOGDEPTHBUF
	vFragDepth = 1.0 + gl_Position.w;
	vIsPerspective = float( isPerspectiveMatrix( projectionMatrix ) );
#endif`,Ar=`#ifdef USE_MAP
	vec4 sampledDiffuseColor = texture2D( map, vMapUv );
	#ifdef DECODE_VIDEO_TEXTURE
		sampledDiffuseColor = vec4( mix( pow( sampledDiffuseColor.rgb * 0.9478672986 + vec3( 0.0521327014 ), vec3( 2.4 ) ), sampledDiffuseColor.rgb * 0.0773993808, vec3( lessThanEqual( sampledDiffuseColor.rgb, vec3( 0.04045 ) ) ) ), sampledDiffuseColor.w );
	
	#endif
	diffuseColor *= sampledDiffuseColor;
#endif`,Rr=`#ifdef USE_MAP
	uniform sampler2D map;
#endif`,Cr=`#if defined( USE_MAP ) || defined( USE_ALPHAMAP )
	#if defined( USE_POINTS_UV )
		vec2 uv = vUv;
	#else
		vec2 uv = ( uvTransform * vec3( gl_PointCoord.x, 1.0 - gl_PointCoord.y, 1 ) ).xy;
	#endif
#endif
#ifdef USE_MAP
	diffuseColor *= texture2D( map, uv );
#endif
#ifdef USE_ALPHAMAP
	diffuseColor.a *= texture2D( alphaMap, uv ).g;
#endif`,Pr=`#if defined( USE_POINTS_UV )
	varying vec2 vUv;
#else
	#if defined( USE_MAP ) || defined( USE_ALPHAMAP )
		uniform mat3 uvTransform;
	#endif
#endif
#ifdef USE_MAP
	uniform sampler2D map;
#endif
#ifdef USE_ALPHAMAP
	uniform sampler2D alphaMap;
#endif`,Ir=`float metalnessFactor = metalness;
#ifdef USE_METALNESSMAP
	vec4 texelMetalness = texture2D( metalnessMap, vMetalnessMapUv );
	metalnessFactor *= texelMetalness.b;
#endif`,Lr=`#ifdef USE_METALNESSMAP
	uniform sampler2D metalnessMap;
#endif`,Dr=`#ifdef USE_INSTANCING_MORPH
	float morphTargetInfluences[ MORPHTARGETS_COUNT ];
	float morphTargetBaseInfluence = texelFetch( morphTexture, ivec2( 0, gl_InstanceID ), 0 ).r;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		morphTargetInfluences[i] =  texelFetch( morphTexture, ivec2( i + 1, gl_InstanceID ), 0 ).r;
	}
#endif`,Ur=`#if defined( USE_MORPHCOLORS )
	vColor *= morphTargetBaseInfluence;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		#if defined( USE_COLOR_ALPHA )
			if ( morphTargetInfluences[ i ] != 0.0 ) vColor += getMorph( gl_VertexID, i, 2 ) * morphTargetInfluences[ i ];
		#elif defined( USE_COLOR )
			if ( morphTargetInfluences[ i ] != 0.0 ) vColor += getMorph( gl_VertexID, i, 2 ).rgb * morphTargetInfluences[ i ];
		#endif
	}
#endif`,Nr=`#ifdef USE_MORPHNORMALS
	objectNormal *= morphTargetBaseInfluence;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		if ( morphTargetInfluences[ i ] != 0.0 ) objectNormal += getMorph( gl_VertexID, i, 1 ).xyz * morphTargetInfluences[ i ];
	}
#endif`,Fr=`#ifdef USE_MORPHTARGETS
	#ifndef USE_INSTANCING_MORPH
		uniform float morphTargetBaseInfluence;
		uniform float morphTargetInfluences[ MORPHTARGETS_COUNT ];
	#endif
	uniform sampler2DArray morphTargetsTexture;
	uniform ivec2 morphTargetsTextureSize;
	vec4 getMorph( const in int vertexIndex, const in int morphTargetIndex, const in int offset ) {
		int texelIndex = vertexIndex * MORPHTARGETS_TEXTURE_STRIDE + offset;
		int y = texelIndex / morphTargetsTextureSize.x;
		int x = texelIndex - y * morphTargetsTextureSize.x;
		ivec3 morphUV = ivec3( x, y, morphTargetIndex );
		return texelFetch( morphTargetsTexture, morphUV, 0 );
	}
#endif`,Or=`#ifdef USE_MORPHTARGETS
	transformed *= morphTargetBaseInfluence;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		if ( morphTargetInfluences[ i ] != 0.0 ) transformed += getMorph( gl_VertexID, i, 0 ).xyz * morphTargetInfluences[ i ];
	}
#endif`,kr=`float faceDirection = gl_FrontFacing ? 1.0 : - 1.0;
#ifdef FLAT_SHADED
	vec3 fdx = dFdx( vViewPosition );
	vec3 fdy = dFdy( vViewPosition );
	vec3 normal = normalize( cross( fdx, fdy ) );
#else
	vec3 normal = normalize( vNormal );
	#ifdef DOUBLE_SIDED
		normal *= faceDirection;
	#endif
#endif
#if defined( USE_NORMALMAP_TANGENTSPACE ) || defined( USE_CLEARCOAT_NORMALMAP ) || defined( USE_ANISOTROPY )
	#ifdef USE_TANGENT
		mat3 tbn = mat3( normalize( vTangent ), normalize( vBitangent ), normal );
	#else
		mat3 tbn = getTangentFrame( - vViewPosition, normal,
		#if defined( USE_NORMALMAP )
			vNormalMapUv
		#elif defined( USE_CLEARCOAT_NORMALMAP )
			vClearcoatNormalMapUv
		#else
			vUv
		#endif
		);
	#endif
	#if defined( DOUBLE_SIDED ) && ! defined( FLAT_SHADED )
		tbn[0] *= faceDirection;
		tbn[1] *= faceDirection;
	#endif
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	#ifdef USE_TANGENT
		mat3 tbn2 = mat3( normalize( vTangent ), normalize( vBitangent ), normal );
	#else
		mat3 tbn2 = getTangentFrame( - vViewPosition, normal, vClearcoatNormalMapUv );
	#endif
	#if defined( DOUBLE_SIDED ) && ! defined( FLAT_SHADED )
		tbn2[0] *= faceDirection;
		tbn2[1] *= faceDirection;
	#endif
#endif
vec3 nonPerturbedNormal = normal;`,Br=`#ifdef USE_NORMALMAP_OBJECTSPACE
	normal = texture2D( normalMap, vNormalMapUv ).xyz * 2.0 - 1.0;
	#ifdef FLIP_SIDED
		normal = - normal;
	#endif
	#ifdef DOUBLE_SIDED
		normal = normal * faceDirection;
	#endif
	normal = normalize( normalMatrix * normal );
#elif defined( USE_NORMALMAP_TANGENTSPACE )
	vec3 mapN = texture2D( normalMap, vNormalMapUv ).xyz * 2.0 - 1.0;
	mapN.xy *= normalScale;
	normal = normalize( tbn * mapN );
#elif defined( USE_BUMPMAP )
	normal = perturbNormalArb( - vViewPosition, normal, dHdxy_fwd(), faceDirection );
#endif`,zr=`#ifndef FLAT_SHADED
	varying vec3 vNormal;
	#ifdef USE_TANGENT
		varying vec3 vTangent;
		varying vec3 vBitangent;
	#endif
#endif`,Vr=`#ifndef FLAT_SHADED
	varying vec3 vNormal;
	#ifdef USE_TANGENT
		varying vec3 vTangent;
		varying vec3 vBitangent;
	#endif
#endif`,Hr=`#ifndef FLAT_SHADED
	vNormal = normalize( transformedNormal );
	#ifdef USE_TANGENT
		vTangent = normalize( transformedTangent );
		vBitangent = normalize( cross( vNormal, vTangent ) * tangent.w );
	#endif
#endif`,Gr=`#ifdef USE_NORMALMAP
	uniform sampler2D normalMap;
	uniform vec2 normalScale;
#endif
#ifdef USE_NORMALMAP_OBJECTSPACE
	uniform mat3 normalMatrix;
#endif
#if ! defined ( USE_TANGENT ) && ( defined ( USE_NORMALMAP_TANGENTSPACE ) || defined ( USE_CLEARCOAT_NORMALMAP ) || defined( USE_ANISOTROPY ) )
	mat3 getTangentFrame( vec3 eye_pos, vec3 surf_norm, vec2 uv ) {
		vec3 q0 = dFdx( eye_pos.xyz );
		vec3 q1 = dFdy( eye_pos.xyz );
		vec2 st0 = dFdx( uv.st );
		vec2 st1 = dFdy( uv.st );
		vec3 N = surf_norm;
		vec3 q1perp = cross( q1, N );
		vec3 q0perp = cross( N, q0 );
		vec3 T = q1perp * st0.x + q0perp * st1.x;
		vec3 B = q1perp * st0.y + q0perp * st1.y;
		float det = max( dot( T, T ), dot( B, B ) );
		float scale = ( det == 0.0 ) ? 0.0 : inversesqrt( det );
		return mat3( T * scale, B * scale, N );
	}
#endif`,Wr=`#ifdef USE_CLEARCOAT
	vec3 clearcoatNormal = nonPerturbedNormal;
#endif`,Xr=`#ifdef USE_CLEARCOAT_NORMALMAP
	vec3 clearcoatMapN = texture2D( clearcoatNormalMap, vClearcoatNormalMapUv ).xyz * 2.0 - 1.0;
	clearcoatMapN.xy *= clearcoatNormalScale;
	clearcoatNormal = normalize( tbn2 * clearcoatMapN );
#endif`,qr=`#ifdef USE_CLEARCOATMAP
	uniform sampler2D clearcoatMap;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	uniform sampler2D clearcoatNormalMap;
	uniform vec2 clearcoatNormalScale;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	uniform sampler2D clearcoatRoughnessMap;
#endif`,Yr=`#ifdef USE_IRIDESCENCEMAP
	uniform sampler2D iridescenceMap;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	uniform sampler2D iridescenceThicknessMap;
#endif`,Zr=`#ifdef OPAQUE
diffuseColor.a = 1.0;
#endif
#ifdef USE_TRANSMISSION
diffuseColor.a *= material.transmissionAlpha;
#endif
gl_FragColor = vec4( outgoingLight, diffuseColor.a );`,$r=`vec3 packNormalToRGB( const in vec3 normal ) {
	return normalize( normal ) * 0.5 + 0.5;
}
vec3 unpackRGBToNormal( const in vec3 rgb ) {
	return 2.0 * rgb.xyz - 1.0;
}
const float PackUpscale = 256. / 255.;const float UnpackDownscale = 255. / 256.;const float ShiftRight8 = 1. / 256.;
const float Inv255 = 1. / 255.;
const vec4 PackFactors = vec4( 1.0, 256.0, 256.0 * 256.0, 256.0 * 256.0 * 256.0 );
const vec2 UnpackFactors2 = vec2( UnpackDownscale, 1.0 / PackFactors.g );
const vec3 UnpackFactors3 = vec3( UnpackDownscale / PackFactors.rg, 1.0 / PackFactors.b );
const vec4 UnpackFactors4 = vec4( UnpackDownscale / PackFactors.rgb, 1.0 / PackFactors.a );
vec4 packDepthToRGBA( const in float v ) {
	if( v <= 0.0 )
		return vec4( 0., 0., 0., 0. );
	if( v >= 1.0 )
		return vec4( 1., 1., 1., 1. );
	float vuf;
	float af = modf( v * PackFactors.a, vuf );
	float bf = modf( vuf * ShiftRight8, vuf );
	float gf = modf( vuf * ShiftRight8, vuf );
	return vec4( vuf * Inv255, gf * PackUpscale, bf * PackUpscale, af );
}
vec3 packDepthToRGB( const in float v ) {
	if( v <= 0.0 )
		return vec3( 0., 0., 0. );
	if( v >= 1.0 )
		return vec3( 1., 1., 1. );
	float vuf;
	float bf = modf( v * PackFactors.b, vuf );
	float gf = modf( vuf * ShiftRight8, vuf );
	return vec3( vuf * Inv255, gf * PackUpscale, bf );
}
vec2 packDepthToRG( const in float v ) {
	if( v <= 0.0 )
		return vec2( 0., 0. );
	if( v >= 1.0 )
		return vec2( 1., 1. );
	float vuf;
	float gf = modf( v * 256., vuf );
	return vec2( vuf * Inv255, gf );
}
float unpackRGBAToDepth( const in vec4 v ) {
	return dot( v, UnpackFactors4 );
}
float unpackRGBToDepth( const in vec3 v ) {
	return dot( v, UnpackFactors3 );
}
float unpackRGToDepth( const in vec2 v ) {
	return v.r * UnpackFactors2.r + v.g * UnpackFactors2.g;
}
vec4 pack2HalfToRGBA( const in vec2 v ) {
	vec4 r = vec4( v.x, fract( v.x * 255.0 ), v.y, fract( v.y * 255.0 ) );
	return vec4( r.x - r.y / 255.0, r.y, r.z - r.w / 255.0, r.w );
}
vec2 unpackRGBATo2Half( const in vec4 v ) {
	return vec2( v.x + ( v.y / 255.0 ), v.z + ( v.w / 255.0 ) );
}
float viewZToOrthographicDepth( const in float viewZ, const in float near, const in float far ) {
	return ( viewZ + near ) / ( near - far );
}
float orthographicDepthToViewZ( const in float depth, const in float near, const in float far ) {
	return depth * ( near - far ) - near;
}
float viewZToPerspectiveDepth( const in float viewZ, const in float near, const in float far ) {
	return ( ( near + viewZ ) * far ) / ( ( far - near ) * viewZ );
}
float perspectiveDepthToViewZ( const in float depth, const in float near, const in float far ) {
	return ( near * far ) / ( ( far - near ) * depth - far );
}`,Jr=`#ifdef PREMULTIPLIED_ALPHA
	gl_FragColor.rgb *= gl_FragColor.a;
#endif`,Kr=`vec4 mvPosition = vec4( transformed, 1.0 );
#ifdef USE_BATCHING
	mvPosition = batchingMatrix * mvPosition;
#endif
#ifdef USE_INSTANCING
	mvPosition = instanceMatrix * mvPosition;
#endif
mvPosition = modelViewMatrix * mvPosition;
gl_Position = projectionMatrix * mvPosition;`,jr=`#ifdef DITHERING
	gl_FragColor.rgb = dithering( gl_FragColor.rgb );
#endif`,Qr=`#ifdef DITHERING
	vec3 dithering( vec3 color ) {
		float grid_position = rand( gl_FragCoord.xy );
		vec3 dither_shift_RGB = vec3( 0.25 / 255.0, -0.25 / 255.0, 0.25 / 255.0 );
		dither_shift_RGB = mix( 2.0 * dither_shift_RGB, -2.0 * dither_shift_RGB, grid_position );
		return color + dither_shift_RGB;
	}
#endif`,ea=`float roughnessFactor = roughness;
#ifdef USE_ROUGHNESSMAP
	vec4 texelRoughness = texture2D( roughnessMap, vRoughnessMapUv );
	roughnessFactor *= texelRoughness.g;
#endif`,ta=`#ifdef USE_ROUGHNESSMAP
	uniform sampler2D roughnessMap;
#endif`,na=`#if NUM_SPOT_LIGHT_COORDS > 0
	varying vec4 vSpotLightCoord[ NUM_SPOT_LIGHT_COORDS ];
#endif
#if NUM_SPOT_LIGHT_MAPS > 0
	uniform sampler2D spotLightMap[ NUM_SPOT_LIGHT_MAPS ];
#endif
#ifdef USE_SHADOWMAP
	#if NUM_DIR_LIGHT_SHADOWS > 0
		uniform sampler2D directionalShadowMap[ NUM_DIR_LIGHT_SHADOWS ];
		varying vec4 vDirectionalShadowCoord[ NUM_DIR_LIGHT_SHADOWS ];
		struct DirectionalLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
		};
		uniform DirectionalLightShadow directionalLightShadows[ NUM_DIR_LIGHT_SHADOWS ];
	#endif
	#if NUM_SPOT_LIGHT_SHADOWS > 0
		uniform sampler2D spotShadowMap[ NUM_SPOT_LIGHT_SHADOWS ];
		struct SpotLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
		};
		uniform SpotLightShadow spotLightShadows[ NUM_SPOT_LIGHT_SHADOWS ];
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0
		uniform sampler2D pointShadowMap[ NUM_POINT_LIGHT_SHADOWS ];
		varying vec4 vPointShadowCoord[ NUM_POINT_LIGHT_SHADOWS ];
		struct PointLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
			float shadowCameraNear;
			float shadowCameraFar;
		};
		uniform PointLightShadow pointLightShadows[ NUM_POINT_LIGHT_SHADOWS ];
	#endif
	float texture2DCompare( sampler2D depths, vec2 uv, float compare ) {
		return step( compare, unpackRGBAToDepth( texture2D( depths, uv ) ) );
	}
	vec2 texture2DDistribution( sampler2D shadow, vec2 uv ) {
		return unpackRGBATo2Half( texture2D( shadow, uv ) );
	}
	float VSMShadow (sampler2D shadow, vec2 uv, float compare ){
		float occlusion = 1.0;
		vec2 distribution = texture2DDistribution( shadow, uv );
		float hard_shadow = step( compare , distribution.x );
		if (hard_shadow != 1.0 ) {
			float distance = compare - distribution.x ;
			float variance = max( 0.00000, distribution.y * distribution.y );
			float softness_probability = variance / (variance + distance * distance );			softness_probability = clamp( ( softness_probability - 0.3 ) / ( 0.95 - 0.3 ), 0.0, 1.0 );			occlusion = clamp( max( hard_shadow, softness_probability ), 0.0, 1.0 );
		}
		return occlusion;
	}
	float getShadow( sampler2D shadowMap, vec2 shadowMapSize, float shadowIntensity, float shadowBias, float shadowRadius, vec4 shadowCoord ) {
		float shadow = 1.0;
		shadowCoord.xyz /= shadowCoord.w;
		shadowCoord.z += shadowBias;
		bool inFrustum = shadowCoord.x >= 0.0 && shadowCoord.x <= 1.0 && shadowCoord.y >= 0.0 && shadowCoord.y <= 1.0;
		bool frustumTest = inFrustum && shadowCoord.z <= 1.0;
		if ( frustumTest ) {
		#if defined( SHADOWMAP_TYPE_PCF )
			vec2 texelSize = vec2( 1.0 ) / shadowMapSize;
			float dx0 = - texelSize.x * shadowRadius;
			float dy0 = - texelSize.y * shadowRadius;
			float dx1 = + texelSize.x * shadowRadius;
			float dy1 = + texelSize.y * shadowRadius;
			float dx2 = dx0 / 2.0;
			float dy2 = dy0 / 2.0;
			float dx3 = dx1 / 2.0;
			float dy3 = dy1 / 2.0;
			shadow = (
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx0, dy0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( 0.0, dy0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx1, dy0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx2, dy2 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( 0.0, dy2 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx3, dy2 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx0, 0.0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx2, 0.0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy, shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx3, 0.0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx1, 0.0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx2, dy3 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( 0.0, dy3 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx3, dy3 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx0, dy1 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( 0.0, dy1 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx1, dy1 ), shadowCoord.z )
			) * ( 1.0 / 17.0 );
		#elif defined( SHADOWMAP_TYPE_PCF_SOFT )
			vec2 texelSize = vec2( 1.0 ) / shadowMapSize;
			float dx = texelSize.x;
			float dy = texelSize.y;
			vec2 uv = shadowCoord.xy;
			vec2 f = fract( uv * shadowMapSize + 0.5 );
			uv -= f * texelSize;
			shadow = (
				texture2DCompare( shadowMap, uv, shadowCoord.z ) +
				texture2DCompare( shadowMap, uv + vec2( dx, 0.0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, uv + vec2( 0.0, dy ), shadowCoord.z ) +
				texture2DCompare( shadowMap, uv + texelSize, shadowCoord.z ) +
				mix( texture2DCompare( shadowMap, uv + vec2( -dx, 0.0 ), shadowCoord.z ),
					 texture2DCompare( shadowMap, uv + vec2( 2.0 * dx, 0.0 ), shadowCoord.z ),
					 f.x ) +
				mix( texture2DCompare( shadowMap, uv + vec2( -dx, dy ), shadowCoord.z ),
					 texture2DCompare( shadowMap, uv + vec2( 2.0 * dx, dy ), shadowCoord.z ),
					 f.x ) +
				mix( texture2DCompare( shadowMap, uv + vec2( 0.0, -dy ), shadowCoord.z ),
					 texture2DCompare( shadowMap, uv + vec2( 0.0, 2.0 * dy ), shadowCoord.z ),
					 f.y ) +
				mix( texture2DCompare( shadowMap, uv + vec2( dx, -dy ), shadowCoord.z ),
					 texture2DCompare( shadowMap, uv + vec2( dx, 2.0 * dy ), shadowCoord.z ),
					 f.y ) +
				mix( mix( texture2DCompare( shadowMap, uv + vec2( -dx, -dy ), shadowCoord.z ),
						  texture2DCompare( shadowMap, uv + vec2( 2.0 * dx, -dy ), shadowCoord.z ),
						  f.x ),
					 mix( texture2DCompare( shadowMap, uv + vec2( -dx, 2.0 * dy ), shadowCoord.z ),
						  texture2DCompare( shadowMap, uv + vec2( 2.0 * dx, 2.0 * dy ), shadowCoord.z ),
						  f.x ),
					 f.y )
			) * ( 1.0 / 9.0 );
		#elif defined( SHADOWMAP_TYPE_VSM )
			shadow = VSMShadow( shadowMap, shadowCoord.xy, shadowCoord.z );
		#else
			shadow = texture2DCompare( shadowMap, shadowCoord.xy, shadowCoord.z );
		#endif
		}
		return mix( 1.0, shadow, shadowIntensity );
	}
	vec2 cubeToUV( vec3 v, float texelSizeY ) {
		vec3 absV = abs( v );
		float scaleToCube = 1.0 / max( absV.x, max( absV.y, absV.z ) );
		absV *= scaleToCube;
		v *= scaleToCube * ( 1.0 - 2.0 * texelSizeY );
		vec2 planar = v.xy;
		float almostATexel = 1.5 * texelSizeY;
		float almostOne = 1.0 - almostATexel;
		if ( absV.z >= almostOne ) {
			if ( v.z > 0.0 )
				planar.x = 4.0 - v.x;
		} else if ( absV.x >= almostOne ) {
			float signX = sign( v.x );
			planar.x = v.z * signX + 2.0 * signX;
		} else if ( absV.y >= almostOne ) {
			float signY = sign( v.y );
			planar.x = v.x + 2.0 * signY + 2.0;
			planar.y = v.z * signY - 2.0;
		}
		return vec2( 0.125, 0.25 ) * planar + vec2( 0.375, 0.75 );
	}
	float getPointShadow( sampler2D shadowMap, vec2 shadowMapSize, float shadowIntensity, float shadowBias, float shadowRadius, vec4 shadowCoord, float shadowCameraNear, float shadowCameraFar ) {
		float shadow = 1.0;
		vec3 lightToPosition = shadowCoord.xyz;
		
		float lightToPositionLength = length( lightToPosition );
		if ( lightToPositionLength - shadowCameraFar <= 0.0 && lightToPositionLength - shadowCameraNear >= 0.0 ) {
			float dp = ( lightToPositionLength - shadowCameraNear ) / ( shadowCameraFar - shadowCameraNear );			dp += shadowBias;
			vec3 bd3D = normalize( lightToPosition );
			vec2 texelSize = vec2( 1.0 ) / ( shadowMapSize * vec2( 4.0, 2.0 ) );
			#if defined( SHADOWMAP_TYPE_PCF ) || defined( SHADOWMAP_TYPE_PCF_SOFT ) || defined( SHADOWMAP_TYPE_VSM )
				vec2 offset = vec2( - 1, 1 ) * shadowRadius * texelSize.y;
				shadow = (
					texture2DCompare( shadowMap, cubeToUV( bd3D + offset.xyy, texelSize.y ), dp ) +
					texture2DCompare( shadowMap, cubeToUV( bd3D + offset.yyy, texelSize.y ), dp ) +
					texture2DCompare( shadowMap, cubeToUV( bd3D + offset.xyx, texelSize.y ), dp ) +
					texture2DCompare( shadowMap, cubeToUV( bd3D + offset.yyx, texelSize.y ), dp ) +
					texture2DCompare( shadowMap, cubeToUV( bd3D, texelSize.y ), dp ) +
					texture2DCompare( shadowMap, cubeToUV( bd3D + offset.xxy, texelSize.y ), dp ) +
					texture2DCompare( shadowMap, cubeToUV( bd3D + offset.yxy, texelSize.y ), dp ) +
					texture2DCompare( shadowMap, cubeToUV( bd3D + offset.xxx, texelSize.y ), dp ) +
					texture2DCompare( shadowMap, cubeToUV( bd3D + offset.yxx, texelSize.y ), dp )
				) * ( 1.0 / 9.0 );
			#else
				shadow = texture2DCompare( shadowMap, cubeToUV( bd3D, texelSize.y ), dp );
			#endif
		}
		return mix( 1.0, shadow, shadowIntensity );
	}
#endif`,ia=`#if NUM_SPOT_LIGHT_COORDS > 0
	uniform mat4 spotLightMatrix[ NUM_SPOT_LIGHT_COORDS ];
	varying vec4 vSpotLightCoord[ NUM_SPOT_LIGHT_COORDS ];
#endif
#ifdef USE_SHADOWMAP
	#if NUM_DIR_LIGHT_SHADOWS > 0
		uniform mat4 directionalShadowMatrix[ NUM_DIR_LIGHT_SHADOWS ];
		varying vec4 vDirectionalShadowCoord[ NUM_DIR_LIGHT_SHADOWS ];
		struct DirectionalLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
		};
		uniform DirectionalLightShadow directionalLightShadows[ NUM_DIR_LIGHT_SHADOWS ];
	#endif
	#if NUM_SPOT_LIGHT_SHADOWS > 0
		struct SpotLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
		};
		uniform SpotLightShadow spotLightShadows[ NUM_SPOT_LIGHT_SHADOWS ];
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0
		uniform mat4 pointShadowMatrix[ NUM_POINT_LIGHT_SHADOWS ];
		varying vec4 vPointShadowCoord[ NUM_POINT_LIGHT_SHADOWS ];
		struct PointLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
			float shadowCameraNear;
			float shadowCameraFar;
		};
		uniform PointLightShadow pointLightShadows[ NUM_POINT_LIGHT_SHADOWS ];
	#endif
#endif`,sa=`#if ( defined( USE_SHADOWMAP ) && ( NUM_DIR_LIGHT_SHADOWS > 0 || NUM_POINT_LIGHT_SHADOWS > 0 ) ) || ( NUM_SPOT_LIGHT_COORDS > 0 )
	vec3 shadowWorldNormal = inverseTransformDirection( transformedNormal, viewMatrix );
	vec4 shadowWorldPosition;
#endif
#if defined( USE_SHADOWMAP )
	#if NUM_DIR_LIGHT_SHADOWS > 0
		#pragma unroll_loop_start
		for ( int i = 0; i < NUM_DIR_LIGHT_SHADOWS; i ++ ) {
			shadowWorldPosition = worldPosition + vec4( shadowWorldNormal * directionalLightShadows[ i ].shadowNormalBias, 0 );
			vDirectionalShadowCoord[ i ] = directionalShadowMatrix[ i ] * shadowWorldPosition;
		}
		#pragma unroll_loop_end
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0
		#pragma unroll_loop_start
		for ( int i = 0; i < NUM_POINT_LIGHT_SHADOWS; i ++ ) {
			shadowWorldPosition = worldPosition + vec4( shadowWorldNormal * pointLightShadows[ i ].shadowNormalBias, 0 );
			vPointShadowCoord[ i ] = pointShadowMatrix[ i ] * shadowWorldPosition;
		}
		#pragma unroll_loop_end
	#endif
#endif
#if NUM_SPOT_LIGHT_COORDS > 0
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_SPOT_LIGHT_COORDS; i ++ ) {
		shadowWorldPosition = worldPosition;
		#if ( defined( USE_SHADOWMAP ) && UNROLLED_LOOP_INDEX < NUM_SPOT_LIGHT_SHADOWS )
			shadowWorldPosition.xyz += shadowWorldNormal * spotLightShadows[ i ].shadowNormalBias;
		#endif
		vSpotLightCoord[ i ] = spotLightMatrix[ i ] * shadowWorldPosition;
	}
	#pragma unroll_loop_end
#endif`,ra=`float getShadowMask() {
	float shadow = 1.0;
	#ifdef USE_SHADOWMAP
	#if NUM_DIR_LIGHT_SHADOWS > 0
	DirectionalLightShadow directionalLight;
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_DIR_LIGHT_SHADOWS; i ++ ) {
		directionalLight = directionalLightShadows[ i ];
		shadow *= receiveShadow ? getShadow( directionalShadowMap[ i ], directionalLight.shadowMapSize, directionalLight.shadowIntensity, directionalLight.shadowBias, directionalLight.shadowRadius, vDirectionalShadowCoord[ i ] ) : 1.0;
	}
	#pragma unroll_loop_end
	#endif
	#if NUM_SPOT_LIGHT_SHADOWS > 0
	SpotLightShadow spotLight;
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_SPOT_LIGHT_SHADOWS; i ++ ) {
		spotLight = spotLightShadows[ i ];
		shadow *= receiveShadow ? getShadow( spotShadowMap[ i ], spotLight.shadowMapSize, spotLight.shadowIntensity, spotLight.shadowBias, spotLight.shadowRadius, vSpotLightCoord[ i ] ) : 1.0;
	}
	#pragma unroll_loop_end
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0
	PointLightShadow pointLight;
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_POINT_LIGHT_SHADOWS; i ++ ) {
		pointLight = pointLightShadows[ i ];
		shadow *= receiveShadow ? getPointShadow( pointShadowMap[ i ], pointLight.shadowMapSize, pointLight.shadowIntensity, pointLight.shadowBias, pointLight.shadowRadius, vPointShadowCoord[ i ], pointLight.shadowCameraNear, pointLight.shadowCameraFar ) : 1.0;
	}
	#pragma unroll_loop_end
	#endif
	#endif
	return shadow;
}`,aa=`#ifdef USE_SKINNING
	mat4 boneMatX = getBoneMatrix( skinIndex.x );
	mat4 boneMatY = getBoneMatrix( skinIndex.y );
	mat4 boneMatZ = getBoneMatrix( skinIndex.z );
	mat4 boneMatW = getBoneMatrix( skinIndex.w );
#endif`,oa=`#ifdef USE_SKINNING
	uniform mat4 bindMatrix;
	uniform mat4 bindMatrixInverse;
	uniform highp sampler2D boneTexture;
	mat4 getBoneMatrix( const in float i ) {
		int size = textureSize( boneTexture, 0 ).x;
		int j = int( i ) * 4;
		int x = j % size;
		int y = j / size;
		vec4 v1 = texelFetch( boneTexture, ivec2( x, y ), 0 );
		vec4 v2 = texelFetch( boneTexture, ivec2( x + 1, y ), 0 );
		vec4 v3 = texelFetch( boneTexture, ivec2( x + 2, y ), 0 );
		vec4 v4 = texelFetch( boneTexture, ivec2( x + 3, y ), 0 );
		return mat4( v1, v2, v3, v4 );
	}
#endif`,la=`#ifdef USE_SKINNING
	vec4 skinVertex = bindMatrix * vec4( transformed, 1.0 );
	vec4 skinned = vec4( 0.0 );
	skinned += boneMatX * skinVertex * skinWeight.x;
	skinned += boneMatY * skinVertex * skinWeight.y;
	skinned += boneMatZ * skinVertex * skinWeight.z;
	skinned += boneMatW * skinVertex * skinWeight.w;
	transformed = ( bindMatrixInverse * skinned ).xyz;
#endif`,ca=`#ifdef USE_SKINNING
	mat4 skinMatrix = mat4( 0.0 );
	skinMatrix += skinWeight.x * boneMatX;
	skinMatrix += skinWeight.y * boneMatY;
	skinMatrix += skinWeight.z * boneMatZ;
	skinMatrix += skinWeight.w * boneMatW;
	skinMatrix = bindMatrixInverse * skinMatrix * bindMatrix;
	objectNormal = vec4( skinMatrix * vec4( objectNormal, 0.0 ) ).xyz;
	#ifdef USE_TANGENT
		objectTangent = vec4( skinMatrix * vec4( objectTangent, 0.0 ) ).xyz;
	#endif
#endif`,ha=`float specularStrength;
#ifdef USE_SPECULARMAP
	vec4 texelSpecular = texture2D( specularMap, vSpecularMapUv );
	specularStrength = texelSpecular.r;
#else
	specularStrength = 1.0;
#endif`,ua=`#ifdef USE_SPECULARMAP
	uniform sampler2D specularMap;
#endif`,fa=`#if defined( TONE_MAPPING )
	gl_FragColor.rgb = toneMapping( gl_FragColor.rgb );
#endif`,da=`#ifndef saturate
#define saturate( a ) clamp( a, 0.0, 1.0 )
#endif
uniform float toneMappingExposure;
vec3 LinearToneMapping( vec3 color ) {
	return saturate( toneMappingExposure * color );
}
vec3 ReinhardToneMapping( vec3 color ) {
	color *= toneMappingExposure;
	return saturate( color / ( vec3( 1.0 ) + color ) );
}
vec3 CineonToneMapping( vec3 color ) {
	color *= toneMappingExposure;
	color = max( vec3( 0.0 ), color - 0.004 );
	return pow( ( color * ( 6.2 * color + 0.5 ) ) / ( color * ( 6.2 * color + 1.7 ) + 0.06 ), vec3( 2.2 ) );
}
vec3 RRTAndODTFit( vec3 v ) {
	vec3 a = v * ( v + 0.0245786 ) - 0.000090537;
	vec3 b = v * ( 0.983729 * v + 0.4329510 ) + 0.238081;
	return a / b;
}
vec3 ACESFilmicToneMapping( vec3 color ) {
	const mat3 ACESInputMat = mat3(
		vec3( 0.59719, 0.07600, 0.02840 ),		vec3( 0.35458, 0.90834, 0.13383 ),
		vec3( 0.04823, 0.01566, 0.83777 )
	);
	const mat3 ACESOutputMat = mat3(
		vec3(  1.60475, -0.10208, -0.00327 ),		vec3( -0.53108,  1.10813, -0.07276 ),
		vec3( -0.07367, -0.00605,  1.07602 )
	);
	color *= toneMappingExposure / 0.6;
	color = ACESInputMat * color;
	color = RRTAndODTFit( color );
	color = ACESOutputMat * color;
	return saturate( color );
}
const mat3 LINEAR_REC2020_TO_LINEAR_SRGB = mat3(
	vec3( 1.6605, - 0.1246, - 0.0182 ),
	vec3( - 0.5876, 1.1329, - 0.1006 ),
	vec3( - 0.0728, - 0.0083, 1.1187 )
);
const mat3 LINEAR_SRGB_TO_LINEAR_REC2020 = mat3(
	vec3( 0.6274, 0.0691, 0.0164 ),
	vec3( 0.3293, 0.9195, 0.0880 ),
	vec3( 0.0433, 0.0113, 0.8956 )
);
vec3 agxDefaultContrastApprox( vec3 x ) {
	vec3 x2 = x * x;
	vec3 x4 = x2 * x2;
	return + 15.5 * x4 * x2
		- 40.14 * x4 * x
		+ 31.96 * x4
		- 6.868 * x2 * x
		+ 0.4298 * x2
		+ 0.1191 * x
		- 0.00232;
}
vec3 AgXToneMapping( vec3 color ) {
	const mat3 AgXInsetMatrix = mat3(
		vec3( 0.856627153315983, 0.137318972929847, 0.11189821299995 ),
		vec3( 0.0951212405381588, 0.761241990602591, 0.0767994186031903 ),
		vec3( 0.0482516061458583, 0.101439036467562, 0.811302368396859 )
	);
	const mat3 AgXOutsetMatrix = mat3(
		vec3( 1.1271005818144368, - 0.1413297634984383, - 0.14132976349843826 ),
		vec3( - 0.11060664309660323, 1.157823702216272, - 0.11060664309660294 ),
		vec3( - 0.016493938717834573, - 0.016493938717834257, 1.2519364065950405 )
	);
	const float AgxMinEv = - 12.47393;	const float AgxMaxEv = 4.026069;
	color *= toneMappingExposure;
	color = LINEAR_SRGB_TO_LINEAR_REC2020 * color;
	color = AgXInsetMatrix * color;
	color = max( color, 1e-10 );	color = log2( color );
	color = ( color - AgxMinEv ) / ( AgxMaxEv - AgxMinEv );
	color = clamp( color, 0.0, 1.0 );
	color = agxDefaultContrastApprox( color );
	color = AgXOutsetMatrix * color;
	color = pow( max( vec3( 0.0 ), color ), vec3( 2.2 ) );
	color = LINEAR_REC2020_TO_LINEAR_SRGB * color;
	color = clamp( color, 0.0, 1.0 );
	return color;
}
vec3 NeutralToneMapping( vec3 color ) {
	const float StartCompression = 0.8 - 0.04;
	const float Desaturation = 0.15;
	color *= toneMappingExposure;
	float x = min( color.r, min( color.g, color.b ) );
	float offset = x < 0.08 ? x - 6.25 * x * x : 0.04;
	color -= offset;
	float peak = max( color.r, max( color.g, color.b ) );
	if ( peak < StartCompression ) return color;
	float d = 1. - StartCompression;
	float newPeak = 1. - d * d / ( peak + d - StartCompression );
	color *= newPeak / peak;
	float g = 1. - 1. / ( Desaturation * ( peak - newPeak ) + 1. );
	return mix( color, vec3( newPeak ), g );
}
vec3 CustomToneMapping( vec3 color ) { return color; }`,pa=`#ifdef USE_TRANSMISSION
	material.transmission = transmission;
	material.transmissionAlpha = 1.0;
	material.thickness = thickness;
	material.attenuationDistance = attenuationDistance;
	material.attenuationColor = attenuationColor;
	#ifdef USE_TRANSMISSIONMAP
		material.transmission *= texture2D( transmissionMap, vTransmissionMapUv ).r;
	#endif
	#ifdef USE_THICKNESSMAP
		material.thickness *= texture2D( thicknessMap, vThicknessMapUv ).g;
	#endif
	vec3 pos = vWorldPosition;
	vec3 v = normalize( cameraPosition - pos );
	vec3 n = inverseTransformDirection( normal, viewMatrix );
	vec4 transmitted = getIBLVolumeRefraction(
		n, v, material.roughness, material.diffuseColor, material.specularColor, material.specularF90,
		pos, modelMatrix, viewMatrix, projectionMatrix, material.dispersion, material.ior, material.thickness,
		material.attenuationColor, material.attenuationDistance );
	material.transmissionAlpha = mix( material.transmissionAlpha, transmitted.a, material.transmission );
	totalDiffuse = mix( totalDiffuse, transmitted.rgb, material.transmission );
#endif`,ma=`#ifdef USE_TRANSMISSION
	uniform float transmission;
	uniform float thickness;
	uniform float attenuationDistance;
	uniform vec3 attenuationColor;
	#ifdef USE_TRANSMISSIONMAP
		uniform sampler2D transmissionMap;
	#endif
	#ifdef USE_THICKNESSMAP
		uniform sampler2D thicknessMap;
	#endif
	uniform vec2 transmissionSamplerSize;
	uniform sampler2D transmissionSamplerMap;
	uniform mat4 modelMatrix;
	uniform mat4 projectionMatrix;
	varying vec3 vWorldPosition;
	float w0( float a ) {
		return ( 1.0 / 6.0 ) * ( a * ( a * ( - a + 3.0 ) - 3.0 ) + 1.0 );
	}
	float w1( float a ) {
		return ( 1.0 / 6.0 ) * ( a *  a * ( 3.0 * a - 6.0 ) + 4.0 );
	}
	float w2( float a ){
		return ( 1.0 / 6.0 ) * ( a * ( a * ( - 3.0 * a + 3.0 ) + 3.0 ) + 1.0 );
	}
	float w3( float a ) {
		return ( 1.0 / 6.0 ) * ( a * a * a );
	}
	float g0( float a ) {
		return w0( a ) + w1( a );
	}
	float g1( float a ) {
		return w2( a ) + w3( a );
	}
	float h0( float a ) {
		return - 1.0 + w1( a ) / ( w0( a ) + w1( a ) );
	}
	float h1( float a ) {
		return 1.0 + w3( a ) / ( w2( a ) + w3( a ) );
	}
	vec4 bicubic( sampler2D tex, vec2 uv, vec4 texelSize, float lod ) {
		uv = uv * texelSize.zw + 0.5;
		vec2 iuv = floor( uv );
		vec2 fuv = fract( uv );
		float g0x = g0( fuv.x );
		float g1x = g1( fuv.x );
		float h0x = h0( fuv.x );
		float h1x = h1( fuv.x );
		float h0y = h0( fuv.y );
		float h1y = h1( fuv.y );
		vec2 p0 = ( vec2( iuv.x + h0x, iuv.y + h0y ) - 0.5 ) * texelSize.xy;
		vec2 p1 = ( vec2( iuv.x + h1x, iuv.y + h0y ) - 0.5 ) * texelSize.xy;
		vec2 p2 = ( vec2( iuv.x + h0x, iuv.y + h1y ) - 0.5 ) * texelSize.xy;
		vec2 p3 = ( vec2( iuv.x + h1x, iuv.y + h1y ) - 0.5 ) * texelSize.xy;
		return g0( fuv.y ) * ( g0x * textureLod( tex, p0, lod ) + g1x * textureLod( tex, p1, lod ) ) +
			g1( fuv.y ) * ( g0x * textureLod( tex, p2, lod ) + g1x * textureLod( tex, p3, lod ) );
	}
	vec4 textureBicubic( sampler2D sampler, vec2 uv, float lod ) {
		vec2 fLodSize = vec2( textureSize( sampler, int( lod ) ) );
		vec2 cLodSize = vec2( textureSize( sampler, int( lod + 1.0 ) ) );
		vec2 fLodSizeInv = 1.0 / fLodSize;
		vec2 cLodSizeInv = 1.0 / cLodSize;
		vec4 fSample = bicubic( sampler, uv, vec4( fLodSizeInv, fLodSize ), floor( lod ) );
		vec4 cSample = bicubic( sampler, uv, vec4( cLodSizeInv, cLodSize ), ceil( lod ) );
		return mix( fSample, cSample, fract( lod ) );
	}
	vec3 getVolumeTransmissionRay( const in vec3 n, const in vec3 v, const in float thickness, const in float ior, const in mat4 modelMatrix ) {
		vec3 refractionVector = refract( - v, normalize( n ), 1.0 / ior );
		vec3 modelScale;
		modelScale.x = length( vec3( modelMatrix[ 0 ].xyz ) );
		modelScale.y = length( vec3( modelMatrix[ 1 ].xyz ) );
		modelScale.z = length( vec3( modelMatrix[ 2 ].xyz ) );
		return normalize( refractionVector ) * thickness * modelScale;
	}
	float applyIorToRoughness( const in float roughness, const in float ior ) {
		return roughness * clamp( ior * 2.0 - 2.0, 0.0, 1.0 );
	}
	vec4 getTransmissionSample( const in vec2 fragCoord, const in float roughness, const in float ior ) {
		float lod = log2( transmissionSamplerSize.x ) * applyIorToRoughness( roughness, ior );
		return textureBicubic( transmissionSamplerMap, fragCoord.xy, lod );
	}
	vec3 volumeAttenuation( const in float transmissionDistance, const in vec3 attenuationColor, const in float attenuationDistance ) {
		if ( isinf( attenuationDistance ) ) {
			return vec3( 1.0 );
		} else {
			vec3 attenuationCoefficient = -log( attenuationColor ) / attenuationDistance;
			vec3 transmittance = exp( - attenuationCoefficient * transmissionDistance );			return transmittance;
		}
	}
	vec4 getIBLVolumeRefraction( const in vec3 n, const in vec3 v, const in float roughness, const in vec3 diffuseColor,
		const in vec3 specularColor, const in float specularF90, const in vec3 position, const in mat4 modelMatrix,
		const in mat4 viewMatrix, const in mat4 projMatrix, const in float dispersion, const in float ior, const in float thickness,
		const in vec3 attenuationColor, const in float attenuationDistance ) {
		vec4 transmittedLight;
		vec3 transmittance;
		#ifdef USE_DISPERSION
			float halfSpread = ( ior - 1.0 ) * 0.025 * dispersion;
			vec3 iors = vec3( ior - halfSpread, ior, ior + halfSpread );
			for ( int i = 0; i < 3; i ++ ) {
				vec3 transmissionRay = getVolumeTransmissionRay( n, v, thickness, iors[ i ], modelMatrix );
				vec3 refractedRayExit = position + transmissionRay;
		
				vec4 ndcPos = projMatrix * viewMatrix * vec4( refractedRayExit, 1.0 );
				vec2 refractionCoords = ndcPos.xy / ndcPos.w;
				refractionCoords += 1.0;
				refractionCoords /= 2.0;
		
				vec4 transmissionSample = getTransmissionSample( refractionCoords, roughness, iors[ i ] );
				transmittedLight[ i ] = transmissionSample[ i ];
				transmittedLight.a += transmissionSample.a;
				transmittance[ i ] = diffuseColor[ i ] * volumeAttenuation( length( transmissionRay ), attenuationColor, attenuationDistance )[ i ];
			}
			transmittedLight.a /= 3.0;
		
		#else
		
			vec3 transmissionRay = getVolumeTransmissionRay( n, v, thickness, ior, modelMatrix );
			vec3 refractedRayExit = position + transmissionRay;
			vec4 ndcPos = projMatrix * viewMatrix * vec4( refractedRayExit, 1.0 );
			vec2 refractionCoords = ndcPos.xy / ndcPos.w;
			refractionCoords += 1.0;
			refractionCoords /= 2.0;
			transmittedLight = getTransmissionSample( refractionCoords, roughness, ior );
			transmittance = diffuseColor * volumeAttenuation( length( transmissionRay ), attenuationColor, attenuationDistance );
		
		#endif
		vec3 attenuatedColor = transmittance * transmittedLight.rgb;
		vec3 F = EnvironmentBRDF( n, v, specularColor, specularF90, roughness );
		float transmittanceFactor = ( transmittance.r + transmittance.g + transmittance.b ) / 3.0;
		return vec4( ( 1.0 - F ) * attenuatedColor, 1.0 - ( 1.0 - transmittedLight.a ) * transmittanceFactor );
	}
#endif`,ga=`#if defined( USE_UV ) || defined( USE_ANISOTROPY )
	varying vec2 vUv;
#endif
#ifdef USE_MAP
	varying vec2 vMapUv;
#endif
#ifdef USE_ALPHAMAP
	varying vec2 vAlphaMapUv;
#endif
#ifdef USE_LIGHTMAP
	varying vec2 vLightMapUv;
#endif
#ifdef USE_AOMAP
	varying vec2 vAoMapUv;
#endif
#ifdef USE_BUMPMAP
	varying vec2 vBumpMapUv;
#endif
#ifdef USE_NORMALMAP
	varying vec2 vNormalMapUv;
#endif
#ifdef USE_EMISSIVEMAP
	varying vec2 vEmissiveMapUv;
#endif
#ifdef USE_METALNESSMAP
	varying vec2 vMetalnessMapUv;
#endif
#ifdef USE_ROUGHNESSMAP
	varying vec2 vRoughnessMapUv;
#endif
#ifdef USE_ANISOTROPYMAP
	varying vec2 vAnisotropyMapUv;
#endif
#ifdef USE_CLEARCOATMAP
	varying vec2 vClearcoatMapUv;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	varying vec2 vClearcoatNormalMapUv;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	varying vec2 vClearcoatRoughnessMapUv;
#endif
#ifdef USE_IRIDESCENCEMAP
	varying vec2 vIridescenceMapUv;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	varying vec2 vIridescenceThicknessMapUv;
#endif
#ifdef USE_SHEEN_COLORMAP
	varying vec2 vSheenColorMapUv;
#endif
#ifdef USE_SHEEN_ROUGHNESSMAP
	varying vec2 vSheenRoughnessMapUv;
#endif
#ifdef USE_SPECULARMAP
	varying vec2 vSpecularMapUv;
#endif
#ifdef USE_SPECULAR_COLORMAP
	varying vec2 vSpecularColorMapUv;
#endif
#ifdef USE_SPECULAR_INTENSITYMAP
	varying vec2 vSpecularIntensityMapUv;
#endif
#ifdef USE_TRANSMISSIONMAP
	uniform mat3 transmissionMapTransform;
	varying vec2 vTransmissionMapUv;
#endif
#ifdef USE_THICKNESSMAP
	uniform mat3 thicknessMapTransform;
	varying vec2 vThicknessMapUv;
#endif`,_a=`#if defined( USE_UV ) || defined( USE_ANISOTROPY )
	varying vec2 vUv;
#endif
#ifdef USE_MAP
	uniform mat3 mapTransform;
	varying vec2 vMapUv;
#endif
#ifdef USE_ALPHAMAP
	uniform mat3 alphaMapTransform;
	varying vec2 vAlphaMapUv;
#endif
#ifdef USE_LIGHTMAP
	uniform mat3 lightMapTransform;
	varying vec2 vLightMapUv;
#endif
#ifdef USE_AOMAP
	uniform mat3 aoMapTransform;
	varying vec2 vAoMapUv;
#endif
#ifdef USE_BUMPMAP
	uniform mat3 bumpMapTransform;
	varying vec2 vBumpMapUv;
#endif
#ifdef USE_NORMALMAP
	uniform mat3 normalMapTransform;
	varying vec2 vNormalMapUv;
#endif
#ifdef USE_DISPLACEMENTMAP
	uniform mat3 displacementMapTransform;
	varying vec2 vDisplacementMapUv;
#endif
#ifdef USE_EMISSIVEMAP
	uniform mat3 emissiveMapTransform;
	varying vec2 vEmissiveMapUv;
#endif
#ifdef USE_METALNESSMAP
	uniform mat3 metalnessMapTransform;
	varying vec2 vMetalnessMapUv;
#endif
#ifdef USE_ROUGHNESSMAP
	uniform mat3 roughnessMapTransform;
	varying vec2 vRoughnessMapUv;
#endif
#ifdef USE_ANISOTROPYMAP
	uniform mat3 anisotropyMapTransform;
	varying vec2 vAnisotropyMapUv;
#endif
#ifdef USE_CLEARCOATMAP
	uniform mat3 clearcoatMapTransform;
	varying vec2 vClearcoatMapUv;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	uniform mat3 clearcoatNormalMapTransform;
	varying vec2 vClearcoatNormalMapUv;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	uniform mat3 clearcoatRoughnessMapTransform;
	varying vec2 vClearcoatRoughnessMapUv;
#endif
#ifdef USE_SHEEN_COLORMAP
	uniform mat3 sheenColorMapTransform;
	varying vec2 vSheenColorMapUv;
#endif
#ifdef USE_SHEEN_ROUGHNESSMAP
	uniform mat3 sheenRoughnessMapTransform;
	varying vec2 vSheenRoughnessMapUv;
#endif
#ifdef USE_IRIDESCENCEMAP
	uniform mat3 iridescenceMapTransform;
	varying vec2 vIridescenceMapUv;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	uniform mat3 iridescenceThicknessMapTransform;
	varying vec2 vIridescenceThicknessMapUv;
#endif
#ifdef USE_SPECULARMAP
	uniform mat3 specularMapTransform;
	varying vec2 vSpecularMapUv;
#endif
#ifdef USE_SPECULAR_COLORMAP
	uniform mat3 specularColorMapTransform;
	varying vec2 vSpecularColorMapUv;
#endif
#ifdef USE_SPECULAR_INTENSITYMAP
	uniform mat3 specularIntensityMapTransform;
	varying vec2 vSpecularIntensityMapUv;
#endif
#ifdef USE_TRANSMISSIONMAP
	uniform mat3 transmissionMapTransform;
	varying vec2 vTransmissionMapUv;
#endif
#ifdef USE_THICKNESSMAP
	uniform mat3 thicknessMapTransform;
	varying vec2 vThicknessMapUv;
#endif`,va=`#if defined( USE_UV ) || defined( USE_ANISOTROPY )
	vUv = vec3( uv, 1 ).xy;
#endif
#ifdef USE_MAP
	vMapUv = ( mapTransform * vec3( MAP_UV, 1 ) ).xy;
#endif
#ifdef USE_ALPHAMAP
	vAlphaMapUv = ( alphaMapTransform * vec3( ALPHAMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_LIGHTMAP
	vLightMapUv = ( lightMapTransform * vec3( LIGHTMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_AOMAP
	vAoMapUv = ( aoMapTransform * vec3( AOMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_BUMPMAP
	vBumpMapUv = ( bumpMapTransform * vec3( BUMPMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_NORMALMAP
	vNormalMapUv = ( normalMapTransform * vec3( NORMALMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_DISPLACEMENTMAP
	vDisplacementMapUv = ( displacementMapTransform * vec3( DISPLACEMENTMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_EMISSIVEMAP
	vEmissiveMapUv = ( emissiveMapTransform * vec3( EMISSIVEMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_METALNESSMAP
	vMetalnessMapUv = ( metalnessMapTransform * vec3( METALNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_ROUGHNESSMAP
	vRoughnessMapUv = ( roughnessMapTransform * vec3( ROUGHNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_ANISOTROPYMAP
	vAnisotropyMapUv = ( anisotropyMapTransform * vec3( ANISOTROPYMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_CLEARCOATMAP
	vClearcoatMapUv = ( clearcoatMapTransform * vec3( CLEARCOATMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	vClearcoatNormalMapUv = ( clearcoatNormalMapTransform * vec3( CLEARCOAT_NORMALMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	vClearcoatRoughnessMapUv = ( clearcoatRoughnessMapTransform * vec3( CLEARCOAT_ROUGHNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_IRIDESCENCEMAP
	vIridescenceMapUv = ( iridescenceMapTransform * vec3( IRIDESCENCEMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	vIridescenceThicknessMapUv = ( iridescenceThicknessMapTransform * vec3( IRIDESCENCE_THICKNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SHEEN_COLORMAP
	vSheenColorMapUv = ( sheenColorMapTransform * vec3( SHEEN_COLORMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SHEEN_ROUGHNESSMAP
	vSheenRoughnessMapUv = ( sheenRoughnessMapTransform * vec3( SHEEN_ROUGHNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SPECULARMAP
	vSpecularMapUv = ( specularMapTransform * vec3( SPECULARMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SPECULAR_COLORMAP
	vSpecularColorMapUv = ( specularColorMapTransform * vec3( SPECULAR_COLORMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SPECULAR_INTENSITYMAP
	vSpecularIntensityMapUv = ( specularIntensityMapTransform * vec3( SPECULAR_INTENSITYMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_TRANSMISSIONMAP
	vTransmissionMapUv = ( transmissionMapTransform * vec3( TRANSMISSIONMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_THICKNESSMAP
	vThicknessMapUv = ( thicknessMapTransform * vec3( THICKNESSMAP_UV, 1 ) ).xy;
#endif`,xa=`#if defined( USE_ENVMAP ) || defined( DISTANCE ) || defined ( USE_SHADOWMAP ) || defined ( USE_TRANSMISSION ) || NUM_SPOT_LIGHT_COORDS > 0
	vec4 worldPosition = vec4( transformed, 1.0 );
	#ifdef USE_BATCHING
		worldPosition = batchingMatrix * worldPosition;
	#endif
	#ifdef USE_INSTANCING
		worldPosition = instanceMatrix * worldPosition;
	#endif
	worldPosition = modelMatrix * worldPosition;
#endif`,ya=`varying vec2 vUv;
uniform mat3 uvTransform;
void main() {
	vUv = ( uvTransform * vec3( uv, 1 ) ).xy;
	gl_Position = vec4( position.xy, 1.0, 1.0 );
}`,Ma=`uniform sampler2D t2D;
uniform float backgroundIntensity;
varying vec2 vUv;
void main() {
	vec4 texColor = texture2D( t2D, vUv );
	#ifdef DECODE_VIDEO_TEXTURE
		texColor = vec4( mix( pow( texColor.rgb * 0.9478672986 + vec3( 0.0521327014 ), vec3( 2.4 ) ), texColor.rgb * 0.0773993808, vec3( lessThanEqual( texColor.rgb, vec3( 0.04045 ) ) ) ), texColor.w );
	#endif
	texColor.rgb *= backgroundIntensity;
	gl_FragColor = texColor;
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,ba=`varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
	gl_Position.z = gl_Position.w;
}`,Sa=`#ifdef ENVMAP_TYPE_CUBE
	uniform samplerCube envMap;
#elif defined( ENVMAP_TYPE_CUBE_UV )
	uniform sampler2D envMap;
#endif
uniform float flipEnvMap;
uniform float backgroundBlurriness;
uniform float backgroundIntensity;
uniform mat3 backgroundRotation;
varying vec3 vWorldDirection;
#include <cube_uv_reflection_fragment>
void main() {
	#ifdef ENVMAP_TYPE_CUBE
		vec4 texColor = textureCube( envMap, backgroundRotation * vec3( flipEnvMap * vWorldDirection.x, vWorldDirection.yz ) );
	#elif defined( ENVMAP_TYPE_CUBE_UV )
		vec4 texColor = textureCubeUV( envMap, backgroundRotation * vWorldDirection, backgroundBlurriness );
	#else
		vec4 texColor = vec4( 0.0, 0.0, 0.0, 1.0 );
	#endif
	texColor.rgb *= backgroundIntensity;
	gl_FragColor = texColor;
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,wa=`varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
	gl_Position.z = gl_Position.w;
}`,Ea=`uniform samplerCube tCube;
uniform float tFlip;
uniform float opacity;
varying vec3 vWorldDirection;
void main() {
	vec4 texColor = textureCube( tCube, vec3( tFlip * vWorldDirection.x, vWorldDirection.yz ) );
	gl_FragColor = texColor;
	gl_FragColor.a *= opacity;
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,Ta=`#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
varying vec2 vHighPrecisionZW;
void main() {
	#include <uv_vertex>
	#include <batching_vertex>
	#include <skinbase_vertex>
	#include <morphinstance_vertex>
	#ifdef USE_DISPLACEMENTMAP
		#include <beginnormal_vertex>
		#include <morphnormal_vertex>
		#include <skinnormal_vertex>
	#endif
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vHighPrecisionZW = gl_Position.zw;
}`,Aa=`#if DEPTH_PACKING == 3200
	uniform float opacity;
#endif
#include <common>
#include <packing>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
varying vec2 vHighPrecisionZW;
void main() {
	vec4 diffuseColor = vec4( 1.0 );
	#include <clipping_planes_fragment>
	#if DEPTH_PACKING == 3200
		diffuseColor.a = opacity;
	#endif
	#include <map_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <logdepthbuf_fragment>
	float fragCoordZ = 0.5 * vHighPrecisionZW[0] / vHighPrecisionZW[1] + 0.5;
	#if DEPTH_PACKING == 3200
		gl_FragColor = vec4( vec3( 1.0 - fragCoordZ ), opacity );
	#elif DEPTH_PACKING == 3201
		gl_FragColor = packDepthToRGBA( fragCoordZ );
	#elif DEPTH_PACKING == 3202
		gl_FragColor = vec4( packDepthToRGB( fragCoordZ ), 1.0 );
	#elif DEPTH_PACKING == 3203
		gl_FragColor = vec4( packDepthToRG( fragCoordZ ), 0.0, 1.0 );
	#endif
}`,Ra=`#define DISTANCE
varying vec3 vWorldPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <batching_vertex>
	#include <skinbase_vertex>
	#include <morphinstance_vertex>
	#ifdef USE_DISPLACEMENTMAP
		#include <beginnormal_vertex>
		#include <morphnormal_vertex>
		#include <skinnormal_vertex>
	#endif
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <worldpos_vertex>
	#include <clipping_planes_vertex>
	vWorldPosition = worldPosition.xyz;
}`,Ca=`#define DISTANCE
uniform vec3 referencePosition;
uniform float nearDistance;
uniform float farDistance;
varying vec3 vWorldPosition;
#include <common>
#include <packing>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <clipping_planes_pars_fragment>
void main () {
	vec4 diffuseColor = vec4( 1.0 );
	#include <clipping_planes_fragment>
	#include <map_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	float dist = length( vWorldPosition - referencePosition );
	dist = ( dist - nearDistance ) / ( farDistance - nearDistance );
	dist = saturate( dist );
	gl_FragColor = packDepthToRGBA( dist );
}`,Pa=`varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
}`,Ia=`uniform sampler2D tEquirect;
varying vec3 vWorldDirection;
#include <common>
void main() {
	vec3 direction = normalize( vWorldDirection );
	vec2 sampleUV = equirectUv( direction );
	gl_FragColor = texture2D( tEquirect, sampleUV );
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,La=`uniform float scale;
attribute float lineDistance;
varying float vLineDistance;
#include <common>
#include <uv_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <morphtarget_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	vLineDistance = scale * lineDistance;
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <fog_vertex>
}`,Da=`uniform vec3 diffuse;
uniform float opacity;
uniform float dashSize;
uniform float totalSize;
varying float vLineDistance;
#include <common>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <fog_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	if ( mod( vLineDistance, totalSize ) > dashSize ) {
		discard;
	}
	vec3 outgoingLight = vec3( 0.0 );
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	outgoingLight = diffuseColor.rgb;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
}`,Ua=`#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <envmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#if defined ( USE_ENVMAP ) || defined ( USE_SKINNING )
		#include <beginnormal_vertex>
		#include <morphnormal_vertex>
		#include <skinbase_vertex>
		#include <skinnormal_vertex>
		#include <defaultnormal_vertex>
	#endif
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <worldpos_vertex>
	#include <envmap_vertex>
	#include <fog_vertex>
}`,Na=`uniform vec3 diffuse;
uniform float opacity;
#ifndef FLAT_SHADED
	varying vec3 vNormal;
#endif
#include <common>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <envmap_common_pars_fragment>
#include <envmap_pars_fragment>
#include <fog_pars_fragment>
#include <specularmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <specularmap_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	#ifdef USE_LIGHTMAP
		vec4 lightMapTexel = texture2D( lightMap, vLightMapUv );
		reflectedLight.indirectDiffuse += lightMapTexel.rgb * lightMapIntensity * RECIPROCAL_PI;
	#else
		reflectedLight.indirectDiffuse += vec3( 1.0 );
	#endif
	#include <aomap_fragment>
	reflectedLight.indirectDiffuse *= diffuseColor.rgb;
	vec3 outgoingLight = reflectedLight.indirectDiffuse;
	#include <envmap_fragment>
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,Fa=`#define LAMBERT
varying vec3 vViewPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <envmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <shadowmap_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vViewPosition = - mvPosition.xyz;
	#include <worldpos_vertex>
	#include <envmap_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
}`,Oa=`#define LAMBERT
uniform vec3 diffuse;
uniform vec3 emissive;
uniform float opacity;
#include <common>
#include <packing>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <emissivemap_pars_fragment>
#include <envmap_common_pars_fragment>
#include <envmap_pars_fragment>
#include <fog_pars_fragment>
#include <bsdfs>
#include <lights_pars_begin>
#include <normal_pars_fragment>
#include <lights_lambert_pars_fragment>
#include <shadowmap_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <specularmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	vec3 totalEmissiveRadiance = emissive;
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <specularmap_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	#include <emissivemap_fragment>
	#include <lights_lambert_fragment>
	#include <lights_fragment_begin>
	#include <lights_fragment_maps>
	#include <lights_fragment_end>
	#include <aomap_fragment>
	vec3 outgoingLight = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse + totalEmissiveRadiance;
	#include <envmap_fragment>
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,ka=`#define MATCAP
varying vec3 vViewPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <color_pars_vertex>
#include <displacementmap_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <fog_vertex>
	vViewPosition = - mvPosition.xyz;
}`,Ba=`#define MATCAP
uniform vec3 diffuse;
uniform float opacity;
uniform sampler2D matcap;
varying vec3 vViewPosition;
#include <common>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <fog_pars_fragment>
#include <normal_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	vec3 viewDir = normalize( vViewPosition );
	vec3 x = normalize( vec3( viewDir.z, 0.0, - viewDir.x ) );
	vec3 y = cross( viewDir, x );
	vec2 uv = vec2( dot( x, normal ), dot( y, normal ) ) * 0.495 + 0.5;
	#ifdef USE_MATCAP
		vec4 matcapColor = texture2D( matcap, uv );
	#else
		vec4 matcapColor = vec4( vec3( mix( 0.2, 0.8, uv.y ) ), 1.0 );
	#endif
	vec3 outgoingLight = diffuseColor.rgb * matcapColor.rgb;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,za=`#define NORMAL
#if defined( FLAT_SHADED ) || defined( USE_BUMPMAP ) || defined( USE_NORMALMAP_TANGENTSPACE )
	varying vec3 vViewPosition;
#endif
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphinstance_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
#if defined( FLAT_SHADED ) || defined( USE_BUMPMAP ) || defined( USE_NORMALMAP_TANGENTSPACE )
	vViewPosition = - mvPosition.xyz;
#endif
}`,Va=`#define NORMAL
uniform float opacity;
#if defined( FLAT_SHADED ) || defined( USE_BUMPMAP ) || defined( USE_NORMALMAP_TANGENTSPACE )
	varying vec3 vViewPosition;
#endif
#include <packing>
#include <uv_pars_fragment>
#include <normal_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( 0.0, 0.0, 0.0, opacity );
	#include <clipping_planes_fragment>
	#include <logdepthbuf_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	gl_FragColor = vec4( packNormalToRGB( normal ), diffuseColor.a );
	#ifdef OPAQUE
		gl_FragColor.a = 1.0;
	#endif
}`,Ha=`#define PHONG
varying vec3 vViewPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <envmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <shadowmap_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphinstance_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vViewPosition = - mvPosition.xyz;
	#include <worldpos_vertex>
	#include <envmap_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
}`,Ga=`#define PHONG
uniform vec3 diffuse;
uniform vec3 emissive;
uniform vec3 specular;
uniform float shininess;
uniform float opacity;
#include <common>
#include <packing>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <emissivemap_pars_fragment>
#include <envmap_common_pars_fragment>
#include <envmap_pars_fragment>
#include <fog_pars_fragment>
#include <bsdfs>
#include <lights_pars_begin>
#include <normal_pars_fragment>
#include <lights_phong_pars_fragment>
#include <shadowmap_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <specularmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	vec3 totalEmissiveRadiance = emissive;
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <specularmap_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	#include <emissivemap_fragment>
	#include <lights_phong_fragment>
	#include <lights_fragment_begin>
	#include <lights_fragment_maps>
	#include <lights_fragment_end>
	#include <aomap_fragment>
	vec3 outgoingLight = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse + reflectedLight.directSpecular + reflectedLight.indirectSpecular + totalEmissiveRadiance;
	#include <envmap_fragment>
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,Wa=`#define STANDARD
varying vec3 vViewPosition;
#ifdef USE_TRANSMISSION
	varying vec3 vWorldPosition;
#endif
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <shadowmap_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vViewPosition = - mvPosition.xyz;
	#include <worldpos_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
#ifdef USE_TRANSMISSION
	vWorldPosition = worldPosition.xyz;
#endif
}`,Xa=`#define STANDARD
#ifdef PHYSICAL
	#define IOR
	#define USE_SPECULAR
#endif
uniform vec3 diffuse;
uniform vec3 emissive;
uniform float roughness;
uniform float metalness;
uniform float opacity;
#ifdef IOR
	uniform float ior;
#endif
#ifdef USE_SPECULAR
	uniform float specularIntensity;
	uniform vec3 specularColor;
	#ifdef USE_SPECULAR_COLORMAP
		uniform sampler2D specularColorMap;
	#endif
	#ifdef USE_SPECULAR_INTENSITYMAP
		uniform sampler2D specularIntensityMap;
	#endif
#endif
#ifdef USE_CLEARCOAT
	uniform float clearcoat;
	uniform float clearcoatRoughness;
#endif
#ifdef USE_DISPERSION
	uniform float dispersion;
#endif
#ifdef USE_IRIDESCENCE
	uniform float iridescence;
	uniform float iridescenceIOR;
	uniform float iridescenceThicknessMinimum;
	uniform float iridescenceThicknessMaximum;
#endif
#ifdef USE_SHEEN
	uniform vec3 sheenColor;
	uniform float sheenRoughness;
	#ifdef USE_SHEEN_COLORMAP
		uniform sampler2D sheenColorMap;
	#endif
	#ifdef USE_SHEEN_ROUGHNESSMAP
		uniform sampler2D sheenRoughnessMap;
	#endif
#endif
#ifdef USE_ANISOTROPY
	uniform vec2 anisotropyVector;
	#ifdef USE_ANISOTROPYMAP
		uniform sampler2D anisotropyMap;
	#endif
#endif
varying vec3 vViewPosition;
#include <common>
#include <packing>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <emissivemap_pars_fragment>
#include <iridescence_fragment>
#include <cube_uv_reflection_fragment>
#include <envmap_common_pars_fragment>
#include <envmap_physical_pars_fragment>
#include <fog_pars_fragment>
#include <lights_pars_begin>
#include <normal_pars_fragment>
#include <lights_physical_pars_fragment>
#include <transmission_pars_fragment>
#include <shadowmap_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <clearcoat_pars_fragment>
#include <iridescence_pars_fragment>
#include <roughnessmap_pars_fragment>
#include <metalnessmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	vec3 totalEmissiveRadiance = emissive;
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <roughnessmap_fragment>
	#include <metalnessmap_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	#include <clearcoat_normal_fragment_begin>
	#include <clearcoat_normal_fragment_maps>
	#include <emissivemap_fragment>
	#include <lights_physical_fragment>
	#include <lights_fragment_begin>
	#include <lights_fragment_maps>
	#include <lights_fragment_end>
	#include <aomap_fragment>
	vec3 totalDiffuse = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse;
	vec3 totalSpecular = reflectedLight.directSpecular + reflectedLight.indirectSpecular;
	#include <transmission_fragment>
	vec3 outgoingLight = totalDiffuse + totalSpecular + totalEmissiveRadiance;
	#ifdef USE_SHEEN
		float sheenEnergyComp = 1.0 - 0.157 * max3( material.sheenColor );
		outgoingLight = outgoingLight * sheenEnergyComp + sheenSpecularDirect + sheenSpecularIndirect;
	#endif
	#ifdef USE_CLEARCOAT
		float dotNVcc = saturate( dot( geometryClearcoatNormal, geometryViewDir ) );
		vec3 Fcc = F_Schlick( material.clearcoatF0, material.clearcoatF90, dotNVcc );
		outgoingLight = outgoingLight * ( 1.0 - material.clearcoat * Fcc ) + ( clearcoatSpecularDirect + clearcoatSpecularIndirect ) * material.clearcoat;
	#endif
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,qa=`#define TOON
varying vec3 vViewPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <shadowmap_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vViewPosition = - mvPosition.xyz;
	#include <worldpos_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
}`,Ya=`#define TOON
uniform vec3 diffuse;
uniform vec3 emissive;
uniform float opacity;
#include <common>
#include <packing>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <emissivemap_pars_fragment>
#include <gradientmap_pars_fragment>
#include <fog_pars_fragment>
#include <bsdfs>
#include <lights_pars_begin>
#include <normal_pars_fragment>
#include <lights_toon_pars_fragment>
#include <shadowmap_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	vec3 totalEmissiveRadiance = emissive;
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	#include <emissivemap_fragment>
	#include <lights_toon_fragment>
	#include <lights_fragment_begin>
	#include <lights_fragment_maps>
	#include <lights_fragment_end>
	#include <aomap_fragment>
	vec3 outgoingLight = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse + totalEmissiveRadiance;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,Za=`uniform float size;
uniform float scale;
#include <common>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <morphtarget_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
#ifdef USE_POINTS_UV
	varying vec2 vUv;
	uniform mat3 uvTransform;
#endif
void main() {
	#ifdef USE_POINTS_UV
		vUv = ( uvTransform * vec3( uv, 1 ) ).xy;
	#endif
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <project_vertex>
	gl_PointSize = size;
	#ifdef USE_SIZEATTENUATION
		bool isPerspective = isPerspectiveMatrix( projectionMatrix );
		if ( isPerspective ) gl_PointSize *= ( scale / - mvPosition.z );
	#endif
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <worldpos_vertex>
	#include <fog_vertex>
}`,$a=`uniform vec3 diffuse;
uniform float opacity;
#include <common>
#include <color_pars_fragment>
#include <map_particle_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <fog_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	vec3 outgoingLight = vec3( 0.0 );
	#include <logdepthbuf_fragment>
	#include <map_particle_fragment>
	#include <color_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	outgoingLight = diffuseColor.rgb;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
}`,Ja=`#include <common>
#include <batching_pars_vertex>
#include <fog_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <shadowmap_pars_vertex>
void main() {
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphinstance_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <worldpos_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
}`,Ka=`uniform vec3 color;
uniform float opacity;
#include <common>
#include <packing>
#include <fog_pars_fragment>
#include <bsdfs>
#include <lights_pars_begin>
#include <logdepthbuf_pars_fragment>
#include <shadowmap_pars_fragment>
#include <shadowmask_pars_fragment>
void main() {
	#include <logdepthbuf_fragment>
	gl_FragColor = vec4( color, opacity * ( 1.0 - getShadowMask() ) );
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
}`,ja=`uniform float rotation;
uniform vec2 center;
#include <common>
#include <uv_pars_vertex>
#include <fog_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	vec4 mvPosition = modelViewMatrix[ 3 ];
	vec2 scale = vec2( length( modelMatrix[ 0 ].xyz ), length( modelMatrix[ 1 ].xyz ) );
	#ifndef USE_SIZEATTENUATION
		bool isPerspective = isPerspectiveMatrix( projectionMatrix );
		if ( isPerspective ) scale *= - mvPosition.z;
	#endif
	vec2 alignedPosition = ( position.xy - ( center - vec2( 0.5 ) ) ) * scale;
	vec2 rotatedPosition;
	rotatedPosition.x = cos( rotation ) * alignedPosition.x - sin( rotation ) * alignedPosition.y;
	rotatedPosition.y = sin( rotation ) * alignedPosition.x + cos( rotation ) * alignedPosition.y;
	mvPosition.xy += rotatedPosition;
	gl_Position = projectionMatrix * mvPosition;
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <fog_vertex>
}`,Qa=`uniform vec3 diffuse;
uniform float opacity;
#include <common>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <fog_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	vec3 outgoingLight = vec3( 0.0 );
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	outgoingLight = diffuseColor.rgb;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
}`,k={alphahash_fragment:Ms,alphahash_pars_fragment:bs,alphamap_fragment:Ss,alphamap_pars_fragment:ws,alphatest_fragment:Es,alphatest_pars_fragment:Ts,aomap_fragment:As,aomap_pars_fragment:Rs,batching_pars_vertex:Cs,batching_vertex:Ps,begin_vertex:Is,beginnormal_vertex:Ls,bsdfs:Ds,iridescence_fragment:Us,bumpmap_pars_fragment:Ns,clipping_planes_fragment:Fs,clipping_planes_pars_fragment:Os,clipping_planes_pars_vertex:ks,clipping_planes_vertex:Bs,color_fragment:zs,color_pars_fragment:Vs,color_pars_vertex:Hs,color_vertex:Gs,common:Ws,cube_uv_reflection_fragment:Xs,defaultnormal_vertex:qs,displacementmap_pars_vertex:Ys,displacementmap_vertex:Zs,emissivemap_fragment:$s,emissivemap_pars_fragment:Js,colorspace_fragment:Ks,colorspace_pars_fragment:js,envmap_fragment:Qs,envmap_common_pars_fragment:er,envmap_pars_fragment:tr,envmap_pars_vertex:nr,envmap_physical_pars_fragment:dr,envmap_vertex:ir,fog_vertex:sr,fog_pars_vertex:rr,fog_fragment:ar,fog_pars_fragment:or,gradientmap_pars_fragment:lr,lightmap_pars_fragment:cr,lights_lambert_fragment:hr,lights_lambert_pars_fragment:ur,lights_pars_begin:fr,lights_toon_fragment:pr,lights_toon_pars_fragment:mr,lights_phong_fragment:gr,lights_phong_pars_fragment:_r,lights_physical_fragment:vr,lights_physical_pars_fragment:xr,lights_fragment_begin:yr,lights_fragment_maps:Mr,lights_fragment_end:br,logdepthbuf_fragment:Sr,logdepthbuf_pars_fragment:wr,logdepthbuf_pars_vertex:Er,logdepthbuf_vertex:Tr,map_fragment:Ar,map_pars_fragment:Rr,map_particle_fragment:Cr,map_particle_pars_fragment:Pr,metalnessmap_fragment:Ir,metalnessmap_pars_fragment:Lr,morphinstance_vertex:Dr,morphcolor_vertex:Ur,morphnormal_vertex:Nr,morphtarget_pars_vertex:Fr,morphtarget_vertex:Or,normal_fragment_begin:kr,normal_fragment_maps:Br,normal_pars_fragment:zr,normal_pars_vertex:Vr,normal_vertex:Hr,normalmap_pars_fragment:Gr,clearcoat_normal_fragment_begin:Wr,clearcoat_normal_fragment_maps:Xr,clearcoat_pars_fragment:qr,iridescence_pars_fragment:Yr,opaque_fragment:Zr,packing:$r,premultiplied_alpha_fragment:Jr,project_vertex:Kr,dithering_fragment:jr,dithering_pars_fragment:Qr,roughnessmap_fragment:ea,roughnessmap_pars_fragment:ta,shadowmap_pars_fragment:na,shadowmap_pars_vertex:ia,shadowmap_vertex:sa,shadowmask_pars_fragment:ra,skinbase_vertex:aa,skinning_pars_vertex:oa,skinning_vertex:la,skinnormal_vertex:ca,specularmap_fragment:ha,specularmap_pars_fragment:ua,tonemapping_fragment:fa,tonemapping_pars_fragment:da,transmission_fragment:pa,transmission_pars_fragment:ma,uv_pars_fragment:ga,uv_pars_vertex:_a,uv_vertex:va,worldpos_vertex:xa,background_vert:ya,background_frag:Ma,backgroundCube_vert:ba,backgroundCube_frag:Sa,cube_vert:wa,cube_frag:Ea,depth_vert:Ta,depth_frag:Aa,distanceRGBA_vert:Ra,distanceRGBA_frag:Ca,equirect_vert:Pa,equirect_frag:Ia,linedashed_vert:La,linedashed_frag:Da,meshbasic_vert:Ua,meshbasic_frag:Na,meshlambert_vert:Fa,meshlambert_frag:Oa,meshmatcap_vert:ka,meshmatcap_frag:Ba,meshnormal_vert:za,meshnormal_frag:Va,meshphong_vert:Ha,meshphong_frag:Ga,meshphysical_vert:Wa,meshphysical_frag:Xa,meshtoon_vert:qa,meshtoon_frag:Ya,points_vert:Za,points_frag:$a,shadow_vert:Ja,shadow_frag:Ka,sprite_vert:ja,sprite_frag:Qa},w={common:{diffuse:{value:new G(16777215)},opacity:{value:1},map:{value:null},mapTransform:{value:new B},alphaMap:{value:null},alphaMapTransform:{value:new B},alphaTest:{value:0}},specularmap:{specularMap:{value:null},specularMapTransform:{value:new B}},envmap:{envMap:{value:null},envMapRotation:{value:new B},flipEnvMap:{value:-1},reflectivity:{value:1},ior:{value:1.5},refractionRatio:{value:.98}},aomap:{aoMap:{value:null},aoMapIntensity:{value:1},aoMapTransform:{value:new B}},lightmap:{lightMap:{value:null},lightMapIntensity:{value:1},lightMapTransform:{value:new B}},bumpmap:{bumpMap:{value:null},bumpMapTransform:{value:new B},bumpScale:{value:1}},normalmap:{normalMap:{value:null},normalMapTransform:{value:new B},normalScale:{value:new ee(1,1)}},displacementmap:{displacementMap:{value:null},displacementMapTransform:{value:new B},displacementScale:{value:1},displacementBias:{value:0}},emissivemap:{emissiveMap:{value:null},emissiveMapTransform:{value:new B}},metalnessmap:{metalnessMap:{value:null},metalnessMapTransform:{value:new B}},roughnessmap:{roughnessMap:{value:null},roughnessMapTransform:{value:new B}},gradientmap:{gradientMap:{value:null}},fog:{fogDensity:{value:25e-5},fogNear:{value:1},fogFar:{value:2e3},fogColor:{value:new G(16777215)}},lights:{ambientLightColor:{value:[]},lightProbe:{value:[]},directionalLights:{value:[],properties:{direction:{},color:{}}},directionalLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{}}},directionalShadowMap:{value:[]},directionalShadowMatrix:{value:[]},spotLights:{value:[],properties:{color:{},position:{},direction:{},distance:{},coneCos:{},penumbraCos:{},decay:{}}},spotLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{}}},spotLightMap:{value:[]},spotShadowMap:{value:[]},spotLightMatrix:{value:[]},pointLights:{value:[],properties:{color:{},position:{},decay:{},distance:{}}},pointLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{},shadowCameraNear:{},shadowCameraFar:{}}},pointShadowMap:{value:[]},pointShadowMatrix:{value:[]},hemisphereLights:{value:[],properties:{direction:{},skyColor:{},groundColor:{}}},rectAreaLights:{value:[],properties:{color:{},position:{},width:{},height:{}}},ltc_1:{value:null},ltc_2:{value:null}},points:{diffuse:{value:new G(16777215)},opacity:{value:1},size:{value:1},scale:{value:1},map:{value:null},alphaMap:{value:null},alphaMapTransform:{value:new B},alphaTest:{value:0},uvTransform:{value:new B}},sprite:{diffuse:{value:new G(16777215)},opacity:{value:1},center:{value:new ee(.5,.5)},rotation:{value:0},map:{value:null},mapTransform:{value:new B},alphaMap:{value:null},alphaMapTransform:{value:new B},alphaTest:{value:0}}},zi={basic:{uniforms:ce([w.common,w.specularmap,w.envmap,w.aomap,w.lightmap,w.fog]),vertexShader:k.meshbasic_vert,fragmentShader:k.meshbasic_frag},lambert:{uniforms:ce([w.common,w.specularmap,w.envmap,w.aomap,w.lightmap,w.emissivemap,w.bumpmap,w.normalmap,w.displacementmap,w.fog,w.lights,{emissive:{value:new G(0)}}]),vertexShader:k.meshlambert_vert,fragmentShader:k.meshlambert_frag},phong:{uniforms:ce([w.common,w.specularmap,w.envmap,w.aomap,w.lightmap,w.emissivemap,w.bumpmap,w.normalmap,w.displacementmap,w.fog,w.lights,{emissive:{value:new G(0)},specular:{value:new G(1118481)},shininess:{value:30}}]),vertexShader:k.meshphong_vert,fragmentShader:k.meshphong_frag},standard:{uniforms:ce([w.common,w.envmap,w.aomap,w.lightmap,w.emissivemap,w.bumpmap,w.normalmap,w.displacementmap,w.roughnessmap,w.metalnessmap,w.fog,w.lights,{emissive:{value:new G(0)},roughness:{value:1},metalness:{value:0},envMapIntensity:{value:1}}]),vertexShader:k.meshphysical_vert,fragmentShader:k.meshphysical_frag},toon:{uniforms:ce([w.common,w.aomap,w.lightmap,w.emissivemap,w.bumpmap,w.normalmap,w.displacementmap,w.gradientmap,w.fog,w.lights,{emissive:{value:new G(0)}}]),vertexShader:k.meshtoon_vert,fragmentShader:k.meshtoon_frag},matcap:{uniforms:ce([w.common,w.bumpmap,w.normalmap,w.displacementmap,w.fog,{matcap:{value:null}}]),vertexShader:k.meshmatcap_vert,fragmentShader:k.meshmatcap_frag},points:{uniforms:ce([w.points,w.fog]),vertexShader:k.points_vert,fragmentShader:k.points_frag},dashed:{uniforms:ce([w.common,w.fog,{scale:{value:1},dashSize:{value:1},totalSize:{value:2}}]),vertexShader:k.linedashed_vert,fragmentShader:k.linedashed_frag},depth:{uniforms:ce([w.common,w.displacementmap]),vertexShader:k.depth_vert,fragmentShader:k.depth_frag},normal:{uniforms:ce([w.common,w.bumpmap,w.normalmap,w.displacementmap,{opacity:{value:1}}]),vertexShader:k.meshnormal_vert,fragmentShader:k.meshnormal_frag},sprite:{uniforms:ce([w.sprite,w.fog]),vertexShader:k.sprite_vert,fragmentShader:k.sprite_frag},background:{uniforms:{uvTransform:{value:new B},t2D:{value:null},backgroundIntensity:{value:1}},vertexShader:k.background_vert,fragmentShader:k.background_frag},backgroundCube:{uniforms:{envMap:{value:null},flipEnvMap:{value:-1},backgroundBlurriness:{value:0},backgroundIntensity:{value:1},backgroundRotation:{value:new B}},vertexShader:k.backgroundCube_vert,fragmentShader:k.backgroundCube_frag},cube:{uniforms:{tCube:{value:null},tFlip:{value:-1},opacity:{value:1}},vertexShader:k.cube_vert,fragmentShader:k.cube_frag},equirect:{uniforms:{tEquirect:{value:null}},vertexShader:k.equirect_vert,fragmentShader:k.equirect_frag},distanceRGBA:{uniforms:ce([w.common,w.displacementmap,{referencePosition:{value:new y},nearDistance:{value:1},farDistance:{value:1e3}}]),vertexShader:k.distanceRGBA_vert,fragmentShader:k.distanceRGBA_frag},shadow:{uniforms:ce([w.lights,w.fog,{color:{value:new G(0)},opacity:{value:1}}]),vertexShader:k.shadow_vert,fragmentShader:k.shadow_frag}};zi.physical={uniforms:ce([zi.standard.uniforms,{clearcoat:{value:0},clearcoatMap:{value:null},clearcoatMapTransform:{value:new B},clearcoatNormalMap:{value:null},clearcoatNormalMapTransform:{value:new B},clearcoatNormalScale:{value:new ee(1,1)},clearcoatRoughness:{value:0},clearcoatRoughnessMap:{value:null},clearcoatRoughnessMapTransform:{value:new B},dispersion:{value:0},iridescence:{value:0},iridescenceMap:{value:null},iridescenceMapTransform:{value:new B},iridescenceIOR:{value:1.3},iridescenceThicknessMinimum:{value:100},iridescenceThicknessMaximum:{value:400},iridescenceThicknessMap:{value:null},iridescenceThicknessMapTransform:{value:new B},sheen:{value:0},sheenColor:{value:new G(0)},sheenColorMap:{value:null},sheenColorMapTransform:{value:new B},sheenRoughness:{value:1},sheenRoughnessMap:{value:null},sheenRoughnessMapTransform:{value:new B},transmission:{value:0},transmissionMap:{value:null},transmissionMapTransform:{value:new B},transmissionSamplerSize:{value:new ee},transmissionSamplerMap:{value:null},thickness:{value:0},thicknessMap:{value:null},thicknessMapTransform:{value:new B},attenuationDistance:{value:0},attenuationColor:{value:new G(0)},specularColor:{value:new G(1,1,1)},specularColorMap:{value:null},specularColorMapTransform:{value:new B},specularIntensity:{value:1},specularIntensityMap:{value:null},specularIntensityMapTransform:{value:new B},anisotropyVector:{value:new ee},anisotropyMap:{value:null},anisotropyMapTransform:{value:new B}}]),vertexShader:k.meshphysical_vert,fragmentShader:k.meshphysical_frag};var qe=(1+Math.sqrt(5))/2,ht=1/qe,_o=[new y(-qe,ht,0),new y(qe,ht,0),new y(-ht,0,qe),new y(ht,0,qe),new y(0,qe,-ht),new y(0,qe,ht),new y(-1,1,-1),new y(1,1,-1),new y(-1,1,1),new y(1,1,1)];var vo=new Float32Array(16),xo=new Float32Array(9),yo=new Float32Array(4);var Mo={[li]:ci,[hi]:di,[ui]:pi,[Qt]:fi,[ci]:li,[di]:hi,[pi]:ui,[fi]:Qt};var tn=class extends ze{constructor(){super(),this.isGroup=!0,this.type="Group"}};function Kt(_,e,t){return!_||!t&&_.constructor===e?_:typeof e.BYTES_PER_ELEMENT=="number"?new e(_):Array.prototype.slice.call(_)}function eo(_){return ArrayBuffer.isView(_)&&!(_ instanceof DataView)}var pt=class{constructor(e,t,n,i){this.parameterPositions=e,this._cachedIndex=0,this.resultBuffer=i!==void 0?i:new t.constructor(n),this.sampleValues=t,this.valueSize=n,this.settings=null,this.DefaultSettings_={}}evaluate(e){let t=this.parameterPositions,n=this._cachedIndex,i=t[n],s=t[n-1];n:{e:{let r;t:{i:if(!(e<i)){for(let h=n+2;;){if(i===void 0){if(e<s)break i;return n=t.length,this._cachedIndex=n,this.copySampleValue_(n-1)}if(n===h)break;if(s=i,i=t[++n],e<i)break e}r=t.length;break t}if(!(e>=s)){let h=t[1];e<h&&(n=2,s=h);for(let c=n-2;;){if(s===void 0)return this._cachedIndex=0,this.copySampleValue_(0);if(n===c)break;if(i=s,s=t[--n-1],e>=s)break e}r=n,n=0;break t}break n}for(;n<r;){let h=n+r>>>1;e<t[h]?r=h:n=h+1}if(i=t[n],s=t[n-1],s===void 0)return this._cachedIndex=0,this.copySampleValue_(0);if(i===void 0)return n=t.length,this._cachedIndex=n,this.copySampleValue_(n-1)}this._cachedIndex=n,this.intervalChanged_(n,s,i)}return this.interpolate_(n,s,e,i)}getSettings_(){return this.settings||this.DefaultSettings_}copySampleValue_(e){let t=this.resultBuffer,n=this.sampleValues,i=this.valueSize,s=e*i;for(let r=0;r!==i;++r)t[r]=n[s+r];return t}interpolate_(){throw new Error("call to abstract method")}intervalChanged_(){}},Vn=class extends pt{constructor(e,t,n,i){super(e,t,n,i),this._weightPrev=-0,this._offsetPrev=-0,this._weightNext=-0,this._offsetNext=-0,this.DefaultSettings_={endingStart:gi,endingEnd:gi}}intervalChanged_(e,t,n){let i=this.parameterPositions,s=e-2,r=e+1,h=i[s],c=i[r];if(h===void 0)switch(this.getSettings_().endingStart){case _i:s=e,h=2*t-n;break;case vi:s=i.length-2,h=t+i[s]-i[s+1];break;default:s=e,h=n}if(c===void 0)switch(this.getSettings_().endingEnd){case _i:r=e,c=2*n-t;break;case vi:r=1,c=n+i[1]-i[0];break;default:r=e-1,c=t}let o=(n-t)*.5,a=this.valueSize;this._weightPrev=o/(t-h),this._weightNext=o/(c-n),this._offsetPrev=s*a,this._offsetNext=r*a}interpolate_(e,t,n,i){let s=this.resultBuffer,r=this.sampleValues,h=this.valueSize,c=e*h,o=c-h,a=this._offsetPrev,l=this._offsetNext,u=this._weightPrev,f=this._weightNext,d=(n-t)/(i-t),p=d*d,m=p*d,g=-u*m+2*u*p-u*d,v=(1+u)*m+(-1.5-2*u)*p+(-.5+u)*d+1,x=(-1-f)*m+(1.5+f)*p+.5*d,M=f*m-f*p;for(let b=0;b!==h;++b)s[b]=g*r[a+b]+v*r[o+b]+x*r[c+b]+M*r[l+b];return s}},Hn=class extends pt{constructor(e,t,n,i){super(e,t,n,i)}interpolate_(e,t,n,i){let s=this.resultBuffer,r=this.sampleValues,h=this.valueSize,c=e*h,o=c-h,a=(n-t)/(i-t),l=1-a;for(let u=0;u!==h;++u)s[u]=r[o+u]*l+r[c+u]*a;return s}},Gn=class extends pt{constructor(e,t,n,i){super(e,t,n,i)}interpolate_(e){return this.copySampleValue_(e-1)}},be=class{constructor(e,t,n,i){if(e===void 0)throw new Error("THREE.KeyframeTrack: track name is undefined");if(t===void 0||t.length===0)throw new Error("THREE.KeyframeTrack: no keyframes in track named "+e);this.name=e,this.times=Kt(t,this.TimeBufferType),this.values=Kt(n,this.ValueBufferType),this.setInterpolation(i||this.DefaultInterpolation)}static toJSON(e){let t=e.constructor,n;if(t.toJSON!==this.toJSON)n=t.toJSON(e);else{n={name:e.name,times:Kt(e.times,Array),values:Kt(e.values,Array)};let i=e.getInterpolation();i!==e.DefaultInterpolation&&(n.interpolation=i)}return n.type=e.ValueTypeName,n}InterpolantFactoryMethodDiscrete(e){return new Gn(this.times,this.values,this.getValueSize(),e)}InterpolantFactoryMethodLinear(e){return new Hn(this.times,this.values,this.getValueSize(),e)}InterpolantFactoryMethodSmooth(e){return new Vn(this.times,this.values,this.getValueSize(),e)}setInterpolation(e){let t;switch(e){case en:t=this.InterpolantFactoryMethodDiscrete;break;case Pn:t=this.InterpolantFactoryMethodLinear;break;case on:t=this.InterpolantFactoryMethodSmooth;break}if(t===void 0){let n="unsupported interpolation for "+this.ValueTypeName+" keyframe track named "+this.name;if(this.createInterpolant===void 0)if(e!==this.DefaultInterpolation)this.setInterpolation(this.DefaultInterpolation);else throw new Error(n);return console.warn("THREE.KeyframeTrack:",n),this}return this.createInterpolant=t,this}getInterpolation(){switch(this.createInterpolant){case this.InterpolantFactoryMethodDiscrete:return en;case this.InterpolantFactoryMethodLinear:return Pn;case this.InterpolantFactoryMethodSmooth:return on}}getValueSize(){return this.values.length/this.times.length}shift(e){if(e!==0){let t=this.times;for(let n=0,i=t.length;n!==i;++n)t[n]+=e}return this}scale(e){if(e!==1){let t=this.times;for(let n=0,i=t.length;n!==i;++n)t[n]*=e}return this}trim(e,t){let n=this.times,i=n.length,s=0,r=i-1;for(;s!==i&&n[s]<e;)++s;for(;r!==-1&&n[r]>t;)--r;if(++r,s!==0||r!==i){s>=r&&(r=Math.max(r,1),s=r-1);let h=this.getValueSize();this.times=n.slice(s,r),this.values=this.values.slice(s*h,r*h)}return this}validate(){let e=!0,t=this.getValueSize();t-Math.floor(t)!==0&&(console.error("THREE.KeyframeTrack: Invalid value size in track.",this),e=!1);let n=this.times,i=this.values,s=n.length;s===0&&(console.error("THREE.KeyframeTrack: Track is empty.",this),e=!1);let r=null;for(let h=0;h!==s;h++){let c=n[h];if(typeof c=="number"&&isNaN(c)){console.error("THREE.KeyframeTrack: Time is not a valid number.",this,h,c),e=!1;break}if(r!==null&&r>c){console.error("THREE.KeyframeTrack: Out of order keys.",this,h,c,r),e=!1;break}r=c}if(i!==void 0&&eo(i))for(let h=0,c=i.length;h!==c;++h){let o=i[h];if(isNaN(o)){console.error("THREE.KeyframeTrack: Value is not a valid number.",this,h,o),e=!1;break}}return e}optimize(){let e=this.times.slice(),t=this.values.slice(),n=this.getValueSize(),i=this.getInterpolation()===on,s=e.length-1,r=1;for(let h=1;h<s;++h){let c=!1,o=e[h],a=e[h+1];if(o!==a&&(h!==1||o!==e[0]))if(i)c=!0;else{let l=h*n,u=l-n,f=l+n;for(let d=0;d!==n;++d){let p=t[l+d];if(p!==t[u+d]||p!==t[f+d]){c=!0;break}}}if(c){if(h!==r){e[r]=e[h];let l=h*n,u=r*n;for(let f=0;f!==n;++f)t[u+f]=t[l+f]}++r}}if(s>0){e[r]=e[s];for(let h=s*n,c=r*n,o=0;o!==n;++o)t[c+o]=t[h+o];++r}return r!==e.length?(this.times=e.slice(0,r),this.values=t.slice(0,r*n)):(this.times=e,this.values=t),this}clone(){let e=this.times.slice(),t=this.values.slice(),n=this.constructor,i=new n(this.name,e,t);return i.createInterpolant=this.createInterpolant,i}};be.prototype.TimeBufferType=Float32Array;be.prototype.ValueBufferType=Float32Array;be.prototype.DefaultInterpolation=Pn;var $e=class extends be{constructor(e,t,n){super(e,t,n)}};$e.prototype.ValueTypeName="bool";$e.prototype.ValueBufferType=Array;$e.prototype.DefaultInterpolation=en;$e.prototype.InterpolantFactoryMethodLinear=void 0;$e.prototype.InterpolantFactoryMethodSmooth=void 0;var Wn=class extends be{};Wn.prototype.ValueTypeName="color";var Xn=class extends be{};Xn.prototype.ValueTypeName="number";var qn=class extends pt{constructor(e,t,n,i){super(e,t,n,i)}interpolate_(e,t,n,i){let s=this.resultBuffer,r=this.sampleValues,h=this.valueSize,c=(n-t)/(i-t),o=e*h;for(let a=o+h;o!==a;o+=4)Be.slerpFlat(s,0,r,o-h,r,o,c);return s}},nn=class extends be{InterpolantFactoryMethodLinear(e){return new qn(this.times,this.values,this.getValueSize(),e)}};nn.prototype.ValueTypeName="quaternion";nn.prototype.InterpolantFactoryMethodSmooth=void 0;var Je=class extends be{constructor(e,t,n){super(e,t,n)}};Je.prototype.ValueTypeName="string";Je.prototype.ValueBufferType=Array;Je.prototype.DefaultInterpolation=en;Je.prototype.InterpolantFactoryMethodLinear=void 0;Je.prototype.InterpolantFactoryMethodSmooth=void 0;var Yn=class extends be{};Yn.prototype.ValueTypeName="vector";var Zn=class{constructor(e,t,n){let i=this,s=!1,r=0,h=0,c,o=[];this.onStart=void 0,this.onLoad=e,this.onProgress=t,this.onError=n,this.itemStart=function(a){h++,s===!1&&i.onStart!==void 0&&i.onStart(a,r,h),s=!0},this.itemEnd=function(a){r++,i.onProgress!==void 0&&i.onProgress(a,r,h),r===h&&(s=!1,i.onLoad!==void 0&&i.onLoad())},this.itemError=function(a){i.onError!==void 0&&i.onError(a)},this.resolveURL=function(a){return c?c(a):a},this.setURLModifier=function(a){return c=a,this},this.addHandler=function(a,l){return o.push(a,l),this},this.removeHandler=function(a){let l=o.indexOf(a);return l!==-1&&o.splice(l,2),this},this.getHandler=function(a){for(let l=0,u=o.length;l<u;l+=2){let f=o[l],d=o[l+1];if(f.global&&(f.lastIndex=0),f.test(a))return d}return null}}},to=new Zn,$n=class{constructor(e){this.manager=e!==void 0?e:to,this.crossOrigin="anonymous",this.withCredentials=!1,this.path="",this.resourcePath="",this.requestHeader={}}load(){}loadAsync(e,t){let n=this;return new Promise(function(i,s){n.load(e,i,t,s)})}parse(){}setCrossOrigin(e){return this.crossOrigin=e,this}setWithCredentials(e){return this.withCredentials=e,this}setPath(e){return this.path=e,this}setResourcePath(e){return this.resourcePath=e,this}setRequestHeader(e){return this.requestHeader=e,this}};$n.DEFAULT_MATERIAL_NAME="__DEFAULT";var Qn="\\[\\]\\.:\\/",no=new RegExp("["+Qn+"]","g"),ei="[^"+Qn+"]",io="[^"+Qn.replace("\\.","")+"]",so=/((?:WC+[\/:])*)/.source.replace("WC",ei),ro=/(WCOD+)?/.source.replace("WCOD",io),ao=/(?:\.(WC+)(?:\[(.+)\])?)?/.source.replace("WC",ei),oo=/\.(WC+)(?:\[(.+)\])?/.source.replace("WC",ei),lo=new RegExp("^"+so+ro+ao+oo+"$"),co=["material","materials","bones","map"],Jn=class{constructor(e,t,n){let i=n||$.parseTrackName(t);this._targetGroup=e,this._bindings=e.subscribe_(t,i)}getValue(e,t){this.bind();let n=this._targetGroup.nCachedObjects_,i=this._bindings[n];i!==void 0&&i.getValue(e,t)}setValue(e,t){let n=this._bindings;for(let i=this._targetGroup.nCachedObjects_,s=n.length;i!==s;++i)n[i].setValue(e,t)}bind(){let e=this._bindings;for(let t=this._targetGroup.nCachedObjects_,n=e.length;t!==n;++t)e[t].bind()}unbind(){let e=this._bindings;for(let t=this._targetGroup.nCachedObjects_,n=e.length;t!==n;++t)e[t].unbind()}},$=class _{constructor(e,t,n){this.path=t,this.parsedPath=n||_.parseTrackName(t),this.node=_.findNode(e,this.parsedPath.nodeName),this.rootNode=e,this.getValue=this._getValue_unbound,this.setValue=this._setValue_unbound}static create(e,t,n){return e&&e.isAnimationObjectGroup?new _.Composite(e,t,n):new _(e,t,n)}static sanitizeNodeName(e){return e.replace(/\s/g,"_").replace(no,"")}static parseTrackName(e){let t=lo.exec(e);if(t===null)throw new Error("PropertyBinding: Cannot parse trackName: "+e);let n={nodeName:t[2],objectName:t[3],objectIndex:t[4],propertyName:t[5],propertyIndex:t[6]},i=n.nodeName&&n.nodeName.lastIndexOf(".");if(i!==void 0&&i!==-1){let s=n.nodeName.substring(i+1);co.indexOf(s)!==-1&&(n.nodeName=n.nodeName.substring(0,i),n.objectName=s)}if(n.propertyName===null||n.propertyName.length===0)throw new Error("PropertyBinding: can not parse propertyName from trackName: "+e);return n}static findNode(e,t){if(t===void 0||t===""||t==="."||t===-1||t===e.name||t===e.uuid)return e;if(e.skeleton){let n=e.skeleton.getBoneByName(t);if(n!==void 0)return n}if(e.children){let n=function(s){for(let r=0;r<s.length;r++){let h=s[r];if(h.name===t||h.uuid===t)return h;let c=n(h.children);if(c)return c}return null},i=n(e.children);if(i)return i}return null}_getValue_unavailable(){}_setValue_unavailable(){}_getValue_direct(e,t){e[t]=this.targetObject[this.propertyName]}_getValue_array(e,t){let n=this.resolvedProperty;for(let i=0,s=n.length;i!==s;++i)e[t++]=n[i]}_getValue_arrayElement(e,t){e[t]=this.resolvedProperty[this.propertyIndex]}_getValue_toArray(e,t){this.resolvedProperty.toArray(e,t)}_setValue_direct(e,t){this.targetObject[this.propertyName]=e[t]}_setValue_direct_setNeedsUpdate(e,t){this.targetObject[this.propertyName]=e[t],this.targetObject.needsUpdate=!0}_setValue_direct_setMatrixWorldNeedsUpdate(e,t){this.targetObject[this.propertyName]=e[t],this.targetObject.matrixWorldNeedsUpdate=!0}_setValue_array(e,t){let n=this.resolvedProperty;for(let i=0,s=n.length;i!==s;++i)n[i]=e[t++]}_setValue_array_setNeedsUpdate(e,t){let n=this.resolvedProperty;for(let i=0,s=n.length;i!==s;++i)n[i]=e[t++];this.targetObject.needsUpdate=!0}_setValue_array_setMatrixWorldNeedsUpdate(e,t){let n=this.resolvedProperty;for(let i=0,s=n.length;i!==s;++i)n[i]=e[t++];this.targetObject.matrixWorldNeedsUpdate=!0}_setValue_arrayElement(e,t){this.resolvedProperty[this.propertyIndex]=e[t]}_setValue_arrayElement_setNeedsUpdate(e,t){this.resolvedProperty[this.propertyIndex]=e[t],this.targetObject.needsUpdate=!0}_setValue_arrayElement_setMatrixWorldNeedsUpdate(e,t){this.resolvedProperty[this.propertyIndex]=e[t],this.targetObject.matrixWorldNeedsUpdate=!0}_setValue_fromArray(e,t){this.resolvedProperty.fromArray(e,t)}_setValue_fromArray_setNeedsUpdate(e,t){this.resolvedProperty.fromArray(e,t),this.targetObject.needsUpdate=!0}_setValue_fromArray_setMatrixWorldNeedsUpdate(e,t){this.resolvedProperty.fromArray(e,t),this.targetObject.matrixWorldNeedsUpdate=!0}_getValue_unbound(e,t){this.bind(),this.getValue(e,t)}_setValue_unbound(e,t){this.bind(),this.setValue(e,t)}bind(){let e=this.node,t=this.parsedPath,n=t.objectName,i=t.propertyName,s=t.propertyIndex;if(e||(e=_.findNode(this.rootNode,t.nodeName),this.node=e),this.getValue=this._getValue_unavailable,this.setValue=this._setValue_unavailable,!e){console.warn("THREE.PropertyBinding: No target node found for track: "+this.path+".");return}if(n){let o=t.objectIndex;switch(n){case"materials":if(!e.material){console.error("THREE.PropertyBinding: Can not bind to material as node does not have a material.",this);return}if(!e.material.materials){console.error("THREE.PropertyBinding: Can not bind to material.materials as node.material does not have a materials array.",this);return}e=e.material.materials;break;case"bones":if(!e.skeleton){console.error("THREE.PropertyBinding: Can not bind to bones as node does not have a skeleton.",this);return}e=e.skeleton.bones;for(let a=0;a<e.length;a++)if(e[a].name===o){o=a;break}break;case"map":if("map"in e){e=e.map;break}if(!e.material){console.error("THREE.PropertyBinding: Can not bind to material as node does not have a material.",this);return}if(!e.material.map){console.error("THREE.PropertyBinding: Can not bind to material.map as node.material does not have a map.",this);return}e=e.material.map;break;default:if(e[n]===void 0){console.error("THREE.PropertyBinding: Can not bind to objectName of node undefined.",this);return}e=e[n]}if(o!==void 0){if(e[o]===void 0){console.error("THREE.PropertyBinding: Trying to bind to objectIndex of objectName, but is undefined.",this,e);return}e=e[o]}}let r=e[i];if(r===void 0){let o=t.nodeName;console.error("THREE.PropertyBinding: Trying to update property for track: "+o+"."+i+" but it wasn't found.",e);return}let h=this.Versioning.None;this.targetObject=e,e.needsUpdate!==void 0?h=this.Versioning.NeedsUpdate:e.matrixWorldNeedsUpdate!==void 0&&(h=this.Versioning.MatrixWorldNeedsUpdate);let c=this.BindingType.Direct;if(s!==void 0){if(i==="morphTargetInfluences"){if(!e.geometry){console.error("THREE.PropertyBinding: Can not bind to morphTargetInfluences because node does not have a geometry.",this);return}if(!e.geometry.morphAttributes){console.error("THREE.PropertyBinding: Can not bind to morphTargetInfluences because node does not have a geometry.morphAttributes.",this);return}e.morphTargetDictionary[s]!==void 0&&(s=e.morphTargetDictionary[s])}c=this.BindingType.ArrayElement,this.resolvedProperty=r,this.propertyIndex=s}else r.fromArray!==void 0&&r.toArray!==void 0?(c=this.BindingType.HasFromToArray,this.resolvedProperty=r):Array.isArray(r)?(c=this.BindingType.EntireArray,this.resolvedProperty=r):this.propertyName=i;this.getValue=this.GetterByBindingType[c],this.setValue=this.SetterByBindingTypeAndVersioning[c][h]}unbind(){this.node=null,this.getValue=this._getValue_unbound,this.setValue=this._setValue_unbound}};$.Composite=Jn;$.prototype.BindingType={Direct:0,EntireArray:1,ArrayElement:2,HasFromToArray:3};$.prototype.Versioning={None:0,NeedsUpdate:1,MatrixWorldNeedsUpdate:2};$.prototype.GetterByBindingType=[$.prototype._getValue_direct,$.prototype._getValue_array,$.prototype._getValue_arrayElement,$.prototype._getValue_toArray];$.prototype.SetterByBindingTypeAndVersioning=[[$.prototype._setValue_direct,$.prototype._setValue_direct_setNeedsUpdate,$.prototype._setValue_direct_setMatrixWorldNeedsUpdate],[$.prototype._setValue_array,$.prototype._setValue_array_setNeedsUpdate,$.prototype._setValue_array_setMatrixWorldNeedsUpdate],[$.prototype._setValue_arrayElement,$.prototype._setValue_arrayElement_setNeedsUpdate,$.prototype._setValue_arrayElement_setMatrixWorldNeedsUpdate],[$.prototype._setValue_fromArray,$.prototype._setValue_fromArray_setNeedsUpdate,$.prototype._setValue_fromArray_setMatrixWorldNeedsUpdate]];var bo=new Float32Array(1);typeof __THREE_DEVTOOLS__<"u"&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("register",{detail:{revision:Vi}}));typeof window<"u"&&(window.__THREE__?console.warn("WARNING: Multiple instances of Three.js being imported."):window.__THREE__=Vi);var So={2026:{mass:800,cgH:.28,frontW:.45,izz:1150,powerICE:4e5,powerERS:35e4,ersFadeFrom:290/3.6,ersFadeTo:345/3.6,rpmIdle:4200,rpmMax:12e3,rpmLimit:12400,rpmLaunch:8500,cyl:6,gearsKmh:[98,132,166,200,236,272,310,352],shiftTime:.035,claZ:4.3,cdaZ:1.26,claX:2.7,cdaX:.82,aeroFront:.4,mu:1.95,brakeTq:9e3,brakeFront:.56,engBrake:.14,turboLag:.06,mode:"active",steerLock:.36,lineGrip:.78},2010:{mass:620,cgH:.28,frontW:.46,izz:1050,powerICE:56e4,powerERS:0,ersFadeFrom:999,ersFadeTo:1e3,rpmIdle:5e3,rpmMax:18e3,rpmLimit:18300,rpmLaunch:11500,cyl:8,gearsKmh:[118,157,194,229,261,291,321],shiftTime:.03,claZ:4.1,cdaZ:1.22,claX:4.1,cdaX:1.22,aeroFront:.41,mu:1.95,brakeTq:9e3,brakeFront:.57,engBrake:.14,turboLag:.02,mode:"none",steerLock:.36,lineGrip:.78},2006:{mass:605,cgH:.29,frontW:.46,izz:1020,powerICE:565e3,powerERS:0,ersFadeFrom:999,ersFadeTo:1e3,rpmIdle:5e3,rpmMax:19e3,rpmLimit:19300,rpmLaunch:12e3,cyl:8,gearsKmh:[116,155,191,226,258,288,318],shiftTime:.035,claZ:3.8,cdaZ:1.2,claX:3.8,cdaX:1.2,aeroFront:.41,mu:1.8,brakeTq:8800,brakeFront:.58,engBrake:.14,turboLag:.02,mode:"none",steerLock:.37,lineGrip:.75}};var Ji=22;function ho(_){return function(){_|=0,_=_+1831565813|0;let e=Math.imul(_^_>>>15,1|_);return e=e+Math.imul(e^e>>>7,61|e)^e,((e^e>>>14)>>>0)/4294967296}}function R(_,e,t=0){let n=Math.imul(_|0,374761393)^Math.imul(e|0,668265263)^Math.imul(t|0,2147483647);return n=Math.imul(n^n>>>13,1274126177),n^=n>>>16,(n>>>0)/4294967296}var uo=.5*(Math.sqrt(3)-1),Pt=(3-Math.sqrt(3))/6,ti=[[1,1],[-1,1],[1,-1],[-1,-1],[1,0],[-1,0],[0,1],[0,-1]],mt=class{constructor(e){let t=ho(e*9973+17),n=new Uint8Array(256);for(let i=0;i<256;i++)n[i]=i;for(let i=255;i>0;i--){let s=t()*(i+1)|0,r=n[i];n[i]=n[s],n[s]=r}this.perm=new Uint8Array(512);for(let i=0;i<512;i++)this.perm[i]=n[i&255]}n2(e,t){let n=this.perm,i=(e+t)*uo,s=Math.floor(e+i),r=Math.floor(t+i),h=(s+r)*Pt,c=e-(s-h),o=t-(r-h),a=c>o?1:0,l=c>o?0:1,u=c-a+Pt,f=o-l+Pt,d=c-1+2*Pt,p=o-1+2*Pt,m=s&255,g=r&255,v=0,x,M;return x=.5-c*c-o*o,x>0&&(M=ti[n[m+n[g]]&7],x*=x,v+=x*x*(M[0]*c+M[1]*o)),x=.5-u*u-f*f,x>0&&(M=ti[n[m+a+n[g+l]]&7],x*=x,v+=x*x*(M[0]*u+M[1]*f)),x=.5-d*d-p*p,x>0&&(M=ti[n[m+1+n[g+1]]&7],x*=x,v+=x*x*(M[0]*d+M[1]*p)),70*v}fbm(e,t,n=4,i=2,s=.5){let r=1,h=1,c=0,o=0;for(let a=0;a<n;a++)c+=r*this.n2(e*h,t*h),o+=r,r*=s,h*=i;return c/o}ridge(e,t,n=4){let i=1,s=1,r=0,h=0;for(let c=0;c<n;c++){let o=1-Math.abs(this.n2(e*s,t*s));r+=i*o*o,h+=i,i*=.5,s*=2}return r/h}},F=(_,e,t)=>{let n=Math.min(1,Math.max(0,(t-_)/(e-_)));return n*n*(3-2*n)},ue=(_,e,t)=>_+(e-_)*t,Ee=(_,e,t)=>_<e?e:_>t?t:_;var po={uFogSun:{value:new y(0,1,0)},uFogSunCol:{value:new G(16777215)},uFogBase:{value:60},uCaus:{value:0},uCausT:{value:0},uCausTop:{value:0}},sn=k;sn.fog_pars_vertex=`#ifdef USE_FOG
varying float vFogDepth;
varying vec3 vFogW;
#endif`;sn.fog_vertex=`#ifdef USE_FOG
vFogDepth = - mvPosition.z;
vFogW = (modelMatrix * vec4(transformed, 1.0)).xyz;
#endif`;sn.fog_pars_fragment=`#ifdef USE_FOG
  uniform vec3 fogColor; varying float vFogDepth; varying vec3 vFogW;
  #ifdef FOG_EXP2
    uniform float fogDensity;
  #else
    uniform float fogNear; uniform float fogFar;
  #endif
  uniform vec3 uFogSun; uniform vec3 uFogSunCol; uniform float uFogBase;
  uniform float uCaus, uCausT, uCausTop;
  // underwater caustics: bright wandering light net on everything below the surface
  float causNet(vec2 p) {
    vec2 q = p; float v = 0.0;
    for (int i = 0; i < 3; i++) { q = vec2(q.x + sin(q.y * 1.3 + uCausT * 0.9), q.y + cos(q.x * 1.1 - uCausT * 0.7)); v += abs(sin(q.x) * sin(q.y)); }
    return pow(clamp(1.0 - v / 3.0, 0.0, 1.0), 5.0);
  }
#endif`;sn.fog_fragment=`#ifdef USE_FOG
  if (uCaus > 0.0) {
    float cd = clamp((uCausTop - vFogW.y) / 60.0, 0.0, 1.0);
    gl_FragColor.rgb *= 1.0 + uCaus * (1.0 - cd * 0.6) * (causNet(vFogW.xz * 0.22) * 2.2 + causNet(vFogW.xz * 0.5 + 3.1) * 0.8);
  }
  vec3 fv = vFogW - cameraPosition; float fd = length(fv); vec3 fdir = fv / max(fd, 1e-3);
  #ifdef FOG_EXP2
    float fogF = 1.0 - exp(-pow(fd * fogDensity, 1.5));
  #else
    float fogF = smoothstep(fogNear, fogFar, fd);
  #endif
  float hgt = clamp((vFogW.y - uFogBase) / 120.0, 0.0, 1.0);
  fogF *= mix(1.0, 0.55, hgt);
  float sunAmt = pow(max(dot(fdir, normalize(uFogSun + vec3(0.0, 1e-4, 0.0))), 0.0), 5.0);
  vec3 fc = fogColor + uFogSunCol * sunAmt * 0.55;
  gl_FragColor.rgb = mix(gl_FragColor.rgb, fc, clamp(fogF, 0.0, 1.0));
#endif`;var Uo={zen:{value:new G},hor:{value:new G},sunDir:{value:new y(0,1,0)},sunCol:{value:new G},cover:{value:.4},time:{value:0},night:{value:0},camPos:{value:new y}};var No={uniforms:{tDiffuse:{value:null},tDepth:{value:null},sunPos:{value:new ee(.5,.5)},sunVis:{value:0},sunCol:{value:new G},sat:{value:1.1},sharp:{value:.35},aoAmt:{value:.75},rays:{value:.38},aspect:{value:1.7},cNear:{value:.1},cFar:{value:3e3},flare:{value:.55},shadowTint:{value:new G(.93,.97,1.06)},hiTint:{value:new G(1.05,1,.94)},aoOn:{value:0},tanHalf:{value:new ee(1,1)},px:{value:new ee(.001,.001)},aoTint:{value:new G(.2,.24,.34)}},vertexShader:"varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix*modelViewMatrix*vec4(position,1.0); }",fragmentShader:`#include <packing>
    uniform sampler2D tDiffuse, tDepth; uniform vec2 sunPos; uniform float sunVis, sat, sharp, aoAmt, rays, aspect, cNear, cFar, flare, aoOn;
    uniform vec3 sunCol, shadowTint, hiTint, aoTint; uniform vec2 tanHalf, px; varying vec2 vUv;
    vec3 viewPos(vec2 uv) {
      float vz = perspectiveDepthToViewZ(texture2D(tDepth, uv).x, cNear, cFar);
      return vec3((uv * 2.0 - 1.0) * tanHalf * -vz, vz);
    }
    // screen-space ambient occlusion from the depth buffer (block corners, under trees, around the car)
    float ssao(vec2 uv) {
      vec3 P = viewPos(uv);
      float dist = -P.z;
      if (dist > 160.0) return 1.0;
      vec3 Pr = viewPos(uv + vec2(px.x, 0.0)), Pl = viewPos(uv - vec2(px.x, 0.0));
      vec3 Pu = viewPos(uv + vec2(0.0, px.y)), Pd = viewPos(uv - vec2(0.0, px.y));
      vec3 dx = abs(Pr.z - P.z) < abs(P.z - Pl.z) ? Pr - P : P - Pl;
      vec3 dy = abs(Pu.z - P.z) < abs(P.z - Pd.z) ? Pu - P : P - Pd;
      vec3 N = normalize(cross(dx, dy));
      if (dot(N, P) > 0.0) N = -N;
      vec3 T = normalize(abs(N.y) < 0.9 ? cross(N, vec3(0.0, 1.0, 0.0)) : cross(N, vec3(1.0, 0.0, 0.0)));
      vec3 B = cross(N, T);
      float rad = mix(0.55, 1.6, smoothstep(4.0, 60.0, dist));
      float jit = fract(sin(dot(uv * 1000.0, vec2(12.9898, 78.233))) * 43758.5453) * 6.2831;
      float occ = 0.0;
      const int K = 8;
      for (int i = 0; i < K; i++) {
        float fi = float(i);
        float a = fi * 2.39996 + jit;
        float r = sqrt((fi + 0.5) / float(K));
        float h = sqrt(1.0 - r * r);
        vec3 dir = T * (cos(a) * r) + B * (sin(a) * r) + N * h;
        float s = mix(0.25, 1.0, fract(fi * 0.618 + jit));
        vec3 S = P + dir * rad * s + N * 0.03;
        vec2 suv = (S.xy / (-S.z * tanHalf)) * 0.5 + 0.5;
        if (suv.x < 0.0 || suv.y < 0.0 || suv.x > 1.0 || suv.y > 1.0) continue;
        float sz = viewPos(suv).z;
        float range = smoothstep(0.0, 1.0, rad / max(abs(P.z - sz), 1e-3));
        occ += (sz >= S.z + 0.02 * dist * 0.02 + 0.015 ? 1.0 : 0.0) * range;
      }
      float ao = 1.0 - occ / float(K);
      return mix(1.0, ao, 1.0 - smoothstep(70.0, 160.0, dist));
    }
    float skyMask(vec2 uv) {
      float d = texture2D(tDepth, uv).x;
      float vz = -perspectiveDepthToViewZ(d, cNear, cFar);
      return smoothstep(1200.0, 2400.0, vz);
    }
    float h12(vec2 p){ return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453); }
    void main(){
      vec3 col = texture2D(tDiffuse, vUv).rgb;
      // light sharpening (unsharp mask), stronger on low-contrast detail, so block edges and
      // texture detail read crisply without halos
      {
        vec3 nb = texture2D(tDiffuse, vUv + vec2(px.x, 0.0)).rgb + texture2D(tDiffuse, vUv - vec2(px.x, 0.0)).rgb
                + texture2D(tDiffuse, vUv + vec2(0.0, px.y)).rgb + texture2D(tDiffuse, vUv - vec2(0.0, px.y)).rgb;
        vec3 d = col - nb * 0.25;
        col = max(col + clamp(d, -0.08, 0.08) * sharp * 2.0, 0.0);
      }
      if (aoOn > 0.5) {
        float ao = ssao(vUv);
        ao = mix(1.0, pow(clamp(ao, 0.0, 1.0), 1.3), aoAmt);
        col *= mix(aoTint, vec3(1.0), ao) * 0.15 + ao * 0.85;
      }
      if (sunVis > 0.001) {
        // god rays: march toward the sun through the depth buffer, only sky lets light through
        const int N = 20;
        vec2 dv = (sunPos - vUv) / float(N);
        float jit = h12(vUv * 913.7);
        vec2 uv = vUv + dv * jit;
        float acc = 0.0, w = 1.0;
        for (int i = 0; i < N; i++) {
          vec2 suv = clamp(uv, 0.001, 0.999);
          float sky = skyMask(suv);
          vec2 q = (uv - sunPos) * vec2(aspect, 1.0);
          acc += sky * w * exp(-length(q) * 3.2);
          w *= 0.96;
          uv += dv;
        }
        float shafts = acc / float(N);
        vec2 qd = (vUv - sunPos) * vec2(aspect, 1.0);
        float near = exp(-length(qd) * 1.6);
        col += sunCol * shafts * rays * sunVis * (0.35 + 0.9 * near);
        // lens flare ghosts along the line through the screen centre, gated by sun visibility
        float vis = skyMask(clamp(sunPos, 0.001, 0.999));
        vec2 axis = vec2(0.5) - sunPos;
        float fl = 0.0;
        for (int k = 1; k <= 4; k++) {
          vec2 c = sunPos + axis * (0.45 * float(k));
          float r = 0.025 + 0.02 * float(k);
          float d = length((vUv - c) * vec2(aspect, 1.0));
          fl += (1.0 - smoothstep(r * 0.6, r, d)) * (0.12 / float(k));
        }
        float halo = smoothstep(0.03, 0.0, abs(length((vUv - sunPos) * vec2(aspect, 1.0)) - 0.32)) * 0.05;
        col += sunCol * (fl + halo) * vis * sunVis * flare;
      }
      // split toning: cool shadows, warm highlights, then saturation
      float l = dot(col, vec3(0.2126, 0.7152, 0.0722));
      col *= mix(shadowTint, hiTint, smoothstep(0.05, 0.9, l));
      l = dot(col, vec3(0.2126, 0.7152, 0.0722));
      col = max(mix(vec3(l), col, sat), 0.0);
      vec2 v = (vUv - 0.5) * vec2(aspect * 0.75, 1.0);
      col *= mix(0.7, 1.0, smoothstep(0.95, 0.25, length(v)));
      gl_FragColor = vec4(col, 1.0);
    }`};var gt=(_,e,t)=>e+64<<16|t+128<<8|_+128,Ki=_=>[(_&255)-128,(_>>16)-64,(_>>8&255)-128];function ji(_,e,t){let n=_.B,i=_.A,s=_.structGrid,r=n.seed+77;if(R(e,t,r)>{desert:.4,jungle:.5,taiga:.5,nether:.65,arctic:.6,shore:.6,plains:.35,darkforest:.4,cherry:.35,peaks:.45,ocean:.6,badlands:.3,meadow:.3}[_.st])return null;let h=Math.floor(e*s+s*.15+R(e,t,r+1)*s*.7),c=Math.floor(t*s+s*.15+R(e,t,r+2)*s*.7),o=_.column(h,c);if(o.d<46||o.smooth)return null;let a=R(e,t,r+3),l=R(e,t,r+4)<.5?0:1,u=null;switch(_.st){case"desert":u=o.band?null:a<.6?"boulder":"fossil";break;case"jungle":u=o.fluid?null:"boulder";break;case"taiga":u=o.fluid||o.top===i.snow?null:"boulder";break;case"nether":u=o.fluid===2?null:"lavaspire";break;case"shore":u=o.fluid===1&&o.h<_.water-3?"reef":null;break;case"ocean":u=a<.65?"reef":"boulder";break;case"darkforest":case"cherry":case"meadow":case"plains":u=o.fluid?null:"boulder";break;case"peaks":u=o.fluid?null:"boulder";break;case"badlands":u=o.fluid||o.band?null:"boulder";break;case"arctic":u=o.top===i.ice?a<.75?"iceberg":null:a<.5?"boulder":"iceberg";break}if(!u)return null;if(u==="bridge")for(let f of[-42,42]){let d=l?h:h+f,p=l?c+f:c;if(_.track.near(d,p,!1).d<40)return null}return{type:u,x:h,z:c,y:Math.floor(o.h),r:a,dir:l,key:e+","+t}}function Qi(_,e){let t=_.A,n=new Map,i=(o,a,l,u)=>{o<-127||o>127||l<-127||l>127||a<-63||a>190||n.set(gt(o,a,l),u)},s=(o,a,l)=>n.delete(gt(o,a,l)),r=(o,a,l,u,f,d,p)=>{for(let m=a;m<=f;m++)for(let g=o;g<=u;g++)for(let v=l;v<=d;v++)i(g,m,v,typeof p=="function"?p(g,m,v):p)},h=(o,a,l)=>R(e.x+o*7+l*3,e.z+a*13+l*5,31),c=(o,a)=>e.dir?[a,o]:[o,a];switch(e.type){case"pyramid":{r(-12,-6,-12,12,-1,12,t.sandstone);for(let a=0;a<=12;a++){let l=12-a,u=a===4||a===8?t.desert_stone_brick:a===12?t.tc_orange:t.sandstone_block;r(-l,a,-l,l,a,l,u)}for(let a=0;a<4;a++)for(let l=-1;l<=1;l++)for(let u=0;u<4;u++){let[f,d]=c(l,-12+u);s(f,a,d)}for(let[a,l]of[[-12,-12],[12,-12],[-12,12],[12,12]])r(a-1,0,l-1,a+1,5,l+1,(u,f)=>f===5?t.tc_orange:t.desert_sandstone);break}case"well":r(-3,-3,-3,3,0,3,t.sandstone),r(-2,1,-2,2,1,2,t.sandstone_block),s(0,1,0),s(0,0,0),i(0,0,0,t.water);for(let[o,a]of[[-2,-2],[2,-2],[-2,2],[2,2]])r(o,2,a,o,4,a,t.sandstone);r(-2,5,-2,2,5,2,t.sandstone_block);break;case"temple":{let o=[[8,5],[6,4],[4,4]],a=0;r(-9,-6,-9,9,-1,9,t.mossycobble);for(let[l,u]of o)r(-l,a,-l,l,a+u-1,l,(f,d,p)=>h(f,p,d)<.45?t.mossycobble:t.cobble),a+=u;for(let l=0;l<3;l++)for(let u=-1;u<=1;u++){let[f,d]=c(u,-8);s(f,l,d);let[p,m]=c(u,-7);s(p,l,m)}for(let l=0;l<26;l++){let u=Math.floor(h(l,1,2)*4),f=Math.floor(h(l,2,3)*15)-7,d=2+Math.floor(h(l,3,4)*5),[p,m]=u===0?[f,-9]:u===1?[f,9]:u===2?[-9,f]:[9,f];for(let g=0;g<d;g++)i(p,4-g,m,t.vine)}r(-1,a,-1,1,a+1,1,t.mossycobble);break}case"shipwreck":{let o=9+Math.floor(e.r*5);for(let a=-o;a<=o;a++){let l=a>o-4?Math.max(0,2-(a-(o-4))):2;if(!(h(a,0,1)<.12))for(let u=-l;u<=l;u++){let[f,d]=c(a,u),p=Math.abs(u)===l;i(f,0,d,t.planks),(p||a===-o)&&(i(f,1,d,t.planks),a<o-6&&h(a,u,2)>.35&&i(f,2,d,t.pine_planks))}}for(let a=1;a<6;a++){let[l,u]=c(-2,0);i(l,a,u,t.tree)}{let[a,l]=c(-o+2,0);r(a-1,1,l-1,a+1,2,l+1,t.pine_planks)}break}case"ruins":{let o=3+Math.floor(e.r*2);for(let a=-o;a<=o;a++)for(let l=-o;l<=o;l++)if(i(a,0,l,h(a,l,3)<.5?t.prismarine:t.stone_brick),Math.abs(a)===o||Math.abs(l)===o){let u=1+Math.floor(h(a,l,4)*4);for(let f=1;f<=u;f++)i(a,f,l,h(a,f,l)<.35?t.mossycobble:t.stone_brick)}break}case"monument":{for(let a=0;a<=9;a++){let l=15-a;for(let u=-l;u<=l;u++)for(let f=-l;f<=l;f++)a>0&&Math.max(Math.abs(u),Math.abs(f))<l-1||i(u,a,f,a%3===2?t.dark_prismarine:t.prismarine)}for(let[a,l]of[[-14,-14],[14,-14],[-14,14],[14,14]])r(a-1,0,l-1,a+1,13,l+1,(u,f)=>f>11?t.glowstone:t.dark_prismarine);r(-3,9,-3,3,13,3,(a,l,u)=>Math.abs(a)===3||Math.abs(u)===3?t.prismarine:t.glowstone);break}case"yacht":{let o=9+Math.floor(e.r*9),a=2+(e.r>.5?1:0);for(let u=-o;u<=o;u++){let f=u>o-5?Math.max(0,a-(u-(o-5))):a;for(let d=-f;d<=f;d++){let[p,m]=c(u,d);i(p,0,m,t.wool_black),i(p,1,m,t.wool_white),i(p,2,m,t.wool_white),(Math.abs(d)<f||u>o-6)&&i(p,2,m,t.planks)}}let l=[[-o+3,o-7,3],[-o+5,o-10,4],[-o+8,o-13,5]];for(let[u,f,d]of l)for(let p=u;p<=f;p++)for(let m=-a+1;m<=a-1;m++){let[g,v]=c(p,m),x=Math.abs(m)===a-1||p===u||p===f;i(g,d,v,x&&d<5&&p&1?t.glass:t.wool_white)}break}case"cabin":{r(-5,-5,-4,5,0,4,t.cobble);for(let o=1;o<=4;o++)for(let a=-4;a<=4;a++)for(let l=-3;l<=3;l++){if(!(Math.abs(a)===4||Math.abs(l)===3))continue;let f=Math.abs(a)===4&&Math.abs(l)===3,d=(o===2||o===3)&&!f&&(Math.abs(a)===2||l===0);i(...e.dir?[l,o,a]:[a,o,l],f?t.pine:d?t.glass:t.pine_planks)}for(let o=1;o<=2;o++){let[a,l]=c(0,-3);s(a,o,l)}for(let o=0;o<=4;o++)for(let a=-5;a<=5;a++)for(let l of[-4+o,4-o])i(...e.dir?[l,5+o,a]:[a,5+o,l],t.jungle_planks);for(let o=-4;o<=4;o++)for(let a=-3;a<=3;a++)Math.abs(a)<=3;r(...e.dir?[2,5,3,2,10,3]:[3,5,2,3,10,2],t.cobble);break}case"boulder":{let o=2+e.r*2.5;for(let a=-2;a<=o;a++)for(let l=-4;l<=4;l++)for(let u=-4;u<=4;u++){if(l*l+u*u+(a*1.3)**2>o*o+h(l,u,a)*3)continue;let f=_.st,d=h(l,a,u),p=f==="desert"?d<.5?t.sandstone:t.desert_stone:f==="badlands"?d<.5?t.tc_orange:t.tc_red:f==="arctic"||f==="peaks"?a>=o-1?t.snow:d<.5?t.stone:t.cobble:f==="ocean"||f==="shore"?d<.4?t.mossycobble:t.stone:d<.5?t.mossycobble:t.cobble;i(l,a,u,p)}break}case"fossil":{let o=4+Math.floor(e.r*4);for(let a=-o;a<=o;a++){let[l,u]=c(a,0);i(l,0,u,t.silver_sand)}for(let a=-o+1;a<o;a+=2)for(let l=-3;l<=3;l++){let u=3-Math.round(Math.abs(l)*.9),[f,d]=c(a,l);i(f,u,d,t.silver_sand)}break}case"reef":{let o=[t.coral_pink,t.coral_yellow,t.coral_blue,t.coral_purple];for(let a=0;a<6;a++){let l=Math.round((h(a,1,9)-.5)*16),u=Math.round((h(a,2,9)-.5)*16),f=2+h(a,3,9)*2.5,d=o[Math.floor(h(a,4,9)*4)];for(let p=-1;p<=f;p++)for(let m=-5;m<=5;m++)for(let g=-5;g<=5;g++)m*m+g*g+(p*1.4)**2>f*f+h(m+l,g+u,p)*2.5||i(l+m,p,u+g,h(m,p,g+a)<.2?o[a+1&3]:d);for(let p=0;p<3;p++){let m=l+Math.round((h(a,p,11)-.5)*4),g=u+Math.round((h(p,a,12)-.5)*4),v=2+Math.floor(h(a,p,13)*4);for(let x=0;x<v;x++)i(m,Math.floor(f)+x,g,d)}}break}case"igloo":{r(-5,-3,-5,5,-1,5,t.snow);for(let a=0;a<=5;a++)for(let l=-5;l<=5;l++)for(let u=-5;u<=5;u++)l*l+u*u+(a*1.05)**2<=4.5*4.5&&i(l,a,u,t.snow);for(let a=-7;a<=-4;a++)for(let l=-1;l<=1;l++)for(let u=0;u<=2;u++){let[f,d]=c(l,a);i(f,u,d,t.snow)}for(let a=-7;a<=-3;a++)for(let l=0;l<=1;l++){let[u,f]=c(0,a);s(u,l,f)}i(0,6,0,t.packed_ice);break}case"iceberg":{let o=5+e.r*5,a=7+e.r*12;for(let l=-4;l<=a;l++){let u=o*(1-Math.max(0,l)/(a+2))**.8;for(let f=-12;f<=12;f++)for(let d=-12;d<=12;d++){let p=h(f,d,0)*1.6;f*f+d*d>(u+p)*(u+p)||i(f,l,d,l>=a-1?t.snow:h(f,l,d)<.18?t.blue_ice:t.packed_ice)}}break}case"bridge":{let o=_.lava+7-e.y,a=40;for(let l=-a;l<=a;l++){for(let u=-2;u<=2;u++){let[f,d]=c(u,l);i(f,o,d,t.nether_brick)}if(l%2===0)for(let u of[-2,2]){let[f,d]=c(u,l);i(f,o+1,d,t.nether_brick)}if((l%12+12)%12===0){let[u,f]=c(0,l),d=Math.floor(_.column(e.x+u,e.z+f).h)-e.y;for(let p=Math.max(-40,d-2);p<o;p++)for(let m=-1;m<=1;m++){let[g,v]=c(m,l);i(g,p,v,t.nether_brick)}}}break}case"lavaspire":{let o=24+Math.floor(e.r*22);for(let m=-2;m<o;m++){let g=Math.max(0,Math.round((1-m/o)*4.2));for(let v=-g;v<=g;v++)for(let x=-g;x<=g;x++)v*v+x*x<=g*g+.5&&i(v,m,x,h(v,x,m)<.08?t.glowstone:t.netherrack)}for(let m=-1;m<=1;m++)for(let g=-1;g<=1;g++)i(m,o,g,t.glowstone);let a=Math.floor(o*.75),l=Math.round((1-a/o)*4.2)+1,[u,f]=c(0,l);for(let m=a;m>=-1;m--)i(u,m,f,t.lava);let[d,p]=c(0,l+1);for(let m=-2;m<=2;m++)for(let g=-2;g<=2;g++)i(d+m,-1,p+g,t.lava);break}}return n}var Te=6,It=32,ni=class{constructor(e){let t=e.length,n=[];for(let m=0;m<t;m++){let g=e[(m-1+t)%t],v=e[m],x=e[(m+1)%t],M=e[(m+2)%t];for(let b=0;b<16;b++){let T=b/16,E=T*T,P=E*T,C=(W,z,te,Z)=>.5*(2*z+(-W+te)*T+(2*W-5*z+4*te-Z)*E+(-W+3*z-3*te+Z)*P);n.push([C(g[0],v[0],x[0],M[0]),C(g[1],v[1],x[1],M[1])])}}n.push(n[0]);let i=[0];for(let m=1;m<n.length;m++)i.push(i[m-1]+Math.hypot(n[m][0]-n[m-1][0],n[m][1]-n[m-1][1]));let s=i[i.length-1],r=Math.floor(s);this.N=r;let h=this.X=new Float32Array(r),c=this.Z=new Float32Array(r),o=0;for(let m=0;m<r;m++){let g=m/r*s;for(;i[o+1]<g;)o++;let v=(g-i[o])/Math.max(1e-6,i[o+1]-i[o]);h[m]=ue(n[o][0],n[o+1][0],v),c[m]=ue(n[o][1],n[o+1][1],v)}let a=this.TX=new Float32Array(r),l=this.TZ=new Float32Array(r);for(let m=0;m<r;m++){let g=(m-2+r)%r,v=(m+2)%r,x=h[v]-h[g],M=c[v]-c[g],b=Math.hypot(x,M)||1;a[m]=x/b,l[m]=M/b}this.H=new Float32Array(r);let u=1e9,f=-1e9,d=1e9,p=-1e9;for(let m=0;m<r;m++)u=Math.min(u,h[m]),f=Math.max(f,h[m]),d=Math.min(d,c[m]),p=Math.max(p,c[m]);this.bounds={minX:u,maxX:f,minZ:d,maxZ:p},this._buildGrid(),this.q={d:1e9,s:0,i:0,lat:0,h:0}}setHeights(e,t,n=.085){let i=this.N,s=new Float32Array(i);for(let p=0;p<i;p++)s[p]=e(this.X[p],this.Z[p]);let r=(p,m)=>{let g=Math.ceil(m*2.5),v=[],x=0;for(let b=-g;b<=g;b++){let T=Math.exp(-.5*(b/m)**2);v.push(T),x+=T}let M=new Float32Array(i);for(let b=0;b<i;b++){let T=0;for(let E=-g;E<=g;E++)T+=p[(b+E+i)%i]*v[E+g];M[b]=T/x}return M},h=r(s,28),c=8,o=Math.floor(i/c),a=.0011*c*c,l=n*c,u=new Float32Array(o),f=new Float32Array(o);for(let p=0;p<o;p++)f[p]=Math.max(t,h[Math.floor(p*i/o)]),u[p]=f[p];for(let p=0;p<900;p++){if(p<600)for(let m=0;m<o;m++)u[m]+=(f[m]-u[m])*.02;for(let m=0;m<o;m++){let g=u[(m-1+o)%o],v=u[(m+1)%o],x=g-2*u[m]+v;x>a?u[m]+=(x-a)/2:x<-a&&(u[m]+=(x+a)/2)}for(let m=1;m<o*2;m++){let g=u[(m-1)%o],v=m%o;u[v]=Ee(u[v],g-l,g+l)}for(let m=o*2;m>0;m--){let g=u[(m+1)%o],v=m%o;u[v]=Ee(u[v],g-l,g+l)}for(let m=0;m<o;m++)u[m]=Math.max(u[m],t)}let d=new Float32Array(i);for(let p=0;p<i;p++){let m=p*o/i,g=Math.floor(m),v=m-g,x=u[(g-1+o)%o],M=u[g%o],b=u[(g+1)%o],T=u[(g+2)%o];d[p]=.5*(2*M+(-x+b)*v+(2*x-5*M+4*b-T)*v*v+(-x+3*M-3*b+T)*v*v*v)}d=r(d,6),this.H.set(d)}_buildGrid(){let i=this.bounds;this.gx0=Math.floor(i.minX-360),this.gz0=Math.floor(i.minZ-360),this.gw=Math.ceil((i.maxX-i.minX+2*360)/4),this.gh=Math.ceil((i.maxZ-i.minZ+2*360)/4);let s=this.gIdx=new Int32Array(this.gw*this.gh).fill(-1),r=this.gDist=new Float32Array(this.gw*this.gh).fill(1e18),h=Math.ceil(340/4);for(let c=0;c<this.N;c+=4){let o=this.X[c],a=this.Z[c],l=Math.floor((o-this.gx0)/4),u=Math.floor((a-this.gz0)/4);for(let f=-h;f<=h;f++){let d=u+f;if(d<0||d>=this.gh)continue;let p=this.gz0+(d+.5)*4-a,m=p*p;if(!(m>340*340))for(let g=-h;g<=h;g++){let v=l+g;if(v<0||v>=this.gw)continue;let x=this.gx0+(v+.5)*4-o,M=x*x+m,b=d*this.gw+v;M<r[b]&&(r[b]=M,s[b]=c)}}}this.G=4}setCrossing(e,t,n){this.cross={iLow:e,iUp:t,R:n,x:(this.X[e]+this.X[t])/2,z:(this.Z[e]+this.Z[t])/2},this.qa={d:1e9,s:0,i:0,lat:0,h:0},this.qb={d:1e9,s:0,i:0,lat:0,h:0},this.hint=null}_nearWin(e,t,n,i){let s=this.N,r=this.X,h=this.Z,c=1e18,o=n;for(let a=-170;a<=170;a++){let l=(n+a+s)%s,u=e-r[l],f=t-h[l],d=u*u+f*f;d<c&&(c=d,o=l)}return this._proj(e,t,o,i)}near(e,t,n=!0){let i=this.cross;if(i&&Math.abs(e-i.x)<110&&Math.abs(t-i.z)<110){let s=this._nearWin(e,t,i.iLow,this.qa),r=this._nearWin(e,t,i.iUp,this.qb),h;if(n&&this.hint!=null){let o=this.N,a=Math.min(Math.abs(s.s-this.hint),o-Math.abs(s.s-this.hint)),l=Math.min(Math.abs(r.s-this.hint),o-Math.abs(r.s-this.hint));h=a<=l?s:r}else h=s.d<i.R?s:r.d<s.d?r:s;let c=this.q;return c.d=h.d,c.s=h.s,c.i=h.i,c.lat=h.lat,c.h=h.h,c}return this._near(e,t)}_near(e,t){let n=this.q,i=Math.floor((e-this.gx0)/this.G),s=Math.floor((t-this.gz0)/this.G);if(i<0||s<0||i>=this.gw||s>=this.gh)return n.d=1e9,n;let r=s*this.gw+i,h=this.gIdx[r];if(h<0)return n.d=1e9,n;let c=this.N,o=this.X,a=this.Z;if(this.gDist[r]>60*60)return n.d=Math.hypot(e-o[h],t-a[h]),n.s=h,n.i=h,n.h=this.H[h],n.lat=0,n;let l=1e18,u=h;for(let f=-10;f<=10;f++){let d=(h+f+c)%c,p=e-o[d],m=t-a[d],g=p*p+m*m;g<l&&(l=g,u=d)}return this._proj(e,t,u,n)}_proj(e,t,n,i){let s=this.N,r=this.X,h=this.Z,c=(n+1)%s,o=(n-1+s)%s,a,l,u,f=r[c]-r[n],d=h[c]-h[n],p=((e-r[n])*f+(t-h[n])*d)/(f*f+d*d||1);p<0?(f=r[n]-r[o],d=h[n]-h[o],p=Ee(((e-r[o])*f+(t-h[o])*d)/(f*f+d*d||1),0,1),l=r[o]+f*p,u=h[o]+d*p,a=n-1+p):(p=Math.min(p,1),l=r[n]+f*p,u=h[n]+d*p,a=n+p),a<0&&(a+=s);let m=e-l,g=t-u;return i.d=Math.hypot(m,g),i.lat=f*g-d*m>0?i.d:-i.d,i.s=a,i.i=n,i.h=this.hAt(a),i}hAt(e){let t=this.N;e=(e%t+t)%t;let n=Math.floor(e),i=e-n;return ue(this.H[n],this.H[(n+1)%t],i)}};var rn=class{constructor(e,t,n,i){this.B=e,this.A=n,this.mats=i,this.st=e.style||e.key,this.noise=new mt(e.seed),this.noise2=new mt(e.seed+1e3),this.noise3=new mt(e.seed+2e3),this.water=e.water,this.lava=e.lava??-999,this.hw=(e.width||Ji)/2,this.flat=this.hw+5,e.sea&&this._coastSetup(e),this.track=new ni(t),this.under=!!e.underwater;let s=this.under?-999:Math.max(this.water,this.lava)+(e.lava?7:2.5);this.track.setHeights((h,c)=>this.terrainRaw(h,c,0),s,{taiga:.115,arctic:.06,plains:.03,shore:.1,darkforest:.03,cherry:.09,peaks:.05,ocean:.06,badlands:.1,meadow:.115}[this.st]??.1),e.bridge&&this._bridgeSetup(s),this.group=new tn,this.tiles=new Map,this.col={h:0,top:0,smooth:0,d:0,s:0,kind:0,sideTop:0,sub:0,deep:0,fluid:0,raw:0,band:0},this.pathTiles=e.path.map(h=>n[h]),this.treeGrid={desert:8,jungle:4,taiga:5,nether:7,arctic:6,shore:7,plains:7,darkforest:5,cherry:6,peaks:6,ocean:5,badlands:9,meadow:8}[this.st];let r=this.track;this.start={x:r.X[0],z:r.Z[0],tx:r.TX[0],tz:r.TZ[0]},this.cliff={desert:n.desert_stone,jungle:n.stone,taiga:n.stone,nether:n.netherrack,arctic:n.stone,shore:n.stone,plains:n.stone,darkforest:n.stone,cherry:n.stone,peaks:n.stone,ocean:n.stone,badlands:n.tc_orange,meadow:n.stone}[this.st],this.treeCache=new Map,this.structGrid={desert:230,jungle:210,taiga:250,nether:190,arctic:200,shore:90,plains:240,darkforest:200,cherry:220,peaks:240,ocean:120,badlands:220,meadow:260}[this.st],this.structCache=new Map,this.inflight=new Set,this.voxTreeMaxS=2,this.want=null,this.pool=null}_coastSetup(e){let t=e.sea,n=8,i=-1700,s=-1900,r=450,h=560,c=(a,l)=>{let u=!1;for(let f=0,d=t.length-1;f<t.length;d=f++){let[p,m]=t[f],[g,v]=t[d];m>l!=v>l&&a<(g-p)*(l-m)/(v-m)+p&&(u=!u)}return u},o=new Float32Array(r*h);for(let a=0;a<h;a++)for(let l=0;l<r;l++){let u=i+l*n,f=s+a*n,d=1e9;for(let p=0,m=t.length-1;p<t.length;m=p++){let[g,v]=t[m],[x,M]=t[p],b=x-g,T=M-v,E=b*b+T*T,P=Ee(((u-g)*b+(f-v)*T)/E,0,1);d=Math.min(d,Math.hypot(g+b*P-u,v+T*P-f))}o[a*r+l]=c(u,f)?-d:d}this.coastF={f:o,G:n,x0:i,z0:s,W:r,H:h}}inland(e,t){let n=this.coastF,i=Ee((e-n.x0)/n.G,0,n.W-1.001),s=Ee((t-n.z0)/n.G,0,n.H-1.001),r=Math.floor(i),h=Math.floor(s),c=i-r,o=s-h,a=n.f,l=n.W;return ue(ue(a[h*l+r],a[h*l+r+1],c),ue(a[(h+1)*l+r],a[(h+1)*l+r+1],c),o)}inTunnel(e){let t=this.B.tunnel;return!!t&&e>=t[0]&&e<=t[1]}_bridgeSetup(e){let t=this.track,n=t.N,i=1e18,s=0,r=0;for(let c=0;c<n;c+=4)for(let o=c+300;o<n;o+=4){if(n-(o-c)<300)continue;let a=(t.X[c]-t.X[o])**2+(t.Z[c]-t.Z[o])**2;a<i&&(i=a,s=c,r=o)}for(let c=-4;c<=4;c++)for(let o=-4;o<=4;o++){let a=(s+c+n)%n,l=(r+o+n)%n,u=(t.X[a]-t.X[l])**2+(t.Z[a]-t.Z[l])**2;u<i&&(i=u,s=a,r=l)}t.setCrossing(s,r,this.hw+7);let h=t.H[s]+10.5-t.H[r];if(h>0){let c=Math.min(h*.4,Math.max(0,t.H[s]-e-.5)),o=h-c,a=(l,u)=>{let f=Math.max(140,28*u);for(let d=-Math.ceil(f);d<=Math.ceil(f);d++){let p=(l+d+n)%n;t.H[p]+=u*.5*(1+Math.cos(Math.PI*d/f))}};a(r,o),c>0&&a(s,-c)}}buildBridge(e,t,n,i){let s=this.track,r=s.cross,h=this.A;if(!(e>r.x+60||e+n<r.x-60||t>r.z+60||t+n<r.z-60))for(let c=t-1;c<=t+n;c++)for(let o=e-1;o<=e+n;o++){if(Math.abs(o-r.x)>60||Math.abs(c-r.z)>60)continue;let a=s._nearWin(o+.5,c+.5,r.iLow,s.qa),l=a.d;if(l>r.R+1.5)continue;let u=s._nearWin(o+.5,c+.5,r.iUp,s.qb);if(u.d>this.hw+1.4)continue;let f=Math.round(u.h)-1,d=F(r.R-8,r.R+1.5,l),p=R(o,c,74);i(o,f,c,u.d>this.hw+.4?h.grass:h.stone);let m=2+Math.round(d*5+p);for(let g=1;g<=m;g++)i(o,f-g,c,R(o,c+g,75)<.25?h.mossycobble:h.stone)}}structAt(e,t){let n=e+","+t;if(this.structCache.has(n))return this.structCache.get(n);let i=ji(this,e,t);return i&&(i.vox=Qi(this,i),i.ground=new Map),this.structCache.set(n,i),i}structsNear(e,t,n,i){let s=this.structGrid,r=[];for(let h=Math.floor((e-130)/s);h<=Math.floor((n+130)/s);h++)for(let c=Math.floor((t-130)/s);c<=Math.floor((i+130)/s);c++){let o=this.structAt(h,c);o&&r.push(o)}return r}netherRegion(e,t){let n=this.noise3.fbm(e/420+9,t/420-4,3);if(n>.22)return"crimson";if(n<-.25)return"warped";let i=this.noise2.n2(e/34,t/34);return i>.45?"soul":i<-.5?"basalt":"rack"}terrainRaw(e,t,n){let i=this.noise,s=this.noise2,r=this.noise3,h=this.B,c=h.base,o=F(28,210,n),a=e+55*r.n2(e/340+7.1,t/340-3.3),l=t+55*r.n2(e/340-11.7,t/340+5.9),u;switch(this.st){case"taiga":{let f=42*i.fbm(a/520,l/520,4)+16*i.fbm(a/170,l/170,3)+4*i.fbm(a/40,l/40,2),d=F(-.55,.15,s.fbm(e/1500+3,t/1500,3)),p=190*Math.pow(i.ridge(a/600,l/600,5),2.1)*d*(.15+.85*o);u=c+f+p;let m=Math.abs(s.n2(a/900,l/900)),g=(1-F(.02,.07,m))*(.3+.7*o);u=ue(u,this.water-4,g*F(this.water-6,this.water+30,u));break}case"jungle":{let f=34*i.fbm(a/380,l/380,4)+14*i.fbm(a/120,l/120,3)+4*i.fbm(a/40,l/40,2),d=F(0,.45,s.fbm(e/800,t/800,2)),p=85*Math.pow(i.ridge(a/170,l/170,3),4)*d*(.2+.8*o);u=c+f+p;let m=Math.abs(s.n2(a/700,l/700)),g=1-F(.03,.09,m);u=ue(u,this.water-5,g*.95);break}case"desert":{let f=18*Math.pow(i.ridge(a/80,l/200,3),1.5)+22*i.fbm(a/600,l/600,3)+6*i.fbm(a/160,l/160,2),d=s.fbm(e/650,t/650,4),p=F(.12,.2,d)*(34+22*i.fbm(e/170,t/170,2));p=Math.floor(p/6)*6+F(0,1,p%6/6)*0,u=c+f+p*(.1+.9*o);break}case"arctic":{let f=c+4+14*i.fbm(a/300,l/300,4)+4*i.fbm(a/60,l/60,2),d=c-9+3*i.fbm(a/90,l/90,3),p=1-F(70,210,n+60*s.n2(e/300,t/300)),m=F(-.1,.4,s.fbm(e/1300,t/1300,3)),g=170*Math.pow(i.ridge(a/520,l/520,5),2.5)*m*F(260,620,n);u=ue(d,f,p)+g;break}case"shore":{let f=this.inland(e,t)+14*r.n2(e/90,t/90);if(f<0){u=this.water-3-Math.min(9,-f*.06)-2.5*i.fbm(e/30,t/30,2);break}let d=2.5+64*F(0,360,f)+10*i.fbm(a/160,l/160,3),p=120*Math.pow(F(500,1900,f),1.3)*(.4+.6*i.ridge(a/380,l/380,4));u=this.water+d+p;let m=h.rock,g=Math.min(e-m[0],m[2]-e,t-m[1],m[3]-t)+18*s.n2(e/60,t/60);g>0&&(u=Math.max(u,this.water+4+52*F(0,22,g)+3*i.fbm(e/40,t/40,2)));break}case"darkforest":{u=c+4*i.fbm(a/520,l/520,3)+2*i.fbm(a/120,l/120,2)+30*Math.pow(i.ridge(a/900,l/900,3),2.5)*F(300,800,n);let f=F(.42,.55,s.fbm(e/160,t/160,2))*F(40,90,n);u=ue(u,this.water-3,f);break}case"cherry":{let f=24*i.fbm(a/420,l/420,4)+9*i.fbm(a/130,l/130,3),d=F(-.4,.2,s.fbm(e/1300,t/1300,3)),p=150*Math.pow(i.ridge(a/560,l/560,5),2.2)*d*(.1+.9*o);u=c+f+p;let m=Math.abs(s.n2(a/800,l/800));u=ue(u,this.water-3,(1-F(.02,.06,m))*F(50,120,n));break}case"peaks":{let f=c+5*i.fbm(a/400,l/400,3)+3*i.fbm(a/110,l/110,2),d=300*Math.pow(i.ridge(a/420,l/420,5),1.9)*F(70,420,n),p=90*Math.pow(i.ridge(a/150,l/150,3),3)*F(60,240,n);u=f+d+p;break}case"ocean":{let f=1.2*Math.pow(i.ridge(e/14,t/34,2),2),d=14*Math.pow(Math.max(0,s.fbm(a/110,l/110,3)),1.5)*(.3+.7*o),p=Math.abs(r.n2(a/520,l/520)),m=(1-F(.02,.07,p))*26*F(40,120,n);u=c+6*i.fbm(a/300,l/300,3)+3*i.fbm(a/70,l/70,2)+f+d-m+60*Math.pow(i.ridge(a/700,l/700,4),3)*F(250,700,n);break}case"badlands":{let f=c+3*i.fbm(a/300,l/300,3),d=s.fbm(e/520,t/520,4),p=F(.05,.13,d)*(34+26*i.fbm(e/190,t/190,2));p=Math.floor(p/5)*5;let m=F(-.05,-.25,d)*F(30,90,n),g=Math.max(0,r.n2(e/11,t/11)-.5)/.5,v=m*Math.floor(Math.pow(g,.55)*42/3)*3;u=f+p*(.15+.85*o)+v;break}case"meadow":{let f=30*i.fbm(a/460,l/460,4)+12*i.fbm(a/150,l/150,3),d=F(-.55,.15,s.fbm(e/1500+3,t/1500,3)),p=200*Math.pow(i.ridge(a/600,l/600,5),2.1)*d*(.12+.88*o);u=c+f+p;break}case"plains":{let f=7*i.fbm(a/650,l/650,3)+3*i.fbm(a/180,l/180,2),d=60*Math.pow(i.ridge(a/900,l/900,4),2.4)*F(380,900,n);u=c+f+d;let p=Math.abs(s.n2(a/1100,l/1100));u=ue(u,this.water-3,(1-F(.015,.05,p))*F(60,140,n));break}case"nether":{let f=40*i.fbm(a/420,l/420,4)+16*i.fbm(a/130,l/130,3)+6*i.fbm(a/45,l/45,2),d=95*Math.pow(i.ridge(a/260,l/260,4),3)*(.2+.8*o),p=F(-.1,.3,s.fbm(e/520,t/520,3))*o;u=c+f+d-p*48;break}}return u+this.detail(e,t,n)}detail(e,t,n){if(n<12)return 0;let i=this.noise,s=this.noise3,r=F(12,24,n),h=Math.max(0,this.noise2.fbm(e/47+5,t/47-2,2)-.18);switch(this.st){case"taiga":return r*(3.2*s.fbm(e/24,t/24,3)+1.2*i.n2(e/7.5,t/7.5)+16*h);case"jungle":return r*(3.8*s.fbm(e/20,t/20,3)+1.4*i.n2(e/6.5,t/6.5)+20*h);case"desert":return r*(3.5*Math.pow(i.ridge(e/16,t/34,2),2)+1.2*s.fbm(e/22,t/22,2)+9*h);case"arctic":return r*(2.6*s.fbm(e/18,t/30,3)+.8*i.n2(e/6,t/6)+12*h);case"nether":return r*(4.2*s.fbm(e/16,t/16,3)+1.8*i.n2(e/5.5,t/5.5)+18*h);case"shore":return this.inland(e,t)<6?0:r*(1.6*s.fbm(e/20,t/20,2)+9*h);case"darkforest":return r*(1.4*s.fbm(e/22,t/22,2)+.6*i.n2(e/7,t/7)+6*h);case"cherry":return r*(2.2*s.fbm(e/22,t/22,3)+.8*i.n2(e/7,t/7)+11*h);case"peaks":return r*(3*s.fbm(e/18,t/18,3)+1.2*i.n2(e/6,t/6)+14*h);case"ocean":return r*(1*s.fbm(e/16,t/16,2)+5*h);case"badlands":return r*(.8*s.fbm(e/24,t/24,2)+3*h);case"meadow":return r*(2.6*s.fbm(e/24,t/24,3)+.9*i.n2(e/7.5,t/7.5)+13*h);case"plains":return r*(1*s.fbm(e/26,t/26,2)+.4*i.n2(e/8,t/8)+3*h)}return 0}runoff(e,t){return this.st==="shore"?this.hw+1.2:this.hw+1.6+3.4*(.5+.5*this.noise3.n2(e/41+3.7,t/41-8.1))}column(e,t){let n=this.col,i=this.A,s=this.B,r=this.track.near(e+.5,t+.5,!1);n.d=r.d,n.s=r.s,n.fluid=0,n.band=0;let h=r.d<60?this.runoff(e+.5,t+.5):this.hw+4;if(r.d<h)return n.smooth=1,n.h=r.h,n.raw=r.h,r.d<this.hw?(n.kind=1,n.top=this.pathTile(e,t,r),n.sideTop=n.top,n.sub=this.st==="nether"?i.nether_brick:i.stone_brick,n.deep=n.sub):(n.kind=2,this.surfaceTiles(n,Math.floor(n.h),e,t,!1)),n;n.smooth=0,n.kind=0;let c=r.h,o=r.d,a=this.terrainRaw(e,t,o),l;if(o>1e8)l=Math.round(a);else{let u=a-c,f=F(h-.5,h+3.5+.5*Math.abs(u),o);l=Math.round(ue(c,a,f))}return n.raw=l,s.ice&&l<this.water?(n.h=this.water,n.top=i.ice,n.sideTop=i.packed_ice,n.sub=i.packed_ice,n.deep=i.stone,n):(n.h=l,this.surfaceTiles(n,l,e,t,!1),l<this.water&&!this.under?n.fluid=1:l<this.lava&&(n.fluid=2),n)}pathTile(e,t,n){let i=this.A,s=this.track,r=e+.5-this.start.x,h=t+.5-this.start.z,c=r*this.start.tx+h*this.start.tz,o=this.pathTiles,a=R(e,t,5),l=this.noise2.n2(e/9,t/9);return l>.4?o[1%o.length]:l<-.5?o[2%o.length]:o[Math.floor(a*a*o.length)]}surfaceTiles(e,t,n,i){let s=this.A,r=this.B,h=r.base;if(e.kind===0&&t>=this.water+1){let c=this.noise2.fbm(n/47+5,i/47-2,2),o=this.noise3.n2(n/13+40,i/13-7),a=R(n,i,61);if(c>.36+.05*o){let l=this.st;if(l==="taiga"||l==="jungle"){e.top=a<.45?s.mossycobble:a<.8?s.stone:s.cobble,e.sideTop=s.stone,e.sub=s.stone,e.deep=s.stone;return}if(l==="desert"&&t<=h+20){e.top=a<.7?s.desert_stone:s.desert_sandstone,e.sideTop=s.desert_stone,e.sub=s.desert_stone,e.deep=s.desert_stone;return}if(l==="arctic"&&a<.55){e.top=s.stone,e.sideTop=s.stone,e.sub=s.stone,e.deep=s.stone;return}}if(this.st==="taiga"&&t<h+48){if(o>.42){e.top=s.coniferous_litter,e.sideTop=s.coniferous_litter_side,e.sub=s.dirt,e.deep=s.stone;return}if(o<-.62){e.top=a<.6?s.gravel:s.dirt,e.sideTop=s.dirt,e.sub=s.dirt,e.deep=s.stone;return}if(Math.abs(o)<.025){e.top=s.dirt,e.sideTop=s.dirt,e.sub=s.dirt,e.deep=s.stone;return}}if(this.st==="jungle"&&t<h+48){if(o<-.6){e.top=s.dirt,e.sideTop=s.dirt,e.sub=s.dirt,e.deep=s.stone;return}if(o>.6){e.top=s.mossycobble,e.sideTop=s.mossycobble,e.sub=s.dirt,e.deep=s.stone;return}}if(this.st==="desert"&&t<=h+20){if(o>.55){e.top=s.desert_sandstone,e.sideTop=s.desert_sandstone,e.sub=s.desert_sandstone,e.deep=s.desert_stone;return}if(o<-.6){e.top=s.sand,e.sideTop=s.sand,e.sub=s.sand,e.deep=s.sandstone;return}}if(this.st==="arctic"&&o<-.62&&a<.6){e.top=s.gravel,e.sideTop=s.gravel,e.sub=s.permafrost,e.deep=s.stone;return}}switch(this.st){case"desert":t>h+20?(e.top=s.red_sand,e.sideTop=s.tc_orange,e.sub=s.tc_orange,e.deep=s.tc_red,e.band=1):t<this.water+2&&e.kind!==2?(e.top=t<this.water+1?s.sand:s.grass,e.sideTop=t<this.water+1?s.sand:s.grass_side,e.sub=s.sand,e.deep=s.sandstone):(e.top=e.kind===2?s.sand:s.desert_sand,e.sideTop=e.top,e.sub=e.top,e.deep=s.desert_sandstone);break;case"jungle":if(t<this.water+1){e.top=s.clay,e.sideTop=s.clay,e.sub=s.dirt,e.deep=s.stone;break}if(t>h+48){e.top=s.stone,e.sideTop=s.mossycobble,e.sub=s.stone,e.deep=s.stone;break}e.kind===2||this.noise2.n2(n/14,i/14)>.2?(e.top=s.grass,e.sideTop=s.grass_side):(e.top=s.litter,e.sideTop=s.litter_side),e.sub=s.dirt,e.deep=s.stone;break;case"taiga":{let c=5*this.noise2.n2(n/22,i/22);if(t<this.water+1){e.top=s.sand,e.sideTop=s.sand,e.sub=s.sand,e.deep=s.stone;break}if(t>h+95+c){e.top=s.snow,e.sideTop=s.snow_side,e.sub=s.stone,e.deep=s.stone;break}if(t>h+70+c){e.top=s.stone,e.sideTop=s.stone,e.sub=s.stone,e.deep=s.stone;break}if(t>h+48+c){e.top=s.coniferous_litter,e.sideTop=s.coniferous_litter_side,e.sub=s.dirt,e.deep=s.stone;break}e.top=s.grass,e.sideTop=s.grass_side,e.sub=s.dirt,e.deep=s.stone;break}case"nether":{let c=this.netherRegion(n,i);e.sub=s.netherrack,e.deep=s.netherrack,e.sideTop=s.netherrack,c==="crimson"?e.top=s.crimson_nylium:c==="warped"?e.top=s.warped_nylium:c==="soul"?(e.top=s.nether_sand,e.sideTop=s.soul_soil,e.sub=s.soul_soil):c==="basalt"?(e.top=s.basalt_top,e.sideTop=s.basalt,e.sub=s.basalt):e.top=s.netherrack;break}case"shore":{let c=this.inland(n,i),o=R(n,i,63);if(t<this.water){if(this.noise2.n2(n/34,i/34)+.3*this.noise3.n2(n/9,i/9)>.25&&t>this.water-9){let l=[s.coral_pink,s.coral_yellow,s.coral_blue,s.coral_purple];e.top=l[Math.floor(R(Math.floor(n/3),Math.floor(i/3),64)*4)],e.sideTop=e.top,e.sub=s.sand,e.deep=s.stone;break}e.top=t<this.water-8?s.gravel:s.sand,e.sideTop=e.top,e.sub=s.sand,e.deep=s.stone;break}if(c<22&&t<this.water+5){e.top=o<.45?s.stone:o<.7?s.gravel:s.sand,e.sideTop=s.stone,e.sub=s.stone,e.deep=s.stone;break}if(t>this.water+150){e.top=t>this.water+260?s.snow:s.stone,e.sideTop=e.top===s.snow?s.snow_side:s.stone,e.sub=s.stone,e.deep=s.stone;break}if(this.noise2.n2(n/21,i/21)>.42){e.top=o<.7?s.stone:s.gravel,e.sideTop=s.stone,e.sub=s.stone,e.deep=s.stone;break}e.top=s.grass,e.sideTop=s.grass_side,e.sub=s.dirt,e.deep=s.stone;break}case"darkforest":{if(t<this.water+1){e.top=s.dirt,e.sideTop=s.dirt,e.sub=s.dirt,e.deep=s.stone;break}let c=this.noise3.n2(n/17+3,i/17-9);c>.35?(e.top=s.coniferous_litter,e.sideTop=s.coniferous_litter_side):c<-.55?(e.top=s.moss,e.sideTop=s.moss):(e.top=s.grass,e.sideTop=s.grass_side),e.sub=s.dirt,e.deep=s.stone;break}case"cherry":case"meadow":{let c=5*this.noise2.n2(n/22,i/22);if(t<this.water+1){e.top=s.sand,e.sideTop=s.sand,e.sub=s.sand,e.deep=s.stone;break}if(t>h+110+c){e.top=s.snow,e.sideTop=s.snow_side,e.sub=s.stone,e.deep=s.stone;break}if(t>h+80+c){e.top=s.stone,e.sideTop=s.stone,e.sub=s.stone,e.deep=s.stone;break}e.top=s.grass,e.sideTop=s.grass_side,e.sub=s.dirt,e.deep=s.stone;break}case"peaks":{let c=6*this.noise2.n2(n/18,i/18),o=R(n,i,65);if(t<this.water+1){e.top=s.gravel,e.sideTop=s.gravel,e.sub=s.stone,e.deep=s.stone;break}if(t>h+170+c){e.top=o<.6?s.packed_ice:s.snow,e.sideTop=s.packed_ice,e.sub=s.packed_ice,e.deep=s.stone;break}if(t>h+55+c){e.top=s.snow,e.sideTop=s.snow_side,e.sub=s.stone,e.deep=s.stone;break}if(t>h+22+c){e.top=o<.2?s.gravel:s.stone,e.sideTop=s.stone,e.sub=s.stone,e.deep=s.stone;break}e.top=s.grass,e.sideTop=s.grass_side,e.sub=s.dirt,e.deep=s.stone;break}case"ocean":{let c=this.noise2.fbm(n/110,i/110,3),o=R(n,i,66);if(c>.12&&this.noise3.n2(n/7,i/7)>-.3){let l=[s.coral_pink,s.coral_yellow,s.coral_blue,s.coral_purple];e.top=l[Math.floor(R(Math.floor(n/4),Math.floor(i/4),67)*4)],e.sideTop=e.top,e.sub=s.sand,e.deep=s.stone;break}let a=this.noise3.n2(n/23+5,i/23);e.top=a>.45?s.gravel:a<-.6?s.clay:o<.04?s.silver_sand:s.sand,e.sideTop=e.top===s.clay?s.clay:s.sand,e.sub=s.sand,e.deep=s.stone;break}case"badlands":{if(t<this.water+1){e.top=s.red_sand,e.sideTop=s.red_sand,e.sub=s.red_sand,e.deep=s.tc_orange;break}if(t>h+6){let c=t>h+26&&this.noise3.n2(n/60,i/60)>.1;e.top=c?R(n,i,68)<.6?s.dry_dirt:s.grass:s.red_sand,e.sideTop=s.tc_orange,e.sub=s.tc_orange,e.deep=s.tc_red,e.band=1;break}e.top=s.red_sand,e.sideTop=s.red_sand,e.sub=s.red_sand,e.deep=s.tc_orange;break}case"plains":{if(t<this.water+1){e.top=s.sand,e.sideTop=s.sand,e.sub=s.dirt,e.deep=s.stone;break}let c=this.noise3.n2(n/30+11,i/30-4);if(e.kind===0&&c>.62){e.top=s.dirt,e.sideTop=s.dirt,e.sub=s.dirt,e.deep=s.stone;break}e.top=s.grass,e.sideTop=s.grass_side,e.sub=s.dirt,e.deep=s.stone;break}case"arctic":if(t>h+45+4*this.noise2.n2(n/14,i/14)&&this.noise2.n2(n/7,i/7)>.1){e.top=s.stone,e.sideTop=s.stone,e.sub=s.stone,e.deep=s.stone;break}e.top=s.snow,e.sideTop=s.snow_side,e.sub=s.permafrost,e.deep=s.stone;break}}treeAtCell(e,t){let n=e*100003+t,i=this.treeCache.get(n);if(i!==void 0)return i;let s=this._treeAtCell(e,t);return this.treeCache.size>6e4&&this.treeCache.clear(),this.treeCache.set(n,s),s}_treeAtCell(e,t){let n=this.treeGrid,i=this.B.seed,s=this.st,r=this.A,h=e*n+Math.floor(R(e,t,i+1)*n),c=t*n+Math.floor(R(e,t,i+2)*n),o=this.noise3.fbm(h/260,c/260,2),a;switch(s){case"taiga":a=.3+.6*F(-.3,.25,o);break;case"jungle":a=.55+.4*F(-.3,.3,o);break;case"desert":a=.16;break;case"arctic":a=.1+.5*F(-.2,.35,o);break;case"nether":{let p=this.netherRegion(h,c);a=p==="crimson"||p==="warped"?.7:.28;break}case"shore":a=this.inland(h,c)<12?0:.12+.3*F(-.2,.35,o);break;case"plains":a=.05+.4*F(.15,.5,o);break;case"darkforest":a=.62+.36*F(-.4,.2,o);break;case"cherry":a=.3+.45*F(-.3,.3,o);break;case"peaks":a=.12+.4*F(-.2,.3,o);break;case"ocean":a=.2+.4*F(0,.4,this.noise2.fbm(h/110,c/110,3));break;case"badlands":a=.14;break;case"meadow":a=.04+.22*F(.2,.55,o);break}if(R(e,t,i)>a)return null;if(s==="plains")return this._buildingCell(e,t,h,c);let l=this.column(h,c);if(l.d<this.hw+(s==="darkforest"?5:7)+4*R(e,t,i+6)||l.fluid||l.smooth)return null;let u=R(e,t,i+3),f=this.B.base,d=null;if(s==="taiga")l.top===r.snow||l.top===r.stone||l.top===r.sand?d=null:l.h>f+40||l.top===r.coniferous_litter?d=u<.85?"spruce":"bush":d=u<.35?"oak":u<.6?"birch":u<.82?"spruce":u<.92?"bigoak":"bush";else if(s==="jungle")l.top===r.stone||l.top===r.clay?d=null:d=u<.22?"giant":u<.55?"jungle":u<.9?"bush":"oak";else if(s==="desert")d=l.band?null:l.h<this.water+4?u<.75?"palm":null:u<.82?"cactus":u<.9?"acacia":"deadbush";else if(s==="arctic")d=l.top===r.ice?u<.04?"spike":null:l.top===r.stone?null:u<.9?"spruce":"spike";else if(s==="nether"){let p=this.netherRegion(h,c);p==="crimson"?d=u<.8?"crimson":"glow":p==="warped"?d=u<.8?"warped":"glow":p==="basalt"?d=u<.7?"pillar":null:p==="soul"?d=u<.3?"spire":null:d=u<.35?"pillar":u<.7?"spire":"glow"}else s==="shore"?d=l.top!==r.grass?null:u<.55?"oak":u<.75?"birch":"bush":s==="darkforest"?d=l.top===r.dirt?null:u<.72?"darkoak":u<.8?"redmush":u<.86?"brownmush":u<.94?"oak":"bush":s==="cherry"?d=l.top!==r.grass?null:u<.82?"cherry":u<.92?"cbush":"oak":s==="peaks"?d=l.top===r.snow||l.top===r.packed_ice?u<.12?"spike":null:l.top===r.grass?u<.9?"spruce":"bush":u<.25?"spruce":null:s==="ocean"?d=u<.75?"coral":"pillar_p":s==="badlands"?d=l.top===r.grass||l.top===r.dry_dirt?u<.7?"oak":"deadbush":l.band?null:u<.55?"cactus":"deadbush":s==="meadow"&&(d=l.top!==r.grass?null:u<.45?"oak":u<.75?"birch":"bush");return d?{type:d,x:h,z:c,y:l.h,r:R(e,t,i+4),h2:R(e,t,i+5)}:null}_buildingCell(e,t,n,i){let s=this.treeGrid,r=this.B.seed,h=this.A,c=this.st==="shore",o=R(e,t,r+3),a=R(e,t,r+4),l=R(e,t,r+5),u=this.track.near(n+.5,i+.5,!1);if(c){let p=this.inland(n,i),m=p<700&&u.d<520;if(p>30&&(m?o<.82:o<.2)){let v=2+Math.floor(a*(s/2-3)),x=e*s+Math.floor(s/2),M=t*s+Math.floor(s/2),b=this.track.near(x+.5,M+.5,!1);if(b.d<this.runoff(x,M)+v*1.45+2.5)return null;let T=1e9,E=-1e9;for(let[C,W]of[[-v,-v],[v,-v],[-v,v],[v,v],[0,0]]){let z=this.column(x+C,M+W);if(z.fluid||z.smooth)return null;T=Math.min(T,z.h),E=Math.max(E,z.h)}if(E-T>9)return null;let P=(m?6+Math.floor(Math.pow(l,1.6)*26):4+Math.floor(l*4))+(b.d<60?0:2);return{type:"house",x,z:M,y:T,hs:v,tall:P,r:a,h2:l,base:E-T}}if(o<.92&&p>10){let v=this.column(n,i);return v.fluid||v.smooth||v.d<this.runoff(n,i)+2?null:{type:u.d<260||a<.6?"palm":"oak",x:n,z:i,y:v.h,r:a,h2:l}}return null}let f=this.column(n,i);return f.d<this.hw+9+4*R(e,t,r+6)||f.fluid||f.smooth?null:{type:o<.4?"oak":o<.55?"bigoak":o<.75?"birch":"bush",x:n,z:i,y:f.h,r:a,h2:l}}buildTree(e,t){let n=this.A,{x:i,y:s,z:r}=e,h=e.r,c=(o,a,l,u,f,d,p=.8)=>{let m=Math.ceil(Math.max(u,f));for(let g=-m;g<=m;g++)for(let v=-m;v<=m;v++)for(let x=-m;x<=m;x++){let M=(v*v+x*x)/(u*u)+g*g/(f*f);M>1.05||M>.62&&R(o+v*7+g*3,l+x*13+g*31,9)>p||t(o+v,a+g,l+x,d,!0)}};switch(e.type){case"oak":{let o=5+Math.floor(h*3);for(let a=0;a<o;a++)t(i,s+a,r,n.tree);c(i,s+o-1,r,2.7,2.2,n.leaves,.7);break}case"bigoak":{let o=8+Math.floor(h*4);for(let l=0;l<o;l++)t(i,s+l,r,n.tree);let a=[[1,0],[-1,0],[0,1],[0,-1]];for(let l=0;l<4;l++){let[u,f]=a[l],d=s+o-4+(l&1);for(let p=1;p<=3;p++)t(i+u*p,d+(p>>1),r+f*p,n.tree);c(i+u*3,d+2,r+f*3,2.6,1.8,n.leaves,.7)}c(i,s+o,r,3.4,2.6,n.leaves,.7);break}case"birch":{let o=6+Math.floor(h*4);for(let a=0;a<o;a++)t(i,s+a,r,n.aspen);c(i,s+o-1,r,2.2,2.6,n.aspen_leaves,.75);break}case"spruce":{let o=9+Math.floor(h*10),a=this.st==="arctic"||s>this.B.base+60;for(let l=0;l<o;l++)t(i,s+l,r,n.pine);for(let l=3;l<=o+1;l++){let u=(o+1-l)/(o-2),f=l===o+1?0:Math.max(0,Math.round(u*3.4+(l&1?-.4:.5)));for(let d=-f;d<=f;d++)for(let p=-f;p<=f;p++)d*d+p*p>f*f+.6||(d===0&&p===0&&l<o||t(i+d,s+l,r+p,n.pine_needles,!0),a&&l&1&&d*d+p*p>(f-1)*(f-1)&&f>0&&t(i+d,s+l+1,r+p,n.snow,!1,!0))}a&&t(i,s+o+2,r,n.snow,!1,!0);break}case"giant":{let o=20+Math.floor(h*10);for(let a=0;a<o;a++)for(let l=0;l<2;l++)for(let u=0;u<2;u++)t(i+l,s+a,r+u,n.jungletree);c(i,s+o,r,5.5,2.4,n.jungleleaves,.7);for(let a=0;a<14;a++){let l=a*.45+e.h2*6,u=i+Math.round(Math.cos(l)*5),f=r+Math.round(Math.sin(l)*5),d=3+Math.floor(R(u,f,5)*9);for(let p=1;p<=d;p++)t(u,s+o-1-p,f,n.vine,!0)}for(let a=0;a<3;a++){let l=e.h2*6.28+a*2.1,u=s+Math.floor(o*(.5+.12*a)),f=Math.round(Math.cos(l)*4),d=Math.round(Math.sin(l)*4);for(let p=1;p<=4;p++)t(i+Math.round(f*p/4),u+(p>>1),r+Math.round(d*p/4),n.jungletree);c(i+f,u+3,r+d,3,1.6,n.jungleleaves,.7)}break}case"jungle":{let o=9+Math.floor(h*8);for(let a=0;a<o;a++)t(i,s+a,r,n.jungletree);c(i,s+o,r,3.3,1.8,n.jungleleaves,.7);for(let a=0;a<6;a++){let l=a*1.05+e.h2*6,u=i+Math.round(Math.cos(l)*3),f=r+Math.round(Math.sin(l)*3),d=2+Math.floor(R(u,f,5)*6);for(let p=1;p<=d;p++)t(u,s+o-1-p,f,n.vine,!0)}break}case"bush":{let o=this.st==="jungle"?n.jungleleaves:n.leaves;t(i,s,r,this.st==="jungle"?n.jungletree:n.tree),c(i,s+1,r,2.2,1.4,o,.6);break}case"house":{let o=e.hs,a=e.tall,l=e.y-2,u=[n.tc_white,n.sandstone_block,n.tc_yellow,n.wool_white,n.tc_orange,n.tc_white,n.tc_lgray],f=u[Math.floor(e.h2*977)%u.length],d=a>10||e.r<.35;for(let m=0;m<=a+2+e.base;m++){let g=l+m,v=m-2-e.base;for(let x=-o;x<=o;x++)for(let M=-o;M<=o;M++){if(!(Math.abs(x)===o||Math.abs(M)===o)&&m!==0)continue;let T=Math.abs(x)===o&&Math.abs(M)===o,E=v>0&&v%3===1&&!T&&(x+M&1)===0;t(i+x,g,r+M,v<1?n.stone_block:E?n.glass:f)}}let p=l+a+3+e.base;if(d)for(let m=-o;m<=o;m++)for(let g=-o;g<=o;g++)t(i+m,p,r+g,n.stone_block),(Math.abs(m)===o||Math.abs(g)===o)&&t(i+m,p+1,r+g,f);else for(let m=0;m<=o;m++)for(let g=-o-1+m;g<=o+1-m;g++)for(let v=-o-1+m;v<=o+1-m;v++)Math.max(Math.abs(g),Math.abs(v))===o+1-m&&t(i+g,p+m,r+v,m===o?n.tc_red:n.brick);break}case"farmhouse":{let o=e.hs,a=e.y;for(let l=0;l<=3;l++)for(let u=-o;u<=o;u++)for(let f=-o;f<=o;f++){if(!(Math.abs(u)===o||Math.abs(f)===o)&&l)continue;let p=Math.abs(u)===o&&Math.abs(f)===o;t(i+u,a+l,r+f,l===0?n.cobble:p?n.tree:l===2&&!p&&(u+f)%2===0?n.glass:n.planks)}for(let l=0;l<=o+1;l++)for(let u=-o-1;u<=o+1;u++)if(t(i+u,a+4+l,r-o-1+l,n.pine_planks),t(i+u,a+4+l,r+o+1-l,n.pine_planks),l<=o)for(let f=-o+l;f<=o-l;f++)(u===-o-1||u===o+1)&&t(i+u,a+4+l,r+f,n.planks);break}case"darkoak":{let o=6+Math.floor(h*4);for(let a=0;a<o;a++)for(let l=0;l<2;l++)for(let u=0;u<2;u++)t(i+l,s+a,r+u,n.darkoak);c(i,s+o,r,4.6+h,1.8,n.darkoak_leaves,.72),c(i,s+o+2,r,3.2,1.4,n.darkoak_leaves,.7);break}case"redmush":{let o=5+Math.floor(h*4);for(let a=0;a<o;a++)t(i,s+a,r,n.mush_stem);for(let a=-2;a<=1;a++)for(let l=-3;l<=3;l++)for(let u=-3;u<=3;u++){let f=a===1?2:3,d=Math.max(Math.abs(l),Math.abs(u));d>f||a<1&&d<f||a===1&&d===f&&Math.abs(l)===Math.abs(u)||Math.abs(l)===3&&Math.abs(u)===3||t(i+l,s+o+a,r+u,n.mush_red)}break}case"brownmush":{let o=5+Math.floor(h*4);for(let a=0;a<o;a++)t(i,s+a,r,n.mush_stem);for(let a=-4;a<=4;a++)for(let l=-4;l<=4;l++)!(Math.abs(a)===4&&Math.abs(l)>=3)&&!(Math.abs(l)===4&&Math.abs(a)>=3)&&t(i+a,s+o,r+l,n.mush_brown);break}case"cherry":{let o=4+Math.floor(h*2);for(let l=0;l<o;l++)t(i,s+l,r,n.cherry_log);let a=e.h2*6.28;for(let l of[1,-1]){let u=Math.round(Math.cos(a)*l),f=Math.round(Math.sin(a)*l),d=i,p=r,m=s+o-1;for(let v=1;v<=3;v++)d+=u,p+=f,m+=1,t(d,m,p,n.cherry_log);let g=l>0?2.4:2;c(d,m+2,p,3.6+h*.8,g,n.cherry_leaves,.75);for(let v=0;v<7;v++){let x=v*.9+e.h2*5,M=d+Math.round(Math.cos(x)*3),b=p+Math.round(Math.sin(x)*3),T=1+Math.floor(R(M,b,12)*3);for(let E=0;E<T;E++)t(M,m-E,b,n.cherry_leaves,!0)}}break}case"cbush":{t(i,s,r,n.cherry_log),c(i,s+1,r,2.2,1.4,n.cherry_leaves,.6);break}case"coral":{let o=[n.coral_pink,n.coral_yellow,n.coral_blue,n.coral_purple],a=o[Math.floor(h*4)],l=o[Math.floor(e.h2*4)];c(i,s,r,1.6+h*1.4,1.3,a,.8);for(let u=0;u<4;u++){let f=u*1.57+e.h2*3,d=2+Math.floor(R(i+u,r,13)*4),p=i+Math.round(Math.cos(f)*1.5),m=r+Math.round(Math.sin(f)*1.5);for(let g=0;g<d;g++)t(p,s+1+g,m,u&1?l:a),g===d-2&&(p+=Math.round(Math.cos(f)),m+=Math.round(Math.sin(f)))}break}case"pillar_p":{let o=3+Math.floor(h*h*14);for(let a=0;a<o;a++)for(let l=0;l<2;l++)for(let u=0;u<2;u++)t(i+l,s+a,r+u,R(i+l,s+a,r+u)<.35?n.mossycobble:n.stone);break}case"cactus":{let o=2+Math.floor(h*3);for(let a=0;a<o;a++)t(i,s+a,r,n.cactus);break}case"deadbush":t(i,s,r,n.acacia);break;case"palm":{let o=6+Math.floor(h*4),a=e.h2<.5?1:-1,l=i;for(let f=0;f<o;f++)f===Math.floor(o*.6)&&(l+=a),t(l,s+f,r,n.jungletree);let u=s+o;t(l,u,r,n.leaves,!0);for(let[f,d]of[[1,0],[-1,0],[0,1],[0,-1],[1,1],[-1,-1],[1,-1],[-1,1]]){let p=f&&d?2:3;for(let m=1;m<=p;m++)t(l+f*m,u-(m===p?1:0),r+d*m,n.leaves,!0)}break}case"acacia":{let o=5+Math.floor(h*2),a=e.h2<.5?1:-1;for(let l=0;l<o;l++)t(i+(l>2?a:0),s+l,r,n.acacia);for(let l=-3;l<=3;l++)for(let u=-3;u<=3;u++)l*l+u*u<=10&&t(i+a+l,s+o,r+u,n.acacia_leaves,!0);for(let l=-1;l<=1;l++)for(let u=-1;u<=1;u++)t(i+a+l,s+o+1,r+u,n.acacia_leaves,!0);break}case"spike":{let o=8+Math.floor(h*h*26);for(let a=0;a<o;a++){let l=a<o*.3?1:0;for(let u=-l;u<=l;u++)for(let f=-l;f<=l;f++)Math.abs(u)+Math.abs(f)<=l&&t(i+u,s+a,r+f,n.packed_ice)}break}case"pillar":{let o=4+Math.floor(h*h*22),a=h>.55?2:1;for(let l=0;l<o;l++)for(let u=0;u<a;u++)for(let f=0;f<a;f++)t(i+u,s+l,r+f,l===o-1?n.basalt_top:n.basalt);e.h2<.4&&c(i,s+o,r,1.6,1.2,n.glowstone,.8);break}case"spire":{let o=10+Math.floor(h*h*30);for(let a=0;a<o;a++){let l=Math.max(0,Math.round((1-a/o)*2.4));for(let u=-l;u<=l;u++)for(let f=-l;f<=l;f++)u*u+f*f<=l*l+.5&&t(i+u,s+a,r+f,n.netherrack)}break}case"glow":c(i,s+1,r,1.5,1.2,n.glowstone,.8);break;case"crimson":case"warped":{let o=e.type==="crimson",a=5+Math.floor(h*9),l=o?n.crimson_stem:n.warped_stem,u=o?n.wart:n.warped_wart;for(let d=0;d<a;d++)t(i,s+d,r,l);let f=2.4+h*1.6;for(let d=-2;d<=1;d++)for(let p=-4;p<=4;p++)for(let m=-4;m<=4;m++){let g=p*p+m*m,v=f*(d===1?.6:1);g>v*v||d<0&&g<(v-1.2)*(v-1.2)||t(i+p,s+a+d,r+m,R(i+p*3,r+m*5+d,3)<.12?n.shroomlight:u)}if(o)for(let d=0;d<6;d++){let p=d*1.05+e.h2*6,m=i+Math.round(Math.cos(p)*(f-.8)),g=r+Math.round(Math.sin(p)*(f-.8)),v=2+Math.floor(R(m,g,8)*5);for(let x=1;x<=v;x++)t(m,s+a-2-x,g,n.wart,!0)}break}}}treeProxy(e){let t=this.A,n=e.r;switch(e.type){case"oak":return{y0:3,y1:7+n*2,rad:2.5,tile:t.leaves_o,trunk:t.tree};case"bigoak":return{y0:5,y1:12+n*4,rad:4.5,tile:t.leaves_o,trunk:t.tree};case"birch":return{y0:4,y1:9+n*4,rad:2,tile:t.aspen_leaves_o,trunk:t.aspen};case"spruce":return{y0:2,y1:10+n*10,rad:2.2,tile:t.pine_needles_o,trunk:t.pine,cone:!0};case"giant":return{y0:14,y1:24+n*10,rad:5.5,tile:t.jungleleaves_o,trunk:t.jungletree};case"jungle":return{y0:7,y1:11+n*8,rad:3,tile:t.jungleleaves_o,trunk:t.jungletree};case"bush":return{y0:0,y1:2.5,rad:2,tile:this.st==="jungle"?t.jungleleaves_o:t.leaves_o};case"acacia":return{y0:5,y1:7,rad:3.2,tile:t.acacia_leaves_o,trunk:t.acacia};case"cactus":return{y0:0,y1:2+n*3,rad:.5,tile:t.cactus};case"darkoak":return{y0:5,y1:10+n*4,rad:4.8,tile:t.darkoak_leaves_o,trunk:t.darkoak};case"redmush":return{y0:5+n*4-2,y1:5+n*4+2,rad:3,tile:t.mush_red,trunk:t.mush_stem};case"brownmush":return{y0:5+n*4,y1:6+n*4,rad:4,tile:t.mush_brown,trunk:t.mush_stem};case"cherry":return{y0:4,y1:10+n*2,rad:4.4,tile:t.cherry_leaves_o,trunk:t.cherry_log};case"cbush":return{y0:0,y1:2.5,rad:2,tile:t.cherry_leaves_o};case"coral":return{y0:0,y1:3+n*3,rad:2,tile:t.coral_pink};case"pillar_p":return{y0:0,y1:3+n*n*14,rad:1,tile:t.stone};case"house":return{y0:-2,y1:e.tall+3+e.base,rad:e.hs+.5,tile:t.tc_white,solid:!0};case"farmhouse":return{y0:0,y1:5,rad:e.hs+.5,tile:t.planks,solid:!0};case"palm":return{y0:5,y1:7+n*4,rad:2.5,tile:t.leaves_o,trunk:t.jungletree};case"spike":return{y0:0,y1:8+n*n*26,rad:1,tile:t.packed_ice};case"pillar":return{y0:0,y1:4+n*n*22,rad:n>.55?1:.5,tile:t.basalt};case"spire":return{y0:0,y1:10+n*n*30,rad:1.8,tile:t.netherrack,cone:!0};case"glow":return{y0:0,y1:2.5,rad:1.4,tile:t.glowstone};case"crimson":return{y0:5+n*9-2,y1:5+n*9+1.5,rad:2.6+n*1.6,tile:t.wart,trunk:t.crimson_stem};case"warped":return{y0:5+n*9-2,y1:5+n*9+1.5,rad:2.6+n*1.6,tile:t.warped_wart,trunk:t.warped_stem}}return null}decorAtCell(e,t){let n="d"+(e*100003+t),i=this.treeCache.get(n);if(i!==void 0)return i;let s=this._decorAtCell(e,t);return this.treeCache.set(n,s),s}_decorAtCell(e,t){let n=Te,i=this.B.seed+500,s=this.st,r=this.A,h=e*n+1+Math.floor(R(e,t,i+1)*(n-2)),c=t*n+1+Math.floor(R(e,t,i+2)*(n-2)),o={taiga:.2,jungle:.26,desert:.09,arctic:.12,nether:.14,shore:.14,plains:.1,darkforest:.22,cherry:.14,peaks:.16,ocean:.16,badlands:.1,meadow:.12}[s],a=this.track.near(h+.5,c+.5,!1),l=a.d<70?1.6:1;if(R(e,t,i)>o*l||a.d<this.runoff(h+.5,c+.5)+1.5+3*R(e,t,i+7))return null;let u=this.column(h,c);if(u.fluid||u.smooth||u.top===r.ice)return null;let f=R(e,t,i+3),d=R(e,t,i+4),p;s==="taiga"?p=f<.42?"rock":f<.62?"log":f<.9?"shrub":"berry":s==="jungle"?p=f<.3?"rock":f<.48?"log":"shrub":s==="desert"?p=f<.75?"rock":"bones":s==="arctic"?p=f<.7?"rock":"drift":s==="shore"?p=f<.65?"rock":"shrub":s==="darkforest"?p=f<.3?"rock":f<.55?"log":"shrub":s==="cherry"?p=f<.35?"rock":f<.55?"log":"shrub":s==="peaks"?p=u.top===r.snow?"drift":"rock":s==="ocean"?p="rock":s==="badlands"?p=f<.8?"rock":"bones":s==="meadow"?p=f<.45?"rock":f<.6?"log":"shrub":s==="plains"?p=f<.3?"rock":f<.8?"shrub":"log":p=f<.6?"rock":"magma";let m=4+Math.floor(d*4),g=R(e,t,i+5)<.5?0:1,v=u.h;if(p==="log")for(let b=1;b<m;b++){let T=this.column(h+(g?0:b),c+(g?b:0));if(T.h!==v||T.smooth||T.fluid){p="shrub";break}}let x=p==="rock"?1+Math.floor(d*2.6):1,M=p==="rock"?x+1:p==="log"?1:p==="shrub"||p==="berry"?2:1;return{type:p,x:h,z:c,y:v,r:d,rad:x,top:M,dir:g,len:m}}decorAt(e,t){let n=Te;for(let i=-1;i<=1;i++)for(let s=-1;s<=1;s++){let r=this.decorAtCell(Math.floor(e/n)+i,Math.floor(t/n)+s);if(!r||r.type==="shrub"||r.type==="berry"||r.type==="drift")continue;if(r.type==="hay"){if(e>=r.x&&e<=r.x+1&&t>=r.z&&t<=r.z+1)return r;continue}if(r.type==="log"){let o=r.dir?0:1,a=r.dir,l=o?e-r.x:t-r.z;if((o?t-r.z:e-r.x)===0&&l>=0&&l<r.len)return r;continue}let h=e-r.x,c=t-r.z;if(h*h+c*c<=r.rad*r.rad+.5)return r}return null}buildDecor(e,t){let n=this.A,{x:i,y:s,z:r,r:h}=e,c=this.st,o=c==="desert"?[n.desert_stone,n.desert_stone,n.desert_sandstone]:c==="nether"?[n.netherrack,n.basalt,n.netherrack]:c==="ocean"?[n.stone,n.gravel,n.mossycobble]:c==="badlands"?[n.tc_orange,n.tc_red,n.tc_yellow]:c==="shore"||c==="peaks"?[n.stone,n.cobble,n.gravel]:c==="arctic"?[n.stone,n.cobble,n.stone]:c==="jungle"?[n.mossycobble,n.mossycobble,n.stone]:[n.stone,n.mossycobble,n.cobble];switch(e.type){case"rock":{let a=e.rad;for(let l=-1;l<=a;l++)for(let u=-a;u<=a;u++)for(let f=-a;f<=a;f++){let d=(u*u+f*f)/(a*a+.3)+l*l/(a*.8+.4)**2;if(d>1.05||d>.6&&R(i+u*7,r+f*5+l*13,21)>.6)continue;let p=o[Math.floor(R(i+u,r+f+l*9,22)*3)];t(i+u,s+l,r+f,c==="arctic"&&l>=a-1&&d<.7?n.snow:p)}break}case"log":{let a=e.dir?0:1,l=e.dir,u=c==="jungle"?n.jungletree:c==="darkforest"?n.darkoak:c==="cherry"?n.cherry_log:h<.5?n.tree:n.aspen;for(let f=0;f<e.len;f++)t(i+a*f,s,r+l*f,u),c!=="jungle"&&R(i+f,r,23)<.25&&t(i+a*f,s+1,r+l*f,n.leaves,!0);break}case"shrub":case"berry":{let a=c==="jungle"?n.jungleleaves:c==="cherry"?n.cherry_leaves:c==="darkforest"?n.darkoak_leaves:h<.5?n.leaves:n.aspen_leaves;for(let l=-1;l<=1;l++)for(let u=-1;u<=1;u++)for(let f=0;f<=1;f++)f===1&&(l||u)&&R(i+l,r+u,24)<.6||f===0&&l&&u&&R(i+l,r+u,25)<.5||t(i+l,s+f,r+u,a,!0);break}case"hay":for(let a=0;a<2;a++)for(let l=0;l<2;l++)t(i+a,s+(a&&l?1:0),r+l,n.dry_grass);break;case"bones":for(let a=0;a<3;a++)t(i+(e.dir?a:0),s,r+(e.dir?0:a),n.silver_sand);break;case"drift":for(let a=-1;a<=1;a++)for(let l=-2;l<=2;l++)Math.abs(a)+Math.abs(l)<3&&t(i+a,s,r+l,n.snow);break;case"magma":t(i,s,r,n.glowstone),t(i+1,s,r,n.basalt),t(i,s,r+1,n.basalt_top);break}}buildStreet(e,t,n,i){let s=this.A,r=this.noise3;for(let h=t-1;h<=t+n;h++)for(let c=e-1;c<=e+n;c++){let o=this.track.near(c+.5,h+.5,!1),a=this.runoff(c,h);if(o.d>a+6)continue;let l=this.inTunnel(o.s),u=o.s,f=o.h,d=R(c,h,71);if(l){let p=Math.round(f)+8+Math.round(1.6*r.n2(c/7,h/7)+(o.d/(a+6))**2*-3),m=g=>R(c*3+g,h*5-g,72)<.18?s.cobble:R(c,h*7+g,73)<.12?s.gravel:s.stone;if(o.d>=a)for(let g=Math.floor(f)-1;g<=p+2;g++)i(c,g,h,m(g));i(c,p,h,m(p));for(let g=p+1;g<=p+3+Math.floor(d*2);g++)i(c,g,h,m(g));d>.6&&o.d>2&&i(c,p+4,h,s.grass);continue}}}trunkAt(e,t){let n=this.treeGrid,i=Math.floor(e/n),s=Math.floor(t/n),r=this.treeAtCell(i,s);if(!r||r.type==="bush"||r.type==="glow")return null;if(r.hs)return Math.abs(e-r.x)<=r.hs&&Math.abs(t-r.z)<=r.hs?r:null;let h=r.type==="giant"||r.type==="darkoak"||r.type==="pillar_p"||r.type==="pillar"&&r.r>.55||r.type==="spire"||r.type==="spike"||r.type==="coral"?2:1,c=r.type==="spire"||r.type==="spike"||r.type==="coral"?-1:0;return e>=r.x+c&&e<r.x+c+h+(c?1:0)&&t>=r.z+c&&t<r.z+c+h+(c?1:0)?r:null}surface(e,t,n){let i=this.track.near(e,t);if(n.d=i.d,n.s=i.s,n.lat=i.lat,i.d<this.flat&&i.d<this.runoff(e,t))return n.y=i.h,n.path=i.d<this.hw,n.fluid=0,n.smooth=!0,n.grip=n.path?1:Math.max(.84,this.B.offGrip),n.drag=n.path?0:this.B.offDrag*.3,n;let s=this.column(Math.floor(e),Math.floor(t));n.y=s.h,n.path=!1,n.fluid=s.fluid,n.smooth=!!s.smooth;let r=this.A,h=this.B.offGrip,c=this.B.offDrag;return s.top===r.ice?(h=.22,c=.05):s.top===r.stone||s.top===r.basalt_top?(h=.8,c=.15):s.top===r.nether_sand&&(h=.5,c=1.4),n.grip=h,n.drag=c,n}obstacle(e,t,n){let i=Math.floor(e),s=Math.floor(t),r=this.track.near(e,t);if(r.d<this.flat&&r.d<this.runoff(e,t))return null;if(this.st==="shore"&&this.inTunnel(r.s)&&r.d<this.runoff(e,t)+6)return r.h+2;let h=this.column(i,s);if(h.h>n+1.1)return h.h;let c=this.decorAt(i,s);if(c&&n+.5>c.y&&n<c.y+c.top)return c.y+c.top;let o=this.structGrid,a=this.structAt(Math.floor(e/o),Math.floor(t/o));if(a){let u=i-a.x,f=s-a.z,d=Math.floor(n+.4)-a.y;if(a.vox.has(gt(u,d,f))||a.vox.has(gt(u,d+1,f)))return n+1}let l=this.trunkAt(i,s);if(l){let u=l.type==="cactus"?l.y+2+Math.floor(l.r*3):l.hs?l.y+l.tall+6+(l.base||0):l.y+40;if(n+.5>l.y&&n<u)return u}return null}update(e,t,n,i,s=1,r=null){let h=new Map,c=[[e,t],...r||[]];this.want=h;let o=512,a=Math.floor((e-i)/o),l=Math.floor((e+i)/o),u=Math.floor((t-i)/o),f=Math.floor((t+i)/o),d=(g,v,x)=>{let M=g+x/2,b=v+x/2,T=Math.max(0,Math.abs(e-M)-x/2),E=Math.max(0,Math.abs(t-b)-x/2),P=Math.hypot(T,E);if(P>i)return;let C=P;for(let q=0;q+1<c.length;q++){let A=c[q][0],I=c[q][1],S=c[q+1][0]-A,N=c[q+1][1]-I,L=S*S+N*N,D=L>1?Ee(((M-A)*S+(b-I)*N)/L,0,1):0,U=Math.max(0,Math.abs(A+S*D-M)-x/2),J=Math.max(0,Math.abs(I+N*D-b)-x/2);C=Math.min(C,Math.hypot(U,J))}let W=Math.min(P,C*1.5),z=x/It,te=this.track.near(M,b,!1),Z=te.d>1e8?1e9:Math.max(0,te.d-x*.71),fe=this.noCorridor||Z<x*2.2+40;if(z>1&&W<x*.9*s&&fe){let q=x/2;d(g,v,q),d(g+q,v,q),d(g,v+q,q),d(g+q,v+q,q);return}h.set(g+","+v+","+z,{ox:g,oz:v,S:z,dist:Math.min(P,C)+z*6})};for(let g=a;g<=l;g++)for(let v=u;v<=f;v++)d(g*o,v*o,o);let p=[];for(let[g,v]of h)this.tiles.has(g)||p.push([g,v]);p.sort((g,v)=>g[1].dist-v[1].dist);let m;if(this.pool&&this.pool.ok){for(let[g,v]of p)if(!this.inflight.has(g)){if(!this.pool.request(this,g,v.ox,v.oz,v.S))break;this.inflight.add(g)}m=p.length}else{let g=performance.now(),v=0;for(let[x,M]of p){if(v>0&&performance.now()-g>n)break;this.tiles.set(x,this.buildTile(M.ox,M.oz,M.S)),v++}m=p.length-v}for(let[g,v]of this.tiles){if(h.has(g))continue;let[x,M,b]=g.split(",").map(Number),T=b*It,E=!0;for(let[P,C]of h)if(!this.tiles.has(P)&&C.ox<x+T&&C.ox+C.S*It>x&&C.oz<M+T&&C.oz+C.S*It>M){E=!1;break}E&&(this.disposeTile(v),this.tiles.delete(g))}return m}disposeTile(e){for(let t of e.meshes)this.group.remove(t),t.geometry.dispose()}receive(e,t,n,i,s){this.inflight.delete(e),!(this.tiles.has(e)||!this.want||!this.want.has(e))&&this.tiles.set(e,this.meshesFrom(s,t,n,i))}buildTile(e,t,n){return this.meshesFrom(this.buildTileData(e,t,n),e,t,n)}meshesFrom(e,t,n,i){let s=[];for(let r of e){let h=new Rt(Ke.toGeometry(r.a),this.mats[r.kind]);h.position.set(t,0,n),h.castShadow=r.cast,h.receiveShadow=!0,h.matrixAutoUpdate=!1,h.updateMatrix(),this.group.add(h),s.push(h)}return{meshes:s,S:i}}buildTileData(e,t,n){let i=this.A,s=It,r=s+2,h=new Float32Array(r*r),c=new Uint8Array(r*r),o=new Uint8Array(r*r),a=new Uint8Array(r*r),l=new Uint8Array(r*r),u=new Uint8Array(r*r),f=new Uint8Array(r*r),d=new Uint8Array(r*r),p=new Float32Array(r*r);for(let A=0;A<r;A++)for(let I=0;I<r;I++){let S=this.column(e+(I-1)*n,t+(A-1)*n),N=A*r+I;h[N]=(S.smooth,S.h),c[N]=S.top,o[N]=S.sideTop,a[N]=S.sub,l[N]=S.deep,u[N]=S.fluid,f[N]=S.smooth,d[N]=S.band,p[N]=S.d}for(let A=1;A<=s;A++)for(let I=1;I<=s;I++){let S=A*r+I;if(f[S]||c[S]===i.ice||u[S])continue;let N=h[S];Math.max(Math.abs(N-h[S-1]),Math.abs(N-h[S+1]),Math.abs(N-h[S-r]),Math.abs(N-h[S+r]))/n>=2.5&&c[S]!==i.snow&&(c[S]=this.cliff,o[S]=this.cliff,a[S]=this.cliff)}let m=s+1,g=new Float32Array(m*m);for(let A=0;A<m;A++)for(let I=0;I<m;I++){let S=this.track.near(e+I*n,t+A*n,!1);g[A*m+I]=S.d<1e8?S.h:0}let v=new Ke,x=new Ke,M=new Ke,b=new Ke,T=[1,.78,.62,.48];for(let A=1;A<=s;A++)for(let I=1;I<=s;I++){let S=A*r+I,N=h[S],L=(I-1)*n,D=(A-1)*n,U=L+n,J=D+n,Y=e+L,O=t+D,K=g[(A-1)*m+I-1],H=g[(A-1)*m+I],ge=g[A*m+I],_e=g[A*m+I-1];if(f[S])v.topH(L,D,U,J,K,H,ge,_e,c[S],Y,O);else{let V=(_t,se)=>h[(A+se)*r+I+_t]>N+.5?1:0,j=(_t,se,He)=>T[_t&&se?3:_t+se+He],X=V(-1,0),De=V(1,0),ie=V(0,-1),Ve=V(0,1);v.top(L,D,U,J,N,c[S],j(X,ie,V(-1,-1)),j(De,ie,V(1,-1)),j(De,Ve,V(1,1)),j(X,Ve,V(-1,1)),Y,O)}for(let V=0;V<4;V++){let j=V===0?1:V===1?-1:0,X=V===2?1:V===3?-1:0,De=(A+X)*r+I+j,ie=h[De],Ve=N;if(f[S]){if(f[De])continue;Ve=Math.min(V===0?H:V===1?K:V===2?_e:K,V===0?ge:V===1?_e:V===2?ge:H)}else f[De]&&(ie-=.4);if((I+j===0||I+j===r-1||A+X===0||A+X===r-1)&&(ie=Math.min(ie,Ve)-4),ie>=Ve-.001)continue;let se=Ve,He;if(n>=4)He=[[ie,se,se-ie<=1.5?o[S]:d[S]?i.tc_orange:a[S]]];else if(d[S]){He=[[Math.max(ie,se-1),se,o[S]]];for(let Se=Math.floor(se)-1;Se>=Math.floor(ie);Se-=1){let je=Math.max(ie,Se),Lt=Math.min(se-1,Se+1);if(Lt<=je)continue;let es=[i.tc_orange,i.tc_white,i.tc_red,i.tc_yellow,i.tc_orange,i.tc_brown,i.tc_lgray,i.tc_red][(Math.floor(Se/2)%8+8)%8];He.push([je,Lt,es])}}else He=[[Math.max(ie,se-1),se,o[S]],[Math.max(ie,se-4),se-1,a[S]],[ie,se-4,l[S]]];for(let[Se,je,Lt]of He)je-Se<=.001||v.side(V,L,D,U,J,Se,je,Lt,Se<=ie+.01?.6:1,Y,O)}if(u[S]===1&&this.water>N&&M.flat(L,D,U,J,this.water-.12),u[S]===2&&this.lava>N&&b.top(L,D,U,J,this.lava-.12,i.lava,1,1,1,1,Y,O),n===1&&(!u[S]||u[S]===1&&this.st==="shore")&&!f[S]){let V=this.plantFor(Y,O,c[S],N);if(V>=0)x.cross(L+.5,N,D+.5,V,R(Y,O,77));else if(V===-2){let j=3+Math.floor(R(Y,O,78)*5);for(let X=0;X<j;X++)x.cross(L+.5,N+X,D+.5,i.p_papyrus,R(Y,O,77))}else if(V===-3){let j=4+Math.floor(R(Y,O,78)*12);for(let X=0;X<j;X++)x.cross(L+.5,N+X,D+.5,i.p_kelp,R(Y,O,77))}}n===1&&u[S]===1&&(this.st==="jungle"||this.st==="taiga")&&R(Y,O,91)<.045&&x.top(L,D,U,J,this.water-.09,i.waterlily,1,1,1,1,Y,O)}let E=this.treeGrid,P=7,C=s*n,W=Math.floor((e-P)/E),z=Math.floor((e+C+P)/E),te=Math.floor((t-P)/E),Z=Math.floor((t+C+P)/E);if(n<=this.voxTreeMaxS){let A=new Map,I=(L,D,U,J,Y=!1,O=!1)=>{let K=L-e,H=U-t;if(K<-1||H<-1||K>C||H>C||D<0||D>255)return;let ge=D<<16|H+1<<8|K+1,_e=A.get(ge);_e!==void 0&&!(_e&256)&&Y||A.set(ge,J|(Y?256:0)|(O?512:0))};for(let L=te;L<=Z;L++)for(let D=W;D<=z;D++){let U=this.treeAtCell(D,L);U&&this.buildTree(U,I)}for(let L=Math.floor((t-4)/Te);L<=Math.floor((t+C+4)/Te);L++)for(let D=Math.floor((e-4)/Te);D<=Math.floor((e+C+4)/Te);D++){let U=this.decorAtCell(D,L);U&&this.buildDecor(U,I)}let S=(L,D)=>{let U=Ee(Math.floor(L/n)+1,0,r-1),J=Ee(Math.floor(D/n)+1,0,r-1);return h[J*r+U]};this.st==="shore"&&this.buildStreet(e,t,C,I),this.track.cross&&this.buildBridge(e,t,C,I);let N={[i.leaves]:i.leaves_o,[i.jungleleaves]:i.jungleleaves_o,[i.pine_needles]:i.pine_needles_o,[i.aspen_leaves]:i.aspen_leaves_o,[i.acacia_leaves]:i.acacia_leaves_o,[i.cherry_leaves]:i.cherry_leaves_o,[i.darkoak_leaves]:i.darkoak_leaves_o};for(let[L,D]of A){let U=(L&255)-1,J=(L>>8&255)-1,Y=L>>16;if(U<0||J<0||U>=C||J>=C||Y<S(U,J)-.01)continue;let O=D&255,K=!!(D&256);K&&n>1&&(O=N[O]??O);for(let H=0;H<6;H++){let ge=U+(H===0?1:H===1?-1:0),_e=Y+(H===4?1:H===5?-1:0),V=J+(H===2?1:H===3?-1:0),j=A.get(_e<<16|V+1<<8|ge+1);if(j!==void 0&&(!(j&256)||K)||_e<S(ge,V)-.01)continue;let X=O;H>=4&&!K&&(O===i.tree?X=i.tree_top:O===i.jungletree?X=i.jungletree_top:O===i.pine?X=i.pine_top:O===i.aspen?X=i.aspen_top:O===i.cherry_log?X=i.cherry_log_top:O===i.darkoak?X=i.darkoak_top:O===i.mush_stem?X=i.mush_stem:O===i.crimson_stem||O===i.warped_stem?X=O:O===i.acacia?X=i.acacia_top:O===i.cactus?X=i.cactus_top:O===i.basalt&&(X=i.basalt_top));let De=K?H===5?.65:H===4?1:.9:1;v.cube(H,U,Y,J,X,De,e,t)}}}else{if(n===2)for(let A=Math.floor(t/Te);A<=Math.floor((t+C)/Te);A++)for(let I=Math.floor(e/Te);I<=Math.floor((e+C)/Te);I++){let S=this.decorAtCell(I,A);if(!S||S.type!=="rock")continue;let N=S.x-e,L=S.z-t;N<0||L<0||N>=C||L>=C||v.box(N+.5-S.rad,S.y,L+.5-S.rad,N+.5+S.rad,S.y+S.rad+.6,L+.5+S.rad,this.st==="arctic"?i.snow:this.st==="desert"?i.desert_stone:this.st==="nether"?i.netherrack:this.st==="plains"?i.dry_grass:this.st==="badlands"?i.tc_orange:this.st==="ocean"||this.st==="shore"||this.st==="peaks"?i.stone:i.mossycobble,.85,e,t)}for(let A=te;A<=Z;A++)for(let I=W;I<=z;I++){let S=this.treeAtCell(I,A);if(!S||n>=8&&(S.type==="bush"||S.type==="cactus"||S.type==="glow"||S.type==="deadbush")||n>=8&&R(I,A,404)>(n>=16?.1:.3))continue;let N=n>=16?1.8:n>=8?1.45:1,L=S.x-e,D=S.z-t;if(L<0||D<0||L>=C||D>=C)continue;let U=this.treeProxy(S);if(U)if(U.trunk&&U.y0>0&&v.box(L+.5-.5,S.y,D,L+1,S.y+U.y0,D+1,U.trunk,.9,e,t),U.solid||(U.rad*=N),U.cone){let Y=U.y1-U.y0;for(let O=0;O<3;O++){let K=U.rad*(1-O/3)+.5;v.box(L+.5-K,S.y+U.y0+Y*O/3,D+.5-K,L+.5+K,S.y+U.y0+Y*(O+1)/3,D+.5+K,U.tile,.85,e,t)}}else v.box(L+.5-U.rad,S.y+U.y0,D+.5-U.rad,L+.5+U.rad,S.y+U.y1,D+.5+U.rad,U.tile,.85,e,t)}}if(n<=8){for(let A of this.structsNear(e,t,e+C,t+C))if(!(A.x<e||A.x>=e+C||A.z<t||A.z>=t+C))for(let[I,S]of A.vox){let[N,L,D]=Ki(I),U=A.x+N,J=A.z+D,Y=A.y+L,O=N*1e3+D,K=A.ground.get(O);if(K===void 0&&(K=this.column(U,J).h,A.ground.set(O,K)),!(Y<K-1.01))for(let H=0;H<6;H++){let ge=N+(H===0?1:H===1?-1:0),_e=L+(H===4?1:H===5?-1:0),V=D+(H===2?1:H===3?-1:0),j=A.vox.get(gt(ge,_e,V));j!==void 0&&j!==i.glass&&j!==i.vine&&j!==i.water&&S!==i.vine||j!==void 0&&S===i.vine&&j===i.vine||v.cube(H,U-e,Y,J-t,S,H===5?.7:1,e,t)}}}let fe=[],q=(A,I,S)=>{A.count&&fe.push({kind:I,cast:S,a:A.arrays()})};return q(v,"solid",n<=2),q(x,"plant",!1),q(M,"water",!1),q(b,"lava",!1),fe}plantFor(e,t,n,i=0){let s=this.A,r=R(e,t,31),h=this.st,c=this.noise3.n2(e/18,t/18);if(h==="taiga"&&n===s.grass){if(r<.2+.15*c)return r<.12?s.p_grass:s.p_grass2;if(c>.3&&r<.45)return[s.p_rose,s.p_dandelion,s.p_tulip,s.p_viola][Math.floor(r*1e3)&3]}else if(h==="jungle"&&(n===s.litter||n===s.grass)){if(c>.35&&r<.12)return-2;if(r<.3)return r<.16?s.p_junglegrass:s.p_fern;if(r<.34)return s.p_grass2}else if(h==="desert"){if(r<.012)return s.p_dry_shrub;if(r<.02)return s.p_dry_grass}else if(h==="nether"){if((n===s.crimson_nylium||n===s.warped_nylium)&&r<.08||r<.012)return s.p_mushroom}else if(h==="plains"&&n===s.grass){if(c>.25&&r<.3)return r<.22?s.p_dandelion:s.p_grass2;if(r<.22)return r<.14?s.p_grass:s.p_grass2;if(c<-.4&&r<.38)return[s.p_rose,s.p_tulip,s.p_viola,s.p_dandelion][Math.floor(r*1e3)&3]}else if(h==="shore"){if(i<this.water-.5)return n===s.sand&&r<.14?s.p_seagrass:n!==s.sand&&n!==s.gravel&&r<.12?r<.06?s.p_coral_a:s.p_coral_b:n===s.gravel&&c>.2&&r<.05&&i<this.water-6?-3:-1;if(n===s.grass){if(r<.16)return s.p_grass;if(c>.35&&r<.22)return[s.p_rose,s.p_dandelion][Math.floor(r*1e3)&1]}}else if(h==="ocean"){if(n===s.sand||n===s.silver_sand){if(c>.3&&r<.09)return-3;if(r<.18)return s.p_seagrass}else if(n===s.gravel){if(r<.06)return-3}else if(n!==s.clay&&r<.18)return r<.09?s.p_coral_a:s.p_coral_b}else if(h==="darkforest"){if(n===s.grass&&r<.24)return r<.14?s.p_grass:s.p_fern;if(n===s.coniferous_litter&&r<.06)return s.p_mushroom;if(n===s.moss&&r<.1)return s.p_fern}else if(h==="cherry"&&n===s.grass){if(r<.2+.2*Math.max(0,c))return r<.13?s.p_petals:s.p_grass;if(c<-.4&&r<.3)return s.p_grass2}else if(h==="meadow"&&n===s.grass){if(r<.16)return r<.1?s.p_grass2:s.p_grass;if(r<.16+.2*(.5+.5*c))return[s.p_rose,s.p_dandelion,s.p_tulip,s.p_viola][Math.floor(r*1e3)&3]}else if(h==="peaks"){if(n===s.grass&&r<.2)return r<.03?s.p_viola:s.p_grass;if(n===s.stone&&r<.01)return s.p_dry_shrub}else if(h==="badlands"){if(n===s.red_sand&&r<.012)return s.p_dry_shrub;if((n===s.grass||n===s.dry_dirt)&&r<.25)return s.p_dry_grass}else if(h==="arctic"&&n===s.snow&&r<.008)return s.p_dry_shrub;return-1}dispose(){for(let e of this.tiles.values())this.disposeTile(e);this.tiles.clear()}},Ke=class _{constructor(){this.p=[],this.nm=[],this.uv=[],this.tl=[],this.c=[],this.ix=[],this.count=0}_v(e,t,n,i,s,r,h,c,o,a){this.p.push(e,t,n),this.nm.push(i,s,r),this.uv.push(h,c),this.tl.push(o),this.c.push(a,a,a)}_q(e){let t=this.count*4;e?this.ix.push(t+1,t+2,t+3,t+1,t+3,t):this.ix.push(t,t+1,t+2,t,t+2,t+3),this.count++}top(e,t,n,i,s,r,h,c,o,a,l,u){let f=n-e,d=i-t;this._v(e,s,t,0,1,0,l,u,r,h),this._v(e,s,i,0,1,0,l,u+d,r,a),this._v(n,s,i,0,1,0,l+f,u+d,r,o),this._v(n,s,t,0,1,0,l+f,u,r,c),this._q(h+o<a+c)}flat(e,t,n,i,s){this._v(e,s,t,0,1,0,0,0,0,1),this._v(e,s,i,0,1,0,0,0,0,1),this._v(n,s,i,0,1,0,0,0,0,1),this._v(n,s,t,0,1,0,0,0,0,1),this._q(!1)}topH(e,t,n,i,s,r,h,c,o,a,l){let u=n-e,f=i-t,d=(s+c-(r+h))/(2*u),p=(s+r-(c+h))/(2*f),m=Math.hypot(d,1,p),g=d/m,v=1/m,x=p/m;this._v(e,s,t,g,v,x,a,l,o,1),this._v(e,c,i,g,v,x,a,l+f,o,1),this._v(n,h,i,g,v,x,a+u,l+f,o,1),this._v(n,r,t,g,v,x,a+u,l,o,1),this._q(!1)}side(e,t,n,i,s,r,h,c,o,a,l){let u=o;e===0?(this._v(i,r,n,1,0,0,l,r,c,u),this._v(i,h,n,1,0,0,l,h,c,1),this._v(i,h,s,1,0,0,l+(s-n),h,c,1),this._v(i,r,s,1,0,0,l+(s-n),r,c,u)):e===1?(this._v(t,r,s,-1,0,0,l+(s-n),r,c,u),this._v(t,h,s,-1,0,0,l+(s-n),h,c,1),this._v(t,h,n,-1,0,0,l,h,c,1),this._v(t,r,n,-1,0,0,l,r,c,u)):e===2?(this._v(i,r,s,0,0,1,a+(i-t),r,c,u),this._v(i,h,s,0,0,1,a+(i-t),h,c,1),this._v(t,h,s,0,0,1,a,h,c,1),this._v(t,r,s,0,0,1,a,r,c,u)):(this._v(t,r,n,0,0,-1,a,r,c,u),this._v(t,h,n,0,0,-1,a,h,c,1),this._v(i,h,n,0,0,-1,a+(i-t),h,c,1),this._v(i,r,n,0,0,-1,a+(i-t),r,c,u)),this._q(!1)}cube(e,t,n,i,s,r,h,c){let o=t,a=t+1,l=i,u=i+1,f=n,d=n+1,p=h+t,m=c+i;e<4?(this.side(e,o,l,a,u,f,d,s,r,p,m),this._fixA(r)):e===4?this.top(o,l,a,u,d,s,r,r,r,r,p,m):this.bottom(o,l,a,u,f,s,r*.8,p,m)}bottom(e,t,n,i,s,r,h,c,o){this._v(e,s,t,0,-1,0,c,o,r,h),this._v(n,s,t,0,-1,0,c+(n-e),o,r,h),this._v(n,s,i,0,-1,0,c+(n-e),o+(i-t),r,h),this._v(e,s,i,0,-1,0,c,o+(i-t),r,h),this._q(!1)}box(e,t,n,i,s,r,h,c,o,a){let l=o+e,u=a+n;this.top(e,n,i,r,s,h,c,c,c,c,l,u),this.bottom(e,n,i,r,t,h,c*.7,l,u);for(let f=0;f<4;f++)this.side(f,e,n,i,r,t,s,h,c*.85,l,u),this._fixA(c*.9)}_fixA(e){let t=this.c.length;for(let n=t-12;n<t;n++)this.c[n]=e}cross(e,t,n,i,s){let c=s*Math.PI,o=Math.cos(c)*.45,a=Math.sin(c)*.45;for(let[l,u]of[[o,a],[-a,o]])this._v(e-l,t,n-u,0,1,0,0,0,i,.85),this._v(e-l,t+1,n-u,0,1,0,0,.999,i,1),this._v(e+l,t+1,n+u,0,1,0,.999,.999,i,1),this._v(e+l,t,n+u,0,1,0,.999,0,i,.85),this._q(!1)}arrays(){let e=new Int8Array(this.nm.length);for(let a=0;a<e.length;a++)e[a]=Math.round(this.nm[a]*127);let t=new Uint8Array(this.c.length);for(let a=0;a<t.length;a++)t[a]=Math.round(Math.min(1,this.c[a])*255);let n=1e9,i=1e9,s=1e9,r=-1e9,h=-1e9,c=-1e9,o=this.p;for(let a=0;a<o.length;a+=3)o[a]<n&&(n=o[a]),o[a]>r&&(r=o[a]),o[a+1]<i&&(i=o[a+1]),o[a+1]>h&&(h=o[a+1]),o[a+2]<s&&(s=o[a+2]),o[a+2]>c&&(c=o[a+2]);return{p:new Float32Array(this.p),nm:e,uv:new Float32Array(this.uv),tl:new Uint8Array(this.tl),c:t,ix:this.count*4>65535?new Uint32Array(this.ix):new Uint16Array(this.ix),bs:[(n+r)/2,(i+h)/2,(s+c)/2,.5*Math.hypot(r-n,h-i,c-s)]}}static toGeometry(e){let t=new At;return t.setAttribute("position",new oe(e.p,3)),t.setAttribute("normal",new oe(e.nm,3,!0)),t.setAttribute("uv",new oe(e.uv,2)),t.setAttribute("tl",new oe(e.tl,1,!1)),t.setAttribute("color",new oe(e.c,3,!0)),t.setIndex(new oe(e.ix,1)),t.boundingSphere=new dt(new y(e.bs[0],e.bs[1],e.bs[2]),e.bs[3]),t}build(){return _.toGeometry(this.arrays())}};var an=null,ii=0;self.onmessage=_=>{let e=_.data;try{if(e.type==="init"){ii=e.gen,an=new rn(e.biome,e.track,e.A,{}),e.opts&&e.opts.voxTreeMaxS&&(an.voxTreeMaxS=e.opts.voxTreeMaxS);return}if(e.type==="job"){if(e.gen!==ii||!an){self.postMessage({type:"tile",gen:e.gen,key:e.key,parts:[]});return}let t=an.buildTileData(e.ox,e.oz,e.S),n=[];for(let i of t)for(let s of["p","nm","uv","tl","c","ix"])n.push(i.a[s].buffer);self.postMessage({type:"tile",gen:ii,key:e.key,ox:e.ox,oz:e.oz,S:e.S,parts:t},n)}}catch(t){self.postMessage({type:"error",msg:String(t&&t.stack||t)})}};})();
/*! Bundled license information:

three/build/three.module.js:
  (**
   * @license
   * Copyright 2010-2024 Three.js Authors
   * SPDX-License-Identifier: MIT
   *)
*/
