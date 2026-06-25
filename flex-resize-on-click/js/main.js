var start = anime.timeline({
  easing: 'easeInOutSine',
  autoplay: false,
  duration: 650
});

start
  .add(
    {
      targets: '.f3',
      flexGrow: ['0']
    },
    '+=100'
  )
  .add(
    {
      targets: '.bR',
      opacity: [1, 0],
      duration: 400,
      left: ['-1px']
    },
    '-=700'
  )
  .add(
    {
      targets: '.f1',
      flexGrow: ['0', '1.5']
    },
    '-=300'
  )
  .add(
    {
      targets: '.bL',
      opacity: [0, 1],
      left: ['100px', '50%'],
      duration: 400
    },
    '-=400'
  );

document.querySelector('.btnSi').onclick = function() {
  start.play();
  if (start.began) start.reverse();
};
