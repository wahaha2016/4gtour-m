<template lang="jade">
  .img-swiper(@click="close")
    mt-swipe(:auto="swipeAuto")
      mt-swipe-item(v-for=" image in allImages")
        img(:src="image" @click="close")
        span.verticle-middle
</template>
<script>
  export default {
    props: ['allImages', 'currentImage', 'auto'],
    computed: {
      swipeAuto () {
        return this.auto || 0
      }
    },
    methods: {
      close () {
        this.$emit('restore')
      }
    }
  }
</script>
<!-- Add "scoped" attribute to limit CSS to this component only -->
<style lang="less" >
  .img-swiper {
    width:100%;
    height:100%;
    background-color: #000;
    img{
      width:100%;
      vertical-align:middle;
    }
  }
</style>
