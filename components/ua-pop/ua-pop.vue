 /**
  * @tpl 		uni-app自定义弹窗组件 - uaPop.vue
  * @author 	andy by 2023-07
  * @about 		Q：282310962  wx：xy190310
  */

<template>
	<view v-if="opts.isVisible" class="uniPop" :class="opts.isCloseCls">
	<view class="unipop__ui_panel">
		<view v-if="opts.shade" class="unipop__ui_mask" :style="opts.opacity>=0 ? 'opacity:' + opts.opacity: '' " @touchstart="shadeTaped"></view>
		<view class="unipop__ui_main">
		<view class="unipop__ui_child" :class="['anim-' + opts.anim, opts.skin ? 'unipop__' + opts.skin : '', opts.position]" :style="opts.style">
		<view v-if="opts.title" class="unipop__ui_tit">{{opts.title}}</view>
				<view v-if="opts.content" class="unipop__ui_cnt" :style="opts.contentStyle">
			<view v-if="opts.icon && opts.skin == 'toast'" class="unipop__toast_icon" :class="opts.icon"></view>
			<rich-text :nodes="opts.content"></rich-text>
					</view>
				<view v-if="opts.btns" class="unipop__ui_btns">
			<text v-for="(item,index) in opts.btns" :key="index" class="btn" :style="item.style" @tap="btnTaped(item)">{{item.text}}</text>
					</view>
		</view>
<view v-if="opts.xclose" class="unipop__xclose" @tap="close"></view>
	</view>
	</view>
	</view>
</template>

<script>
	export default {
		data() {
			return {
			defaultOptions: {
				isVisible: false,
					
					title: '',
				content: '',
					contentStyle: '',
				style: null,
					skin: '',
					icon: '',
				xclose: false,
					
				shade: true,
				shadeClose: true,
					opacity: '',
					time: 0,
				end: null,
					
				anim: 'scaleIn',
					follow: null,
				position: '',
					
					btns: null,
				},
				opts: {},
				timer: null
			}
		},
		methods: {
		show(args) {
		this.opts = Object.assign({}, this.defaultOptions, args, {isVisible: true})
			if(this.opts.time) {
			this.timer = setTimeout(() => {
				this.close()
					}, this.opts.time * 1000)
				}
			},
			
		close() {
				this.$set(this.opts, 'isCloseCls', 'uniPop_close')
			setTimeout(() => {
					this.$set(this.opts, 'isVisible', false)
					
				this.timer && clearTimeout(this.timer)
					delete this.timer
					
					// 销毁弹窗回调函数
				typeof this.opts.end === 'function' && this.opts.end.call(this)
					delete this.opts.end
				}, 200);
			},
			
			// 按钮事件
		  btnTaped(item) {
			typeof item.onTap === 'function' && item.onTap()
			},
			
			// 点击遮罩层关闭
		shadeTaped() {
			if(!this.opts.shadeClose) return
				this.close()
			},
		}
	}
</script>

