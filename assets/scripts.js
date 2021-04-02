// Global variables
const $carousel = $('#grabAndPullCarousel');
const $carouselInner = $('#grabAndPullCarousel .carousel-inner');
const $carouselItems = $('#grabAndPullCarousel .carousel-item');
const carouselHammer = new Hammer($carousel[0]);
let carouselInnerWidth = $carouselInner.width();
let startXCoord = 0;
let imageLeftCoord = 0;
let lastMoveType = '';
let resizeTimeout = null;

window.addEventListener('resize', function(){
  clearTimeout(resizeTimeout);
  resizeTimeout = setTimeout(() => {
    carouselInnerWidth = $carouselInner.width();
  }, 500)
});

// Start carousel
$carousel.carousel('cycle');

carouselHammer.on("panstart panleft panright panend press pressup", function(event) {
  eventLogs(event);
  let currentXCoord = event.pointers[0].pageX;
  let currentEventType = event.type;
  const $carouselItemActive = $('#grabAndPullCarousel .carousel-item.active');
  const $carouselItemPrev = $('#grabAndPullCarousel .carousel-item.prev');
  const $carouselItemNext = $('#grabAndPullCarousel .carousel-item.next');

  if(currentEventType === 'panstart' || currentEventType === 'press') {
    $carousel.carousel('pause');
  }

  if (currentEventType === "panstart") {
    startXCoord = currentXCoord;
    let prev = $carouselItemActive.prev();
    let next = $carouselItemActive.next();

    // circular search
    if (prev[0] === undefined) {
      prev = $carouselInner.children().last();
    }

    if (next[0] === undefined) {
      next = $carouselInner.children().first();
    }

    prev.addClass("prev");
    next.addClass("next");
  } 
  else if(currentEventType === 'panright' || currentEventType === 'panleft') {
    lastMoveType = currentEventType;
    let diff = currentXCoord - startXCoord;
    $carouselItemPrev.addClass('visible-carousel-item');
    $carouselItemNext.addClass('visible-carousel-item');

    $carouselItemActive.css({
      transition: "initial",
      transform: "translate3d(" + (imageLeftCoord + diff) + "px, 0, 0)"
    });

    $carouselItemNext.css({
      transition: "initial",
      transform: "translate3d(" + (imageLeftCoord + diff + carouselInnerWidth) + "px, 0, 0)"
    });

    $carouselItemPrev.css({
      transition: "initial",
      transform: "translate3d(" + (imageLeftCoord + diff - carouselInnerWidth) + "px, 0, 0)"
    });

    imageLeftCoord += diff;
    startXCoord = currentXCoord;
  }
  else if(currentEventType === 'panend') {
    if(lastMoveType === "panright" && (imageLeftCoord > carouselInnerWidth / 2)) {
      console.log('left')
      snapLeft($carouselItemPrev, $carouselItemNext);
    }
    else if(lastMoveType === "panleft" && (imageLeftCoord < -(carouselInnerWidth / 2))) {
      console.log('right')
      snapRight($carouselItemPrev, $carouselItemNext);
    }
    else {
      console.log('no left no right')
      cleanTransitionWhenDontSlide($carouselItemActive, $carouselItemPrev, $carouselItemNext)
    }
  }

  if(currentEventType === 'pressup') {
    $carousel.carousel('cycle');
  }
});

// Helper functions
function initialize() {
  $carousel.carousel('cycle');
  carouselInnerWidth = $carouselInner.width();
  imageLeftCoord = 0;
  startXCoord = 0;
  lastMoveType = '';
}

function cleanTransitionWhenSlide($carouselItemPrev, $carouselItemNext) {
  $carouselItems.css({ transition: "", transform: "" });
  $carouselItemPrev
    .removeClass('prev')
    .removeClass('visible-carousel-item');
  
  $carouselItemNext
    .removeClass('next')
    .removeClass('visible-carousel-item');
}

function cleanTransitionWhenDontSlide($carouselItemActive, $carouselItemPrev, $carouselItemNext) {
  $carouselItemActive.css({
    transition: "all .6s ease",
    transform: "translate3d(0, 0, 0)"
  });

  $carouselItemNext.css({
    transition: "all .6s ease",
    transform:
      `translate3d(${carouselInnerWidth}px, 0, 0)`
  });

  $carouselItemPrev.css({
    transition: "all .6s ease",
    transform:
      `translate3d(${-carouselInnerWidth}px, 0, 0)`
  });

  setTimeout(() => {
    cleanTransitionWhenSlide($carouselItemPrev, $carouselItemNext);
    initialize();
  }, 600);
}

function snapLeft($carouselItemPrev, $carouselItemNext) {
  cleanTransitionWhenSlide($carouselItemPrev, $carouselItemNext);
  $carousel.carousel("prev");
  setTimeout(()=>{
    initialize()
  }, 600);
}

function snapRight($carouselItemPrev, $carouselItemNext) {
  cleanTransitionWhenSlide($carouselItemPrev, $carouselItemNext);
  $carousel.carousel("next");
  setTimeout(()=>{
    initialize()
  }, 600);
}

function eventLogs(event) {
  if(event.type === 'panstart') {
    console.log('panstart');
  }

  if(event.type === 'panleft') {
    console.log('panleft');
  }

  if(event.type === 'panright') {
    console.log('panright');
  }

  if(event.type === 'panend') {
    console.log('panend');
  }

  if(event.type === 'press') {
    console.log('press');
  }

  if(event.type === 'pressup') {
    console.log('pressup');
  }
}