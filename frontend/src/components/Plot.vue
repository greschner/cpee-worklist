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
    loading: {
      type: Boolean,
      required: false,
      default: false,
    },
  },
  data: () => ({
  }),
  created() {
    window.addEventListener('resize', this.resizeListener);
  },
  unmounted() {
    window.removeEventListener('resize', this.resizeListener);
  },
  mounted() {
    watchEffect(() => {
      let { layout, options } = this;
      if (!this.data) {
        layout = {
          xaxis: {
            visible: false,
          },
          yaxis: {
            visible: false,
          },
          annotations: [
            {
              text: this.loading ? '' : 'No matching data found',
              xref: 'paper',
              yref: 'paper',
              showarrow: false,
              font: {
                size: 20,
              },
            },
          ],
        };
        options = { staticPlot: true };
      }
      Plotly.react(this.$refs.plot, this.data, layout, options);
    });
  },
  beforeUnmount() {
    Plotly.purge(this.$el);
  },
  methods: {
    resizeListener() {
      Plotly.Plots.resize(this.$refs.plot);
    },
  },
};
</script>

<style>
</style>
