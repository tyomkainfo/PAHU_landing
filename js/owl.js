$(document).ready(function(){

    $('.slide-one').owlCarousel({
        dots:false,
        loop:true,
        margin:0,
        nav:false,
        responsive:{
            0:{
                items:1
            },
            576:{
                items:3
            }
        }
    });
    $('.our_blog_cards').owlCarousel({
        dots:false,
        loop:true,
        margin:0,
        nav:false,
        responsive:{
            0:{
                items:1
            },
            576:{
                items:2
            },
            992:{
                items:3
            }
        }
    });
    $('.owl-carousel').owlCarousel({
        dots:false,
        loop:true,
        margin:0,
        nav:true,
        smartSpeed: 800,
        navText:false,
        responsive:{
            0:{
                items:2
            },
            768:{
                items:3
            },
            992:{
                items:4
            }
        }
    });
});



