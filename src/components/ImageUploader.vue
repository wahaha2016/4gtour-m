<template lang="jade">
  .img-uploader
    img(v-for="img in allImages", :src="format(img)")
    .img-uploader-container(:id="imgUploaderContainerId")
      a.addImage(:id="imgUploaderButtonId")
        .cross.cross-lt
        .cross.cross-rt
        .cross.cross-lb
        .cross.cross-rb
    .tip.text-muted 长按图片可删除
</template>
<script>
  import Vue from 'vue'
  import { mapState, mapGetters, mapActions } from 'vuex'
  import { Indicator } from 'mint-ui'
  export default {
    data () {
      return {
        hammerImgs: {}
      }
    },
    props: ['allImages', 'uploadId'],
    computed: {
      imgUploaderContainerId () {
        return this.uploadId ? this.uploadId + '-container' : 'img-uploader-container'
      },
      imgUploaderButtonId () {
        return this.uploadId ? this.uploadId + '-button' : 'addImage'
      },
      ...mapState(['longPressDelayMS']),
      ...mapGetters(['member$UploadToken', 'fetchMember$UploadToken'])
    },
    created () {
      let self = this
      this.ensureMember$UploadToken().then(() => {
        console.log(self.member$UploadToken)
        window.Qiniu.uploader({
          runtimes: 'html5,flash,html4',
          browse_button: self.imgUploaderButtonId,
          uptoken: self.member$UploadToken,
          unique_names: true,
          domain: 'http://img2.okertrip.com/',
          get_new_uptoken: false,
          container: self.imgUploaderContainerId,
          max_file_size: '20mb',
          flash_swf_url: '/static/js/plupload/Moxie.swf',
          max_retries: 3,
          chunk_size: '4mb',
          auto_start: true,
          init: {
            'FilesAdded': function (up, files) {
              Indicator.open('上传中...')
            },
            'FileUploaded': function (up, file, info) {
              const res = JSON.parse(info)
              let uploadedImageUrl = up.getOption('domain') + res.key
              self.$emit('uploaded', uploadedImageUrl)
            },
            'UploadComplete': function () {
              Indicator.close()
            },
            'Error': function (up, err, errTip) {
              Indicator.close()
              window.alert(errTip)
              console.log(err)
              this.fetchMember$UploadToken()
            }
          }
        })
      })
    },
    watch: {
      allImages () {
        this.hammerImgs = {} // clear old delegate object
        Vue.nextTick(() => {
          this.allImages.forEach(this.processActionToImage)
        })
      }
    },
    methods: {
      format: function (img) {
        return window.utils.qiniuImageView(img, window.utils.rem2px(3.75), window.utils.rem2px(3.75))
      },
      processActionToImage (img, index) {
        let vm = this
        let tid
        this.hammerImgs[img] = new window.Hammer.Manager(window.$('.img-uploader img')[index])
//        this.hammerImgs[img].add(new window.Hammer.Tap())
        this.hammerImgs[img].add(new window.Hammer.Press())
        this.hammerImgs[img].on('press pressup', (ev) => {
//          console.log(ev.type + ' gesture detected.')
          if (ev.type === 'press') {
            tid = window.setTimeout(() => {
              vm.$emit('remove', index)
            }, vm.longPressDelayMS)
          } else if (ev.type === 'pressup') {
            console.log(tid)
            tid && window.clearTimeout(tid)
          }
        })
      },
      ...mapActions(['ensureMember$UploadToken'])
    }
  }
</script>
<!-- Add "scoped" attribute to limit CSS to this component only -->
<style lang="less" scoped>
  .img-uploader {
    width: 100%;
    padding-bottom:0.225rem;
    img{
       float:left;
       width:3.75rem;
       height:3.75rem;
       margin-top:0.225rem;
       margin-right:0.225rem;
     }
    .img-uploader-container{
      float:left;
      display: inline-block;
      width:3.75rem;
      height:3.75rem;
      margin-top:0.225rem;
      margin-right:0.225rem;
    }
    a.addImage{
      display: inline-block;
      width:3.75rem;
      height:3.75rem;
      border: solid #c8c8c8 1px;
      padding:0.3rem;
      .cross{
        float:left;
        width:1.5rem;
        height:1.5rem;
        margin:0;
        padding:0;
      }
      .cross-lt{
        border-right:solid 1px #c8c8c8;
        border-bottom:solid 1px #c8c8c8;
      }
      .cross-rt{
        border-left:solid 1px #c8c8c8;
        border-bottom:solid 1px #c8c8c8;
      }
      .cross-lb{
        border-right:solid 1px #c8c8c8;
        border-top:solid 1px #c8c8c8;
      }
      .cross-rb{
        border-left:solid 1px #c8c8c8;
        border-top:solid 1px #c8c8c8;
      }
    }
    .tip{
      padding-top:0.5rem;
      clear:left;
      display:block;
      font-size:0.5rem;
      font-style: italic;
      text-align:left;
    }
  }
</style>
