<template>
  <div ref="plot" />
</template>

<script>

import Plotly from 'plotly.js-dist-min';
import { watchEffect } from 'vue';

export default {
  name: 'Plot',
  props: {
    data: {
      type: Array,
      default: null,
    },
    layout: {
      type: Object,
      default: null,
    },
    options: {
      type: Object,
      required: false,
      default: null,
    },
  },
  data: () => ({
  }),
  watch: {

  },
  created() {
    window.addEventListener('resize', this.resizeListener);
  },
  unmounted() {
    window.removeEventListener('resize', this.resizeListener);
  },
  mounted() {
    watchEffect(() => {
      Plotly.react(this.$refs.plot, this.data, this.layout, this.options);
    });
  },
  beforeUnmount() {
    Plotly.purge(this.$el);
  },
  methods: {
    react() {
      Plotly.react(this.$refs.plot, this.data, this.layout, this.options);
    },
    resizeListener() {
      // evtl. ohne refs?!
      Plotly.Plots.resize(this.$refs.plot);
    },
  },
};
</script>

<style>
</style>
