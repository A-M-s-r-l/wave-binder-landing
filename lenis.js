const lenis = new Lenis({
    duration: 5,
    smooth: true,
    smoothTouch: true,
    direction: 'vertical'
})

function raf(time) {
    lenis.raf(time)
    requestAnimationFrame(raf)
}

requestAnimationFrame(raf)