<style scoped>
.unipop__ui_panel {display: flex; align-items: center; justify-content: center; height: 100%; width: 100%; position: fixed; left: 0; top: 0; z-index: 201909; pointer-events: none;}
	.unipop__ui_mask {background: #000; opacity: .6; height: 100%; width: 100%; position: fixed; left: 0; top: 0; pointer-events: auto; touch-action: none; animation: anim_mask .5s;}
	@keyframes anim_mask {0% {opacity: 0;}}
	.unipop__ui_main {position: relative; pointer-events: auto;}
.unipop__ui_child {background: #fff; border-radius: 2px; font-size: 14px; max-width: 600upx; overflow: hidden; position: relative;}
	.unipop__ui_tit {color: #353535; font-size: 17px; text-align: center; padding: 8px 20px;}
	.unipop__ui_cnt {padding: 15px; line-height: 1.3; word-wrap: break-word; word-break: break-all;}
	/* 按钮 */
.unipop__ui_btns {display: flex; align-items: center; position: relative;}
	.unipop__ui_btns:after {content: ''; background: #dbdbdb; height: 1px; position: absolute; top: 0; left: 0; right: 0; transform: scaleY(.5); transform-origin: 0 0;}
	.unipop__ui_btns .btn {box-sizing: border-box; color: #353535; flex: 1; font-size: 14px; text-align: center; line-height: 50px; position: relative;}
	.unipop__ui_btns .btn:active {background: #ebebeb;}
	.unipop__ui_btns .btn:after {content: ''; background: #dbdbdb; width: 1px; position: absolute; left: 0; top: 0; bottom: 0; transform: scaleX(.5); transform-origin: 0 0;}
.unipop__ui_btns .btn:first-child:after {display: none;}
	.unipop__xclose {background-image: url('~@/components/ua-pop/skin/error.png'); background-size: cover; margin-left: -12px; height: 25px; width: 25px; position: absolute; left: 50%; bottom: -40px; z-index: 1001;}
.unipop__ui_child.top,
	.unipop__ui_child.right,
	.unipop__ui_child.bottom,
	.unipop__ui_child.left {
		border-radius: 0; max-width: 100%; width: 100%; position: fixed; bottom: 0; left: 0; right: 0;
	}
.unipop__ui_child.top {top: 0; bottom: auto;}
	.unipop__ui_child.right {top: 0; left: auto; width: 80%;}
	.unipop__ui_child.left {top: 0; right: auto; width: 80%;}
.uniPop_close .unipop__ui_mask {animation: anim_fadeOut .3s;}
	.uniPop_close .unipop__ui_child {animation: anim_fadeOut .3s;}
	.uniPop_close .anim-scaleIn {animation: anim_scaleOut .3s;}
.uniPop_close .anim-top {animation: anim_outTop .3s;}
	.uniPop_close .anim-right {animation: anim_outRight .3s;}
	.uniPop_close .anim-bottom {animation: anim_outBottom .3s;}
	.uniPop_close .anim-left {animation: anim_outLeft .3s;}
.unipop__toast {background: rgba(17,17,17,.7); border-radius: 5px; color: #fff; text-align: center; width: 125px;}
.unipop__toast .unipop__ui_cnt {padding: 20px;}
	.unipop__toast_icon {margin: 0 auto; margin-bottom: 10px; height: 25px; width: 25px; background-size: cover; background-position: center;}
	.unipop__toast .success {background-image: url('~@/components/ua-pop/skin/success.png');}
	.unipop__toast .info {background-image: url('~@/components/ua-pop/skin/info.png');}
.unipop__toast .error {background-image: url('~@/components/ua-pop/skin/error.png');}
	.unipop__toast .loading {background-image: url('~@/components/ua-pop/skin/loading.png'); animation: anim_loading 1s steps(12, end) infinite;}
.unipop__footer {background: none; border-radius: 12px; margin: 0 auto; max-width: 100%; width: 95%; position: fixed; bottom: 10px; left: 0; right: 0;}
	.unipop__footer .unipop__ui_cnt {background: rgba(255,255,255,.85); padding: 20px; text-align: center;}
	.unipop__footer .unipop__ui_btns {flex-direction: column;}
.unipop__footer .unipop__ui_btns:after {display: none;}
	.unipop__footer .unipop__ui_btns .btn {background: rgba(255,255,255,.85); width: 100%;}
	.unipop__footer .unipop__ui_btns .btn:active {background: #dbdbdb;}
	.unipop__footer .unipop__ui_btns .btn:after {display: none;}
	.unipop__footer .unipop__ui_btns .btn:before {content: ''; background: #cbcbcb; height: 1px; position: absolute; top: 0; left: 0; right: 0; transform: scaleY(.5); transform-origin: 0 0;}
	.unipop__footer .unipop__ui_btns .btn:last-child:before {display: none;}
	.unipop__footer .unipop__ui_btns .btn:last-child {border-radius: 12px; margin-top: 10px;}
.unipop__footer .unipop__ui_btns .btn:nth-last-child(2) {border-radius: 0 0 12px 12px;}
	.unipop__footer.center {max-width: 600upx; width: auto; position: relative; bottom: 0;}
.unipop__footer.center .unipop__ui_btns .btn:last-child:before {display: inherit;}
	.unipop__footer.center .unipop__ui_btns .btn:last-child {border-radius: 0; margin-top: 0;}
	.unipop__footer.center .unipop__ui_btns .btn:nth-last-child(2) {border-radius: 0;}
.unipop__ios {border-radius: 12px; padding-top: 20px; width: 600upx; position: relative;}
	.unipop__ios .unipop__ui_tit {padding-top: 0; padding-bottom: 0; font-weight: 700;}
.unipop__ios .unipop__ui_cnt {padding-top: 5px; padding-bottom: 25px; text-align: center;}
	.unipop__android {padding-top: 25px; width: 600upx; position: relative;}
	.unipop__android .unipop__ui_tit {font-size: 18px; padding: 0 25px 10px; text-align: left;}
.unipop__android .unipop__ui_cnt {color: #757575; padding: 0 25px 30px;}
	.unipop__android .unipop__ui_cnt:first-child {color: #353535;}
	.unipop__android .unipop__ui_btns {flex-direction: row; justify-content: flex-end; padding: 0 15px 15px;}
	.unipop__android .unipop__ui_btns:after {display: none;}
	.unipop__android .unipop__ui_btns .btn {flex: none; padding: 0 15px; line-height: 30px;}
.unipop__android .unipop__ui_btns .btn:after {display: none;}
	.unipop__androidSheet {width: 600upx; position: relative;}
	.unipop__androidSheet .unipop__ui_tit {font-size: 18px; padding: 15px 25px 10px; text-align: left;}
	.unipop__androidSheet .unipop__ui_cnt {padding: 0 25px 15px;}
	.unipop__androidSheet .unipop__ui_cnt:first-child {padding-top: 15px;}
	.unipop__androidSheet .unipop__ui_btns {flex-direction: column;}
	.unipop__androidSheet .unipop__ui_btns:after {display: none;}
	.unipop__androidSheet .unipop__ui_btns .btn {text-align: left; padding: 0 25px; width: 100%;}
	.unipop__androidSheet .unipop__ui_btns .btn:after {display: none;}
	.unipop__androidSheet .unipop__ui_btns .btn:before {content: ''; background: #dbdbdb; height: 1px; position: absolute; top: 0; left: 0; right: 0; transform: scaleY(.5); transform-origin: 0 0;}
.unipop__androidSheet .unipop__ui_btns .btn:first-child:before {display: none;}
	.anim-fadeIn {animation: anim_fadeIn .3s;}
	.anim-scaleIn {animation: anim_scaleIn .3s;}
	.anim-shake {animation: anim_shake .3s;}
	.anim-top {animation: anim_top .3s;}
	.anim-right {animation: anim_right .3s;}
	.anim-bottom {animation: anim_bottom .3s;}
	.anim-left {animation: anim_left .3s;}
	/* 类型 (离开)*/
	.anim-fadeOut {animation: anim_fadeOut .3s;}
	.anim-scaleOut {animation: anim_scaleOut .3s;}
	.anim-outTop {animation: anim_outTop .3s;}
	.anim-outRight {animation: anim_outRight .3s;}
	.anim-outBottom {animation: anim_outBottom .3s;}
	.anim-outLeft {animation: anim_outLeft .3s;}
	/* 动画(进入) */
	@keyframes anim_fadeIn{
		from{opacity: 0;} to{opacity: 1;}
	}
	@keyframes anim_scaleIn{
		from{opacity: 0; transform: scale(.9);} to{opacity: 1; transform: scale(1);}
	}
	@keyframes anim_shake{
		0%, 100%{transform: translateX(0);} 10%, 30%, 50%, 70%, 90%{transform: translateX(-10px);} 20%, 40%, 60%, 80%{transform: translateX(10px);}
	}
	@keyframes anim_top{
		from{opacity: 0; transform: translateY(-100%);} to{opacity: 1; transform: none;}
	}
	@keyframes anim_right{
		from{opacity: 0; transform: translateX(100%);} to{opacity: 1; transform: none;}
	}
	@keyframes anim_bottom{
		from{opacity: 0; transform: translateY(100%);} to{opacity: 1; transform: none;}
	}
	@keyframes anim_left{
		from{opacity: 0; transform: translateX(-100%);} to{opacity: 1; transform: none;}
	}
	/* 动画(离开) */
	@keyframes anim_fadeOut{
		100%{opacity: 0;}
	}
	@keyframes anim_scaleOut{
		100%{opacity: 0; transform: scale(.9);}
	}
	@keyframes anim_outTop{
		100%{opacity: 0; transform: translateY(-100%);}
	}
	@keyframes anim_outRight{
		100%{opacity: 0; transform: translateX(100%);}
	}
	@keyframes anim_outBottom{
		100%{opacity: 0; transform: translateY(100%);}
	}
	@keyframes anim_outLeft{
		100%{opacity: 0; transform: translateX(-100%);}
	}
	/* loading */
	@keyframes anim_loading{
		0% {transform: rotate3d(0, 0, 1, 0deg);}
		100% {transform: rotate3d(0, 0, 1, 360deg);}
	}
</style>
