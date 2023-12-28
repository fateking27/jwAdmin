<template>
  <div style="margin-top: 500px">
    <audio
      @timeupdate="updateProgress"
      controls
      ref="audioRef"
      style="display: none"
    >
      <source :src="fileurl" type="audio/mpeg" />
      您的浏览器不支持音频播放
    </audio>
    <div class="audio-right">
      <i
        v-if="audioStatus == 'pause'"
        class="iconfont icon-pausecircle"
        @click="playAudio"
      />
      <!--img
        v-if="audioStatus == 'pause'"
        @click="playAudio"
        class="dialogAudioPlay"
        src="../assets/img/play.png"
        alt=""
      />-->
      <i
        v-if="audioStatus !== 'pause'"
        class="iconfont icon-player-play-circle"
        @click="playAudio"
      />
      <!--      <img
              v-if="audioStatus !== 'pause'"
              @click="playAudio"
              class="dialogAudioPlay"
              src="../assets/img/pause.png"
              alt=""
            />-->
      <div class="progress-bar-bg" id="progressBarBg" v-dragto="setAudioIcon">
        <div class="progress-bar" id="progressBar" />
      </div>
      <div class="audio-time" style="min-height: 10px">
        <span class="audio-length-current" id="audioCurTime">{{
          audioStart
        }}</span
        >/
        <span class="audio-length-total">{{ duration }}</span>
      </div>
      <div class="volume">
        <div
          @click.stop="
            () => {
              return false;
            }
          "
          class="volume-progress"
          v-show="audioHuds"
        >
          <div
            class="volume-bar-bg"
            id="volumeBarBg"
            v-adjuster="handleShowMuteIcon"
          >
            <div class="volume-bar" id="volumeBar" />
          </div>
        </div>
        <!-- <i class="iconfont pl-1" :class="audioIcon" @click.stop="audioHuds = !audioHuds"> </i> -->
        <i
          :class="['iconfont', audioIcon]"
          @click.stop="audioHuds = !audioHuds"
        />
        <!--        <img
                  class="audio_high"
                  @click.stop="audioHuds = !audioHuds"
                  src="../assets/img/audio_high.png"
                  alt=""
                />-->
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, reactive, computed } from "vue";

const props = defineProps({
  // eslint-disable-next-line vue/require-prop-type-constructor
  fileurl: ""
});
const audioStatus = ref("play");
const audioStart = ref("0:00");
const duration = ref("0:00");
const audioVolume = ref(0.5);
const audioHuds = ref(false);
const audioRef = ref();
const VDragto = reactive({
  mounted: function (el, binding, vnode) {
    el.addEventListener(
      "click",
      e => {
        const wdiv = document.getElementById("progressBarBg").clientWidth;
        const audio = vnode.ctx.refs.audioRef;
        // console.log(audio,77);
        // return;
        // 只有音乐开始播放后才可以调节，已经播放过但暂停了的也可以
        const ratemin = e.offsetX / wdiv;
        const rate = ratemin * 100;
        document.getElementById("progressBar").style.width = rate + "%";
        audio.currentTime = audio.duration * ratemin;
        audio.play();
        binding.value();
      },
      false
    );
  }
});
const VAdjuster = reactive({
  mounted: function (el, binding, vnode) {
    el.addEventListener(
      "click",
      e => {
        const hdiv = document.getElementById("volumeBarBg").clientHeight;
        const audio = vnode.ctx.refs.audioRef;
        // 只有音乐开始播放后才可以调节，已经播放过但暂停了的也可以
        const ratemin = e.offsetY / hdiv;
        const rate = ratemin * 100;
        document.getElementById("volumeBar").style.height = rate + "%";
        audio.volume = ratemin;
        binding.value(rate / 100);
      },
      false
    );
  }
});
onMounted(() => {
  fetch();
});

function fetch() {
  // let that = this;
  const myVid = audioRef.value;
  myVid.loop = false;
  // 监听音频播放完毕
  myVid.addEventListener(
    "ended",
    function () {
      audioStatus.value = "play"; // 显示播放icon
      document.getElementById("progressBar").style.width = "0%"; // 进度条初始化
    },
    false
  );
  if (myVid != null) {
    myVid.oncanplay = function () {
      duration.value = transTime(myVid.duration); // 计算音频时长
    };
    myVid.volume = 0.5; // 设置音量50%
  }
}

// 播放暂停控制
function playAudio() {
  const recordAudio = audioRef.value; // 获取audio元素
  if (recordAudio.paused) {
    recordAudio.play();
    audioStatus.value = "pause";
  } else {
    recordAudio.pause();
    audioStatus.value = "play";
  }
}

// 更新进度条与当前播放时间
function updateProgress(e) {
  const value = e.target.currentTime / e.target.duration;
  if (document.getElementById("progressBar")) {
    document.getElementById("progressBar").style.width = value * 100 + "%";
    if (e.target.currentTime === e.target.duration) {
      audioStatus.value = "pause";
    }
  } else {
    audioStatus.value = "pause";
  }

  audioStart.value = transTime(audioRef.value.currentTime);
}

/**
 * 音频播放时间换算
 * @param {number} value - 音频当前播放时间，单位秒
 */
function transTime(time) {
  const duration = parseInt(time);
  let minute = parseInt(duration / 60);
  let sec = (duration % 60) + "";
  const isM0 = ":";
  if (minute === 0) {
    minute = "00";
  } else if (minute < 10) {
    minute = "0" + minute;
  }
  if (sec.length74 === 1) {
    sec = "0" + sec;
  }
  return minute + isM0 + sec;
}

function setAudioIcon() {
  console.log(99);
  audioStatus.value = "pause";
}

function handleShowMuteIcon(val) {
  console.log(4444);
  audioVolume.value = val;
}

const audioIcon = computed(() => {
  if (audioHuds.value) {
    return audioVolume.value < 0.01 ? "icon-shengyinjingyin" : "icon-laba";
  } else {
    return "icon-shengyinjingyin";
  }
});
</script>

<style lang="scss" scoped>
.volume {
  position: relative;

  .volume-progress {
    position: absolute;
    top: -150px;
    width: 32px;
    height: 140px;
    padding-top: 10px;
    background: #f6f6f6;
    border-radius: 4px;
  }

  .volume-bar-bg {
    position: relative;
    flex: 1;
    width: 6px;
    height: 120px;
    margin: 0 auto;
    cursor: pointer;
    background: #dcdcdc;
    border-radius: 100px;
    transform: rotate(180deg);

    .volume-bar {
      width: 6px;
      height: 50%;
      background: #56bf8b;
      border-radius: 100px;
    }
  }

  .checked {
    color: #56bf8b;
  }
}

.audio-right {
  display: flex;
  width: 400px;
  height: 49px;
  padding: 0 15px;
  line-height: 49px;
  background: #f6f6f6;
  border-radius: 6px;

  .dialogAudioPlay {
    width: 40px;
    height: 40px;
    cursor: pointer;
  }

  .progress-bar-bg {
    position: relative;
    top: 50%;
    flex: 1;
    height: 10px;
    margin: 0 10px;
    margin-top: -1px;
    cursor: pointer;
    background-color: #fff;
    transform: translateY(-50%);
  }

  .progress-bar {
    width: 0%;
    height: 10px;
    background-color: #56bf8b;
    border-radius: 5px;
  }

  .audio-time {
    overflow: hidden;
    font-size: 14px;

    .audio-length-total {
      float: right;
    }

    .audio-length-current {
      float: left;
    }
  }
}

.audio_high {
  width: 50px;
  height: 50px;
}
</style>
