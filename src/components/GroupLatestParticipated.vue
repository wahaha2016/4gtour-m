<template lang="jade">
  .group-latest-participated
    .have-no-participated.text-muted.text-italic(v-if="!haveGroupLatestPariticipated") 没有任何参团信息
    span.verticle-middle(v-if="!haveGroupLatestPariticipated")
    .participated(v-if="haveGroupLatestPariticipated")
      .item-head
        .count-down-part(v-if="beforeDeadline") 报名截止
          count-down(v-if="secondsToDeadline", :seconds-to-assembly="secondsToDeadline" v-on:count-down-finish="countDownFinished")
        .count-down-part(v-if="beforeAssembling") 等待出行
          count-down(v-if="secondsToAssembly", :seconds-to-assembly="secondsToAssembly" v-on:count-down-finish="countDownFinished")
        .count-down-part(v-if="afterAssembling") 出行中
      router-link.item-body(:to="groupInfoUrl")
        .group-left
          img(v-if="showGroupImg", :src="group.imgs[0]")
          span.verticle-middle(v-if="showGroupImg")
          .no-img(v-if="!showGroupImg")
            .no-img-text.text-muted.text-italic 暂无图片
            span.verticle-middle
        .group-right
          .title {{group.name}}
          .assembling-time
            i.fa.fa-clock-o.text-primary(aria-hidden="true")
            span {{group.assembling_time | humanizeDate}}
          .participate-max
            i.fa.fa-users(aria-hidden="true")
            span {{group.participant_number}} /{{group.participate_max}}人团
          .action-status
            .action
              a.btn1.btn-convene-enter( @click.prevent="conveneAndEnter", :class='{"disabled":!canConveneAndEnter}') {{actionBtnText}}
              span.verticle-middle
            .success-img-tag
              .tag-wrapper
                img(:src="participatedSuccessImg")
                span.verticle-middle
</template>
<!-- Add "scoped" attribute to limit CSS to this component only -->
<style lang="less" scoped >
.group-latest-participated {
  width:100%;
  background-color: white;
  padding:0 0.75rem;
  height: 10.4rem;
  text-align: center;
  .have-no-participated{
    height: 100%;
    font-size: 1.5rem;
    display: inline-block;
    vertical-align:center;
  }
  .participated{
    height: 100%;
    display:flex;
    flex-direction: column;
    .item-head{
      padding: 0.5rem 0;
      border-bottom: solid 1px #F6F6F7;
      height: 2.5rem;
      flex:0;
      .count-down-part{
        text-align:left;
        color:#737d7d;
        font-size:1rem;
      }
    }
    .item-body{
      flex: 1;
      padding: 0.5rem 0;
      display: flex;
      .group-left{
        width: 6.5rem;
        height: 6.5rem;
        background-color: black;
        img{
          max-width: 6.5rem;
          max-height: 6.5rem;
          vertical-align: middle;
          display: inline-block;
        }
        .no-img{
          width: 6.5rem;
          height: 6.5rem;
          background-color: #737d7d;
          .no-img-text{
            vertical-align: middle;
            display: inline-block;
          }
        }
      }
      .group-right{
        flex: 1;
        padding-left: 0.5rem;
        text-align: left;
        display: flex;
        flex-direction: column;
        .title{
          font-size:1rem;
          height:1.6rem;
          line-height:1.6rem;
        }
        .assembling-time{
          color:#737d7d;
          font-size:0.8rem;
          height:1.2rem;
          line-height:1.2rem;
          span{
            padding-left:0.2rem;
          }
        }
        .participate-max{
          color:#737d7d;
          font-size:0.55rem;
          height:0.8rem;
          line-height:0.8rem;
          span{
            padding-left:0.3rem;
          }
        }
        .action-status{
          flex: 1;
          display: flex;
          .action{
            flex:2;
            a.btn-convene-enter{
              width:6.25rem;
              display: inline-block;
              vertical-align: middle;
            }
          }
          .success-img-tag{
            flex:1;
            .tag-wrapper{
              width:3rem;
              height:3rem;
              img{
                max-width: 3rem;
                max-height: 3rem;
                vertical-align: middle;
                display: inline-block;
              }
            }
          }
        }
      }
    }
  }
}
</style>
<script>
  import { mapActions } from 'vuex'
  import moment from 'moment'
  import CountDown from '../components/CountDown.vue'
  export default {
    props: ['group'],
    computed: {
      groupInfoUrl () {
        return {path: '/group/details/' + this.group.id}
      },
      haveGroupLatestPariticipated () {
        return !!this.group.id
      },
      beforeDeadline () {
        return this.group.group_status === 'A0003'
      },
      beforeAssembling () {
        return this.group.group_status === 'A0005'
      },
      afterAssembling () {
        return this.group.group_status === 'A0009'
      },
      canConveneAndEnter () {
        var seconds = moment(this.group.assembling_time).unix() - moment().unix()
        var conveneInAdvanceSeconds = 1800 // 半小时
        return (this.group.group_status === 'A0005' && seconds <= conveneInAdvanceSeconds) || this.group.group_status === 'A0009'
      },
      showGroupImg () {
        return this.group.imgs.length > 0
      },
      assemblingTimeFormatted () {
        return moment(this.group.assembling_time).format('MM月DD日 HH:mm')
      },
      participatedSuccessImg () {
        return window.utils.qiniuImageView('http://img2.okertrip.com/participated-success.png', window.utils.rem2px(6.5), window.utils.rem2px(6.5))
      },
      actionBtnText () {
        if (this.group.group_status === 'A0003') {
          return '报名中'
        }
        return this.canConveneAndEnter ? '进入' : '等待集合'
      },
      secondsToDeadline () {
        var seconds = moment(this.group.deadline || this.group.assembling_time).unix() - moment().unix()
        console.log(seconds)
        return seconds > 0 ? seconds : 0
      },
      secondsToAssembly () {
        var seconds = moment(this.group.assembling_time).unix() - moment().unix()
        console.log(seconds)
        return seconds > 0 ? seconds : 0
      }
    },
    methods: {
      format (img) {
        return window.utils.qiniuImageView(img, window.utils.rem2px(3), window.utils.rem2px(3))
      },
      countDownFinished () {
        console.log('countDownFinished')
//        if (this.beforeAssembling && this.group.group_status !== 'A0007' && this.group.group_status !== 'A0009') {
//          // 更新group_status
//          console.log('更新group_status')
//          let groupStatus = this.group.participant_number < this.group.participate_min ? 'A0007' : 'A0009'
//          this.updateLatestGroupStatus({id: this.group.id, group_status: groupStatus}).then(() => {
//            groupStatus === 'A0007' && this.$refs.countDownAssembling.restart()
//          })
//        }
      },
      conveneAndEnter () {
        if (this.canConveneAndEnter) {
          this.$router.push('/group/convene/' + this.group.id)
        }
        return false
      },
      ...mapActions(['updateLatestGroupStatus'])
    },
    components: {
      CountDown
    }
  }
</script>
