<template>
  <div class="about">
    <h1>This is an about page 1220</h1>
    <boxplot
      :data="d.data"
      :layout="layout"
      :options="options"
    />
  </div>
</template>

<script>

import Boxplot from '../components/plots/Plot.vue';

export default {
  name: 'About',
  components: {
    Boxplot,
  },
  data: () => ({
    d: {
      data: [{ x: [1, 2, 3, 4], y: [10, 15, 13, 17], type: 'scatter' }],
    },
    layout: {
      title: 'My graph :)',
    },
    options: {
      responsive: false,
      displayModeBar: true,
    },
  }),
};
</script>
