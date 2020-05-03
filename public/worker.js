self.addEventListener('message',  (data) => {
  console.log('worker', data);
  // We received a message from the main thread!

  //  Send back the results
  self.postMessage({
    type: 'results',
    data: {
      wow: 'wow'
    }
  }, )
});
