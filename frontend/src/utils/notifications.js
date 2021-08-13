/* eslint-disable func-names */
const errorMessage = function (error) {
  this.$notify.error({
    title: 'Error',
    message: `${error.message}: ${error.response.data.error || ''}`,
  });
};

const successMessage = function (message) {
  this.$notify.success({
    title: 'Success',
    message,
  });
};

export { errorMessage, successMessage };
