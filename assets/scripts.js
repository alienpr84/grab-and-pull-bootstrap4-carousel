// Global variables
const $carousel = $('#grabAndPullCarousel');
const $carouselInner = $('#grabAndPullCarousel .carousel-inner');
const $carouselItems = $('#grabAndPullCarousel .carousel-item');
const carouselHammer = new Hammer($carousel[0]); // create a hammer instance
let carouselInnerWidth = $carouselInner.width(); // save the carousel width
let startXCoord = 0; // start x coordinate
let imageLeftCoord = 0; // set the current Left coordinate
let lastMoveType = ''; // save the lastMove type
let resizeTimeout = null; // timeout id for resize event

window.addEventListener('resize', function(){
  clearTimeout(resizeTimeout);
  resizeTimeout = setTimeout(() => {
    carouselInnerWidth = $carouselInner.width();
  }, 500)
});

// Start carousel
$carousel.carousel('cycle');

// Hammer events for Carousel
carouselHammer.on("panstart panleft panright panend press pressup", function(event) {
  let currentXCoord = event.pointers[0].pageX; // set the current mouse position over x axis
  let currentEventType = event.type; // set the current event type passed to hammer On method as string
  const $carouselItemActive = $('#grabAndPullCarousel .carousel-item.active');
  const $carouselItemPrev = $('#grabAndPullCarousel .carousel-item.prev');
  const $carouselItemNext = $('#grabAndPullCarousel .carousel-item.next');

  // we are going to pause the carousel when we start to grab the slide
  if(currentEventType === 'panstart' || currentEventType === 'press') {
    $carousel.carousel('pause');
  }

  // When we start to grab the slide
  if (currentEventType === "panstart") {
    startXCoord = currentXCoord;
    let prev = $carouselItemActive.prev();
    let next = $carouselItemActive.next();

    // circular slide search for next and prev slide item when the active slide item doesn't have a prev or next slide item.
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

    // here we move the slides items active, next and prev. 
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
    // we only going to make the transition if the movement over the current slide is greather than its half width.
    if(lastMoveType === "panright" && (imageLeftCoord > carouselInnerWidth / 2)) {
      snapLeft($carouselItemPrev, $carouselItemNext);
    }
    else if(lastMoveType === "panleft" && (imageLeftCoord < -(carouselInnerWidth / 2))) {
      snapRight($carouselItemPrev, $carouselItemNext);
    }
    else {
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