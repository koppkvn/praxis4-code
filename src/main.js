import './styles/style.scss';






function initAccordionCSS() {
    const wrappers = document.querySelectorAll('.page-wrapper');

    let scope = wrappers[0];
    if (!scope.querySelector('[data-accordion-css-init]')) return; // Exit if no accordion elements found

    scope.querySelectorAll('[data-accordion-css-init]').forEach((accordion) => {
        const closeSiblings = accordion.getAttribute('data-accordion-close-siblings') === 'true';

        accordion.addEventListener('click', (event) => {
            const toggle = event.target.closest('[data-accordion-toggle]');
            if (!toggle) return; // Exit if the clicked element is not a toggle

            const singleAccordion = toggle.closest('[data-accordion-status]');
            if (!singleAccordion) return; // Exit if no accordion container is found

            const isActive = singleAccordion.getAttribute('data-accordion-status') === 'active';
            singleAccordion.setAttribute('data-accordion-status', isActive ? 'not-active' : 'active');

            // When [data-accordion-close-siblings="true"]
            if (closeSiblings && !isActive) {
                accordion.querySelectorAll('[data-accordion-status="active"]').forEach((sibling) => {
                    if (sibling !== singleAccordion) sibling.setAttribute('data-accordion-status', 'not-active');
                });
            }
            setTimeout(() => {
                teamST.forEach(st => st.refresh());
            }, 601);
        });
    });
}
function initLenis() {
    // if (window.lenis) {
    //     window.lenis.destroy();



    //     window.lenis = null;
    // }

    const wrappers = document.querySelectorAll('.page-wrapper');

    let scope = wrappers[0];

    window.lenis = new Lenis({
        wrapper: scope,
        content: scope.querySelector('.page-content'),

    });



    window.lenis.on("scroll", ScrollTrigger.update);
    gsap.ticker.add((time) => {
        lenis.raf(time * 1000);
    });

    gsap.ticker.lagSmoothing(0);

}

let teamST = [];
function initTeamImagePin() {
    const wrappers = document.querySelectorAll('.page-wrapper');

    let scope = wrappers[0];
    if (!scope.querySelector('.section.is--team')) return; // Exit if no team section found

    scope.querySelectorAll('.button-main .button-span-name').forEach(span => {
        const words = span.textContent.split(' ');
        if (words.length > 1) {
            words.splice(1, 1); // Remove the second word
            span.textContent = words.join(' ');
        }
    });


    let mm = gsap.matchMedia();
    mm.add("(min-width: 768px)", () => {
        gsap.set(".section.is--team", {
            paddingBottom: "57vh",
        });

        gsap.utils.toArray(".team-image-wrapper").forEach((el, i, arr) => {
            gsap.set(el, {
                zIndex: arr.length - i,
                position: "absolute",
                top: 0,
                right: 0,
            });
            const st = ScrollTrigger.create({
                trigger: ".section.is--team",
                start: 'top top',
                end: 'bottom bottom',
                pin: el,
                // markers: true,
            });


            teamST.push(st);
        });




        scope.querySelectorAll(".team-text-wrapper").forEach((el, i, arr) => {
            if (i < arr.length - 1) {
                const tween = gsap.to(el.parentElement.querySelector(".team-image-wrapper"), {
                    clipPath: "inset(0 0 0 100%)",
                    ease: "none",
                    scrollTrigger: {
                        trigger: el,
                        start: '70% top',
                        end: 'bottom top',
                        // markers: true,
                        scrub: 1,
                    }
                })
                teamST.push(tween.scrollTrigger);
            }
        })

    })



    scope.querySelectorAll('.rich-text-ausbildung p').forEach(p => {
        const text = p.innerHTML;
        const parts = text.split('&gt;'); // &gt; is the encoded > symbol in HTML

        if (parts.length === 2) {
            const year = parts[0].trim();
            const title = parts[1].trim();

            p.innerHTML = `
            <span class="edu-year">${year}</span>
            <span class="edu-title">${title}</span>
          `;
        }
    });



}

function initMarqueeImageLoaded() {
    const wrappers = document.querySelectorAll('.page-wrapper');

    let scope = wrappers[0];
    if (!scope.querySelector('[data-marquee-scroll-direction-target]')) return;
    // Exit if no marquee elements found
    scope.querySelectorAll('[data-marquee-scroll-direction-target]').forEach((marquee) => {
        // Query marquee elements
        const marqueeContent = marquee.querySelector('[data-marquee-collection-target]');
        const marqueeScroll = marquee.querySelector('[data-marquee-scroll-target]');
        if (!marqueeContent || !marqueeScroll) return;

        // Wait for all images to load before initializing
        const images = marqueeContent.querySelectorAll('img');

        // const imagePromises = Array.from(images).map(img => img.decode().catch(() => { }));
        const imagePromises = Array.from(images).map(img => {
            if (img.complete) {
                return Promise.resolve();
            }
            return new Promise(resolve => {
                img.onload = resolve;
                img.onerror = resolve;
            });
        });

        Promise.all(imagePromises).then(() => {
            initMarquee(marquee, marqueeContent, marqueeScroll);
        });
    });
}

function initMarquee(marquee, marqueeContent, marqueeScroll) {

    console.log("INITING MARQUEE");

    // Get data attributes
    const { marqueeSpeed: speed, marqueeDirection: direction, marqueeDuplicate: duplicate, marqueeScrollSpeed: scrollSpeed } = marquee.dataset;

    // Convert data attributes to usable types
    const marqueeSpeedAttr = parseFloat(speed);

    const marqueeDirectionAttr = direction === 'right' ? 1 : -1; // 1 for right, -1 for left
    const duplicateAmount = parseInt(duplicate || 0);
    const scrollSpeedAttr = parseFloat(scrollSpeed);
    const speedMultiplier = window.innerWidth < 479 ? 0.25 : window.innerWidth < 991 ? 0.5 : 1;

    let marqueeSpeed = marqueeSpeedAttr * (marqueeContent.offsetWidth / window.innerWidth) * speedMultiplier;
    console.log(marqueeSpeed);

    // Precompute styles for the scroll container
    marqueeScroll.style.marginLeft = `${scrollSpeedAttr * -1}%`;
    marqueeScroll.style.width = `${(scrollSpeedAttr * 2) + 100}%`;

    // Duplicate marquee content
    if (duplicateAmount > 0) {
        const fragment = document.createDocumentFragment();
        for (let i = 0; i < duplicateAmount; i++) {

            const clone = marqueeContent.cloneNode(true);
            clone.querySelectorAll('img[loading="lazy"]').forEach(img => {
                img.removeAttribute('loading');
            });

            fragment.appendChild(clone);

        }
        marqueeScroll.appendChild(fragment);
    }

    // GSAP animation for marquee content
    const marqueeItems = marquee.querySelectorAll('[data-marquee-collection-target]');
    const animation = gsap.to(marqueeItems, {
        xPercent: -100, // Move completely out of view
        repeat: -1,
        duration: marqueeSpeed,
        ease: 'linear',

    }).totalProgress(0.5);

    // Initialize marquee in the correct direction
    gsap.set(marqueeItems, { xPercent: marqueeDirectionAttr === 1 ? 100 : -100 });
    animation.timeScale(marqueeDirectionAttr); // Set correct direction
    animation.play(); // Start animation immediately

    // Set initial marquee status
    marquee.setAttribute('data-marquee-status', 'normal');

    // ScrollTrigger logic for direction inversion
    ScrollTrigger.create({
        trigger: marquee,
        start: 'top bottom',
        end: 'bottom top',
        onUpdate: (self) => {
            const isInverted = self.direction === 1; // Scrolling down
            const currentDirection = isInverted ? -marqueeDirectionAttr : marqueeDirectionAttr;
            console.log(isInverted);

            // Update animation direction and marquee status
            animation.timeScale(currentDirection);
            marquee.setAttribute('data-marquee-status', isInverted ? 'normal' : 'inverted');
        }
    });

    // Extra speed effect on scroll
    const tl = gsap.timeline({
        scrollTrigger: {
            trigger: marquee,
            start: '0% 100%',
            end: '100% 0%',
            scrub: 0,
        }
    });

    const scrollStart = marqueeDirectionAttr === -1 ? scrollSpeedAttr : -scrollSpeedAttr;
    const scrollEnd = -scrollStart;

    tl.fromTo(marqueeScroll, { x: `${scrollStart}vw` }, { x: `${scrollEnd}vw`, ease: 'none' });
}

function initNavigation() {
    const wrappers = document.querySelectorAll('.page-wrapper');

    let scope = wrappers[0];
    if (!scope.querySelector('.header-nav-link.is--angebote')) return; // Exit if no navigation elements found

    scope.querySelectorAll('a[href*="/#"]').forEach(link => {
        const href = link.getAttribute("href");
        const currentUrl = window.location.pathname;
        const targetUrl = new URL(href, window.location.origin).pathname;

        console.log(currentUrl, targetUrl);

        if (targetUrl === currentUrl) {
            link.setAttribute("data-no-swup", "");
            link.addEventListener('click', (e) => {
                e.preventDefault(); // Prevent default link behavior


                const targetId = href.split('#')[1]; // Get the target ID from the href
                console.log(targetId);

                if (targetId) {
                    setTimeout(() => {
                        window.lenis.scrollTo(`#${targetId}`, {
                            duration: 3,
                            ease: "easeOutQuad",
                        });
                    }, 0);

                }
            })
        }


    });


    const trigger = scope.querySelector('.header-nav-link.is--angebote');
    const dropdown = scope.querySelector('.nav-link-wrapper');
    const nav = scope.querySelector('.nav');
    let isStillInside;
    function showDropdown(e) {
        dropdown.style.opacity = '1';
        dropdown.style.pointerEvents = 'auto';
        nav.classList.add('nav-dropdown-open');
        if (isStillInside) return

        gsap.fromTo(dropdown.querySelectorAll(".header-nav-link"), {
            yPercent: -50,
        }, {
            yPercent: 0,
            stagger: 0.03,
            ease: "easeOutQuad",
        }

        )
    }

    function hideDropdown() {
        dropdown.style.opacity = '0';
        dropdown.style.pointerEvents = 'none';
        nav.classList.remove('nav-dropdown-open');
    }

    // Only show when hovering the trigger
    trigger.addEventListener('mouseenter', () => {
        showDropdown();
    });

    // Hide when leaving either element
    [trigger, dropdown].forEach(el => {
        el.addEventListener('mouseleave', () => {
            setTimeout(() => {
                // Check if user still hovering either
                isStillInside = trigger.matches(':hover') || dropdown.matches(':hover');
                if (!isStillInside) hideDropdown();
            }, 50); // small delay to prevent flicker
        });
    });



    // BIG NAV CODE
    const menuButton = scope.querySelector('.menu-button');
    const bigNav = scope.querySelector('.big-nav-wrapper');
    const bgNav = scope.querySelector('.big-nav-wrapper .bg-nav');
    const header = scope.querySelector('.header');

    const linksNav = scope.querySelectorAll('.big-nav-wrapper a');

    linksNav.forEach(link => {
        link.addEventListener('click', (e) => {
            // e.preventDefault(); // Prevent default link behavior
            // const href = link.getAttribute('href'); // Get the href attribute
            // if (href) {
            closeNav(); // Close the navigation
            // setTimeout(() => {
            //     window.location.href = href; // Navigate to the link after closing
            // }, 300); // Delay to allow closing animation to complete
            // }
        }
        );
    });


    function closeNav() {
        header.classList.toggle('is--open');
        bigNav.classList.toggle('is--open');
        bigNav.classList.contains('is--open') ? window.lenis.destroy() : initLenis(); // Reinitialize Lenis on close

    }

    menuButton.addEventListener('click', closeNav);

    // Close on background click
    bgNav.addEventListener('click', closeNav);

    // Close on ESC key
    scope.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && bigNav.classList.contains('is--open')) {
            closeNav();
        }
    })

}

function initDetectScrollingDirection() {
    let lastScrollTop = 0;
    const threshold = 10; // Minimal scroll distance to switch to up/down 
    const thresholdTop = 400; // Minimal scroll distance from top of window to start
    const wrappers = document.querySelectorAll('.page-wrapper');
    let scope = wrappers[0];
    scope.addEventListener("scroll", () => {
        const nowScrollTop = window?.lenis?.animatedScroll;



        if (Math.abs(lastScrollTop - nowScrollTop) >= threshold) {
            // Update Scroll Direction
            const direction = nowScrollTop > lastScrollTop ? 'down' : 'up';
            scope.setAttribute('data-scrolling-direction', direction)
            // wrapper[0].parentElement.querySelectorAll('[data-scrolling-direction]').forEach(el =>
            //     el.setAttribute('data-scrolling-direction', direction)
            // );

            // Update Scroll Started
            const started = nowScrollTop > thresholdTop;


            scope.setAttribute('data-scrolling-started', started ? 'true' : 'false')
            // wrapper[0].parentElement.querySelectorAll('[data-scrolling-started]').forEach(el =>
            //     el.setAttribute('data-scrolling-started', started ? 'true' : 'false')
            // );

            lastScrollTop = nowScrollTop;
        }
    });
}

function initSplitText() {
    const wrappers = document.querySelectorAll('.page-wrapper');

    let scope = wrappers[0];
    if (!scope.querySelector('[data-split="lines"]') && !scope.querySelector('[data-split="rich"]')) return; // Exit if no split text elements found

    let linesElement = scope.querySelectorAll('[data-split="lines"]');

    linesElement.forEach(target => {
        let splitInstance = new SplitText(target, {
            type: "lines",
            mask: "lines",
            linesClass: "line",
        });
    });




    const richTextBlocks = scope.querySelectorAll('[data-split="rich"]');

    richTextBlocks.forEach(block => {
        const paragraphs = Array.from(block.children);

        paragraphs.forEach(p => {


            new SplitText(p, {
                type: "lines",
                mask: "lines",
                linesClass: "line",
            });

        });
    });
}

function initScrollToTop() {

    const wrappers = document.querySelectorAll('.page-wrapper');
    let scope = wrappers[0];

    const buttons = scope.querySelectorAll('.back-to-top');
    if (buttons.length == 0) return; // Exit if no scroll to top buttons found

    buttons.forEach(button => {
        button.addEventListener('click', () => {
            window.lenis.scrollTo(0, {
                duration: 3,
                ease: "easeOutQuad",
            });
        });
    });
}

function initOpenVerticalModal() {
    const wrappers = document.querySelectorAll('.page-wrapper');

    let scope = wrappers[0];
    if (!scope.querySelector('.modal-vertical-container')) return; // Exit if no vertical modal found

    const openButtons = scope.querySelectorAll('[data-modal-vertical-open]');
    const modal = scope.querySelector('.modal-vertical-container');
    const closeButtons = scope.querySelectorAll('[data-modal-vertical-close]');

    const dateElements = scope.querySelectorAll('.date');

    dateElements.forEach(element => {
        const dateString = element.textContent.trim(); // remove extra spaces

        // Skip if empty
        if (!dateString) return;

        const date = new Date(dateString);

        // Skip if date is invalid
        if (isNaN(date)) return;

        const formattedDate = date.toLocaleDateString('de-CH', {
            day: '2-digit',
            month: 'long',
            year: 'numeric'
        });

        element.textContent = formattedDate;
    });

    gsap.set(modal.querySelector(".modal-vertical-content-inner"), {
        clipPath: "inset(100% 0 0 0)",
    })

    gsap.set(modal.querySelector(".modal-vertical-container .modal-backdrop"), {
        autoAlpha: 0,
    })


    gsap.set(modal.querySelector(".modal-vertical-container .modal-close-btn"), {
        yPercent: 200,
        autoAlpha: 0,
        // rotate: 180,
    })

    const duration = .7;
    const ease = "easeOutQuart";
    let openTl, closeTl;
    openButtons.forEach(button => {
        button.addEventListener('click', () => {
            const dynItem = button.closest('.w-dyn-item'); // outer wrapper
            if (!dynItem) return;
            const attr = button.getAttribute("data-modal-vertical-open")
            let modal;
            console.log(attr);
            if (attr == "news") {
                modal = scope.querySelector('.modal-vertical-container[data-type="news"]');
            } else {
                modal = dynItem.querySelector('.modal-vertical-container');
            }


            if (!modal) return;
            modal.querySelector('.modal-v-right-wrapper').scrollTop = 0;

            window.lenis.destroy();
            closeTl?.kill(); // Kill the close timeline if it exists
            openTl = gsap.timeline({
                defaults: {
                    duration: duration,
                    ease: ease,
                }
            })
                .set(modal, {
                    autoAlpha: 1,
                    pointerEvents: 'auto',
                })
                .set(modal.querySelectorAll(".modal-vertical-content-inner .line"), {
                    yPercent: 100,
                })
                .set(modal.querySelector(".modal-vertical-container .modal-v-img-c"), {
                    autoAlpha: 0,

                })

                .set(modal.querySelector(".modal-backdrop"), {
                    autoAlpha: 0,

                }, 0)


                // .set(".modal-vertical-content-bg", {
                //     yPercent: 100,
                // })
                .set(modal.querySelector(".modal-vertical-content-inner"), {
                    clipPath: "inset(100% 0 0 0)",
                })

                .set(modal.querySelector(".modal-close-btn"), {
                    // rotate: 0,
                    // autoAlpha: 0,
                    yPercent: 200,
                })
                // .to(modal.querySelector(".modal-vertical-content-bg"), {
                //     yPercent: 0,
                //     duration: duration - .1,
                // }, 0)
                .to(modal.querySelector(".modal-vertical-content-inner"), {
                    clipPath: "inset(0% 0 0 0)",
                    duration: duration,
                }, 0)
                .to(modal.querySelector(".modal-v-img-c"), {
                    autoAlpha: 1,
                    ease: ease,
                    duration: duration,
                }, window.innerWidth < 768 ? 0.2 : 0)

                .to(modal.querySelectorAll(".modal-vertical-content-inner .line"), {
                    yPercent: 0,
                    ease: ease,
                    duration: duration + .2,
                    stagger: 0.05,
                }, 0.4)

                .to(modal.querySelector(".modal-backdrop"), {
                    autoAlpha: 1,
                    ease: ease,
                    duration: duration,
                }, 0)

                .to(modal.querySelector(".modal-close-btn"), {
                    yPercent: 0,
                    rotate: 0,

                    ease: ease,

                    onStart: (e) => {
                        gsap.set(modal.querySelector(".modal-close-btn"), {
                            autoAlpha: 1,
                        })

                    }
                }, 0.5)
                .to(modal.querySelector(".modal-close-btn"), {
                    yPercent: 0,
                    rotate: 0,

                    ease: ease,

                    onStart: (e) => {
                        gsap.set(modal.querySelector(".modal-close-btn"), {
                            autoAlpha: 1,
                        })

                    }
                }, 0.5)
        });
    });

    closeButtons.forEach(button => {
        button.addEventListener('click', () => {

            const dynItem = button.closest('.w-dyn-item'); // outer wrapper
            if (!dynItem) return;

            const modal = dynItem.querySelector('.modal-vertical-container');
            if (!modal) return;

            openTl?.kill(); // Kill the open timeline if it exists

            initLenis();
            closeTl = gsap.timeline({
                defaults: {
                    duration: duration,
                    ease: ease,
                },

            })
                .set(modal, {
                    pointerEvents: 'none',
                })
                .to(modal.querySelector(".modal-vertical-content-inner"), {
                    clipPath: "inset(100% 0 0 0)",
                    ease: ease,
                    duration: duration,

                }, 0)

                .to(modal.querySelector(".modal-backdrop"), {
                    autoAlpha: 0,
                    ease: ease,
                    duration: duration,
                }, 0)

                // .to(modal.querySelector(".modal-vertical-content-bg"), {
                //     yPercent: 100,
                //     ease: ease,
                //     duration: duration - .5,
                // }, 0)

                .to(modal.querySelector(".modal-close-btn"), {
                    autoAlpha: 0,
                    ease: ease,
                }, 0)
        });
    })

    document.addEventListener('keydown', (event) => {
        if (event.key === 'Escape') {
            const openModal = scope.querySelector('.modal-vertical-container[style*="pointer-events: auto"]');
            if (openModal) {
                const closeBtn = openModal.querySelector('.modal-close-btn');
                if (closeBtn) {
                    closeBtn.click();
                }
            }
        }
    });
}

function initHorizontalModal() {
    const wrappers = document.querySelectorAll('.page-wrapper');

    let scope = wrappers[0];
    if (!scope.querySelector('.modal-horizontal-container')) return; // Exit if no horizontal modal found
    const openButtons = scope.querySelectorAll('[data-modal-horizontal-open]');

    const closeButtons = scope.querySelectorAll('[data-modal-horizontal-close]');

    const titles = scope.querySelectorAll('.modal-h-big-title');
    titles.forEach(title => {
        if (title) {
            const text = title.textContent.trim();

            // Match the first sentence (up to first period, exclamation mark or question mark)
            const firstSentence = text.match(/.*?[.!?](\s|$)/);

            if (firstSentence) {
                title.textContent = firstSentence[0].trim();

            }
        }
    })
    const modals = scope.querySelectorAll('.modal-horizontal-container');

    modals.forEach((el, i) => {
        const number = `(${String(i + 1).padStart(2, '0')})`;
        el.querySelector(".modal-h-number").textContent = number;
    });

    let mm = gsap.matchMedia();

    let openTl, closeTl;
    openButtons.forEach(button => {
        button.addEventListener('click', () => {


            const dynItem = button.closest('.w-dyn-item'); // outer wrapper
            if (!dynItem) return;

            const modal = dynItem.querySelector('.modal-horizontal-container');
            if (!modal) return;
            modal.querySelector('.modal-h-scroll-wrapper').scrollTop = 0;
            closeTl?.kill(); // Kill the close timeline if it exists

            openTl = gsap.timeline({ defaults: { duration: 1.2, ease: "easeOutQuart" } });

            openTl.set(modal, {
                autoAlpha: 1,
                pointerEvents: 'auto',
            });



            if (window.innerWidth >= 768) {
                openTl
                    .set(modal.querySelector(".modal-horizontal-content-inner"), {
                        clipPath: "inset(0% 0% 0% 100%)",
                    }, 0)
                    .set(modal.querySelector(".modal-close-btn"), {
                        rotate: 90,
                        autoAlpha: 0,
                        xPercent: 200,
                        yPercent: -50,
                    }, 0)
                    .to(modal.querySelector(".modal-close-btn"), {
                        xPercent: 0,
                        rotate: 0,
                        autoAlpha: 1,
                        duration: .7
                    }, 0.5);

            } else {

                openTl.set(modal.querySelector(".modal-horizontal-content-inner"), {
                    clipPath: "inset(100% 0 0 0)",

                })

                    .set(modal.querySelector(".modal-close-btn"), {
                        rotate: 90,
                        autoAlpha: 0,
                        yPercent: 200,
                    }, 0)

                    .to(modal.querySelector(".modal-close-btn"), {
                        yPercent: 0,
                        rotate: 0,
                        autoAlpha: 1,
                        duration: .7
                    }, 0.5)
            }


            openTl.set(modal.querySelector(".modal-backdrop"), {
                autoAlpha: 0,
            }, 0)
                .set(modal.querySelectorAll(".modal-horizontal-content-inner .line"), {
                    yPercent: 101,
                }, 0)
                .set(modal.querySelector(".modal-h-img-wrapper"), {
                    autoAlpha: 0,

                }, 0)


                .set(modal.querySelector(".decoration-line"), {
                    scaleX: 0,
                    transformOrigin: "right center",
                }, 0)

                .to(modal.querySelector(".modal-horizontal-content-inner"), {
                    clipPath: "inset(0% 0% 0% 0%)",
                    duration: .7
                }, 0)



                .to(modal.querySelector(".modal-h-img-wrapper"), {
                    autoAlpha: 1,

                }, .2)

                .to(modal.querySelectorAll(".modal-horizontal-content-inner .line"), {
                    yPercent: 0,
                    stagger: 0.03,
                }, 0.3)

                .to(modal.querySelector(".modal-backdrop"), {
                    autoAlpha: 1,
                }, 0)


                .to(modal.querySelector(".decoration-line"), {
                    scaleX: 1,

                }, 0.2)

        });
    });

    closeButtons.forEach(button => {
        button.addEventListener('click', () => {

            const dynItem = button.closest('.w-dyn-item'); // outer wrapper
            if (!dynItem) return;

            const modal = dynItem.querySelector('.modal-horizontal-container');
            if (!modal) return;

            openTl?.kill(); // Kill the open timeline if it exists
            closeTl = gsap.timeline({
                defaults: {
                    duration: 1,
                    ease: "easeOutQuart",
                },

            })
                .set(modal, {
                    pointerEvents: 'none',
                })

            mm.add("(min-width: 768px)", () => {
                closeTl.to(modal.querySelector(".modal-horizontal-content-inner"), {
                    clipPath: "inset(0% 0% 0% 100%)",
                }, 0)



            })

            mm.add("(max-width: 767px)", () => {
                closeTl.to(modal.querySelector(".modal-horizontal-content-inner"), {
                    clipPath: "inset(100% 0% 0% 0%)",
                }, 0)


            })

            closeTl.to(modal.querySelector(".modal-backdrop"), {
                autoAlpha: 0,
            }, 0)
                .to(modal.querySelector(".modal-close-btn"), {
                    rotate: 0,
                    autoAlpha: 0,
                    duration: .7
                }, 0)

        });
    })

    document.addEventListener('keydown', (event) => {
        if (event.key === 'Escape') {
            const openModal = scope.querySelector('.modal-horizontal-container[style*="pointer-events: auto"]');
            if (openModal) {
                const closeBtn = openModal.querySelector('.modal-close-btn');
                if (closeBtn) {
                    closeBtn.click();
                }
            }
        }
    });

}

function initHeaderLogo() {
    const wrappers = document.querySelectorAll('.page-wrapper');

    let scope = wrappers[0];
    if (!scope.querySelector('.header-logo')) return; // Exit if no hero section found
    ScrollTrigger.create({
        trigger: scope.querySelector(".section"),
        start: 'top+=50 top',
        // markers: true,
        onLeaveBack: () => {
            gsap.to(scope.querySelector('.header-logo'), {
                scale: 1,
                ease: "easeOutQuad",
                duration: .7
            });
        },
        onEnter: () => {
            gsap.to(scope.querySelector('.header-logo'), {
                scale: .6,
                transformOrigin: 'top left',
                ease: "easeOutQuad",
                duration: .7
            })
        }
    })

}

function initCheckSectionThemeScroll() {
    const wrappers = document.querySelectorAll('.page-wrapper');

    let scope = wrappers[0];
    // Get detection offset, in this case the navbar
    const navBarHeight = scope.querySelector("[data-nav-bar-height]")
    const themeObserverOffset = navBarHeight ? navBarHeight.offsetHeight / 2 : 50;

    function checkThemeSection() {



        const themeSections = scope.querySelectorAll("[data-theme-section]");

        themeSections.forEach(function (themeSection) {
            const rect = themeSection.getBoundingClientRect();
            const themeSectionTop = rect.top;

            const themeSectionBottom = rect.bottom;

            // If the offset is between the top & bottom of the current section
            if (themeSectionTop <= themeObserverOffset && themeSectionBottom >= themeObserverOffset) {
                // Check [data-theme-section]
                const themeSectionActive = themeSection.getAttribute("data-theme-section");



                if (scope.getAttribute("data-theme-nav") !== themeSectionActive) {
                    scope.setAttribute("data-theme-nav", themeSectionActive);
                }

                // Check [data-bg-section]
                // const bgSectionActive = themeSection.getAttribute("data-bg-section");
                // scope.parentElement.querySelectorAll("[data-bg-nav]").forEach(function (elem) {
                //     if (elem.getAttribute("data-bg-nav") !== bgSectionActive) {
                //         elem.setAttribute("data-bg-nav", bgSectionActive);
                //     }
                // });
            }
        });
    }

    function startThemeCheck() {

        scope.addEventListener("scroll", checkThemeSection);
    }

    // Initial check and start listening for scroll
    checkThemeSection();
    startThemeCheck();
}

function initStandorteKontakt() {
    const wrappers = document.querySelectorAll('.page-wrapper');

    let scope = wrappers[0];
    if (!scope.querySelector('.button-standort')) return; // Exit if no Standort buttons found
    const buttons = scope.querySelectorAll('.button-standort');

    if (buttons.length == 0) return;
    const firstBtn = scope.querySelector('.button-standort');

    const anreiseButtons = scope.querySelectorAll('.button-anreise');
    let navProgress = scope.querySelector('.button-standort-list');
    // Create or select the moving indicator
    let indicator = navProgress.querySelector('.progress-nav__indicator');
    if (!indicator) {
        indicator = document.createElement('div');
        indicator.className = 'progress-nav__indicator';
        navProgress.appendChild(indicator);
    }

    updateIndicator(firstBtn); // Initialize indicator position

    // Function to update the indicator based on the active nav link
    function updateIndicator(activeLink) {
        let parentWidth = navProgress.offsetWidth;
        let parentHeight = navProgress.offsetHeight;

        // Get the active link's position relative to the parent
        let parentRect = navProgress.getBoundingClientRect();
        let linkRect = activeLink.getBoundingClientRect();
        let linkPos = {
            left: linkRect.left - parentRect.left,
            top: linkRect.top - parentRect.top
        };

        let linkWidth = activeLink.offsetWidth;
        let linkHeight = activeLink.offsetHeight;

        // Calculate percentage values relative to parent dimensions
        let leftPercent = (linkPos.left / parentWidth) * 100;
        let topPercent = (linkPos.top / parentHeight) * 100;
        let widthPercent = (linkWidth / parentWidth) * 100;
        let heightPercent = (linkHeight / parentHeight) * 100;

        // Update the indicator with a smooth CSS transition (set in your CSS)
        indicator.style.left = leftPercent + '%';
        indicator.style.top = topPercent + '%';
        indicator.style.width = widthPercent + '%';
        indicator.style.height = heightPercent + '%';
    }

    anreiseButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            btn.parentElement.classList.toggle('active');

        })
    })
    if (firstBtn) {
        firstBtn.classList.add('active');
    }

    const activeElements = scope.querySelectorAll("[data-location]:first-child");

    activeElements.forEach(el => {
        el.classList.add('active');
    })


    // new LazyLoad({
    //     elements_selector: ".col-maps iframe",
    //     container: scope,
    //     treshold: 1200
    // })


    ScrollTrigger.create({
        trigger: '.section.is--map', // change to your section selector
        start: 'top bottom',
        once: true,
        onEnter: () => {
            document.querySelectorAll('.col-maps .maps-inner-wrapper').forEach(iframeContainer => {
                const src = iframeContainer.getAttribute('data-src'); // Get the data-src attribute
                const iframe = document.createElement('iframe');
                iframe.src = src;
                // Optionally, set other attributes for styling or security
                iframe.width = "100%";
                iframe.height = "100%";
                iframe.style.border = "none";
                // Append the iframe to the container
                iframeContainer.appendChild(iframe);
            });
        }
    });


    buttons.forEach(btn => {
        btn.addEventListener('click', () => {
            const location = btn.innerHTML;
            if (btn.classList.contains('active')) return; // Exit if already active
            scope.querySelectorAll('.button-standort').forEach(el => {
                el.classList.remove('active');
            }

            );

            updateIndicator(btn);
            btn.classList.add('active');

            anreiseButtons.forEach(btn => {
                btn.parentElement.classList.remove('active');
            })
            // gsap.set("[data-location].active", {
            //     clipPath: "inset(0% 100% 0% 0%)",
            // })
            gsap.set(`[data-location="${location}"]`, {
                clipPath: "inset(0% 100% 0% 0%)",
            })
            gsap.set("[data-location].active", {
                clipPath: "inset(0% 0% 0% 0%)",

            })
            gsap.fromTo("[data-location].active", {
                clipPath: "inset(0% 0% 0% 0%)",

            }, {
                clipPath: "inset(0% 0% 0% 100%)",
                ease: "easeOutQuart",
                duration: 1,

            })
            gsap.fromTo(`[data-location="${location}"]`, {
                clipPath: "inset(0% 100% 0% 0%)",
            }, {
                clipPath: "inset(0% 0% 0% 0%)",
                ease: "easeOutQuart",
                duration: 1,
            })

            scope.querySelectorAll(`[data-location]`).forEach(el => {
                el.classList.remove('active');
            });
            scope.querySelectorAll(`[data-location="${location}"`).forEach(el => {


                el.classList.add('active');
            });



            //   // Deactivate all
            // document.querySelectorAll('[data-location]').forEach(el => {
            //     gsap.set(el, {
            //         // zIndex: 0,
            //         autoAlpha: 0
            //     });
            //     el.classList.remove('active');
            // });

            // // Activate matched image and text
            // const img = document.querySelector(`.standorte-list-item[data-location="${location}"]`);
            // const text = document.querySelector(`.map-upper-wrapper[data-location="${location}"]`);

            // if (img && text) {
            //     img.classList.add('active');
            //     text.classList.add('active');

            //     gsap.set([img, text], {
            //         autoAlpha: 1,
            //         // zIndex: 1,
            //     });
            // }
        });
    });

}

function initHeroAnimations(delay, hash) {
    const wrappers = document.querySelectorAll('.page-wrapper');

    let scope = wrappers[0];

    const tl = gsap.timeline({
        defaults: {
            duration: 1.2,
            ease: "easeOutQuart",
        },
    });
    tl.from(scope.querySelectorAll(".section.hero-section h1 .line, .section.hero-section .hero-lower-wrapper-inner .line, .container.is--kontakt .line, .container.is--natur .line, .section.is--legal .line"), {
        yPercent: 100,
        delay: delay,
        stagger: 0.05,
    }, .6)
        .from(scope.querySelectorAll(".section.hero-section .hero-section-img"), {
            scale: 1.1,
            duration: 2.5,
            ease: "easeInOutQuart",
            delay: delay - 0.5
        }, 0)
        .from(scope.querySelectorAll(".section.hero-section .kontakt-row"), {
            opacity: 0,
            y: 50,
            delay: delay,
            stagger: 0.15,
        }, 0.5)
        .from(scope.querySelector(".section.hero-section .hero-section-small-img"), {
            // opacity: 0,
            // y: 50,
            scale: 1.1,
            ease: "easeInOutQuart",
            delay: delay - .3,
            duration: 2,
        }, 0)
        .from(scope.querySelector(".section.hero-section .news-block"), {
            opacity: 0,
            y: 50,
            delay: delay,
        }, 0.7)
    if (hash) {
        tl.from(scope.querySelectorAll(".section.is--pricing .big-title-style .line"), {
            yPercent: 100,
            delay: delay,
            stagger: 0.15,
            onStart: () => {

                scope.querySelector(".pricing-img-wrapper video")?.play();

            }
        }, 0.5)
    }
    tl.from(scope.querySelectorAll(".section.is--pricing .pricing-right-wrapper > *"), {
        opacity: 0,
        y: 50,
        delay: delay,
        stagger: 0.15,
    }, 0.6)

    tl.from(scope.querySelectorAll(".section.is--pricing .pricing-container img"), {
        scale: 1.1,
        ease: "easeInOutQuart",
        duration: 2,
        delay: delay - 0.5,
    }, 0.2)

    // gsap.from(scope.querySelectorAll('.hero-title'), {
    // }
}

function initHomePageAnimation() {
    const wrappers = document.querySelectorAll('.page-wrapper');

    let scope = wrappers[0];
    let mm = gsap.matchMedia();
    mm.add("(min-width: 768px)", () => {

        const tl = gsap.timeline({
            scrollTrigger: {
                trigger: scope.querySelector('.container.is--hero'),
                start: 'top top',
                end: 'bottom top',
                scrub: 0,
                // markers: true,
            },

        })


        tl
            .to(scope.querySelector('[data-anim="slow-down-scroll"]'), {
                yPercent: 50,
                ease: "none",
                // onStart: () => {
                //     gsap.set(scope.querySelector('[data-anim="slow-down-scroll"]'), {
                //         backgroundColor: 'var(--dark)',
                //     })
                // },

            })

            .to(scope.querySelectorAll('[data-anim="slow-down-scroll"] .container.is--hero h1, [data-anim="slow-down-scroll"] .hero-section-img'), {
                opacity: 0,
                ease: "power1.in",
            }, 0)

    })
}

function initAppearEffects(delay = 0) {
    const wrappers = document.querySelectorAll('.page-wrapper');

    let scope = wrappers[0];

    document.querySelectorAll('[data-anim="mask-up"]').forEach((el) => {
        const wrapper = document.createElement("div");
        wrapper.style.overflow = "hidden";
        wrapper.classList.add("mask-up-wrapper");

        el.parentNode.insertBefore(wrapper, el);
        wrapper.appendChild(el);
    });

    // STEP 2: Animate inside lines
    document.querySelectorAll('[data-anim="mask-up"]').forEach((el) => {
        gsap.from(el, {
            yPercent: 100,
            duration: 1.2,
            ease: "easeOutQuart",

            scrollTrigger: {
                trigger: el,
                start: "top 85%",
            }

        });
    });


    let upAnimations = scope.querySelectorAll('[data-anim="lines-up"]');


    // let opacityAnimations = document.querySelectorAll('[data-anim="opacity"]');
    // opacityAnimations.forEach((el) => {
    //     gsap.from(el, {
    //         opacity: 0,
    //         yPercent: 10,
    //         duration: 1.5,
    //         ease: "easeOutQuart",
    //         scrollTrigger: {
    //             trigger: el,
    //             start: "top 85%",
    //         }
    //     })
    // })
    // console.log(upAnimations);

    upAnimations.forEach((el) => {
        gsap.from(el.querySelectorAll(".line"), {
            y: "100%",
            stagger: 0.05,
            duration: 1.2,
            ease: "easeOutQuart",

            scrollTrigger: {
                trigger: el,
                start: "top 85%",
            }
        })

    })
}
function initPreloader() {


    // let spanPreload = document.querySelector(".span-preload");
    // spanPreload.textContent = '0';
    // gsap.to({ val: 0 }, {
    //     val: 100,
    //     duration: 1,
    //     ease: "easeOutQuart",
    //     onUpdate: function () {
    //         spanPreload.textContent = Math.round(this.targets()[0].val) + '';
    //     }
    // });

    let mm = gsap.matchMedia();
    gsap.set(".preload-inner svg", {
        overflow: "visible",
    })
    const tl = gsap.timeline({
        defaults: {
            duration: 1.8,
            ease: "easeOutQuart",
        },
    });
    tl.from(".preloader-line1", {
        transformOrigin: "bottom",
        scaleY: 0,
        delay: 0.2,
    })
        // .to(".preload-inner", {
        //     x: "1rem",
        // }, 0)
        .fromTo(".preload-inner svg path", {
            x: -90,

        }, {
            x: 40,
            stagger: 0.04,

        }, "<=+.2")



        // .fromTo(".preload-inner svg path:not(:first-child)", {
        //     x: () => gsap.utils.random(-100, 100),
        //     y: () => gsap.utils.random(-100, 100),
        //     opacity: 0,
        // }, {
        //     x: -40,
        //     y: 0,
        //     opacity: 1,
        //     stagger: 0.03,
        // }, "<=+.2")


        .fromTo(".preloader-text-wrapper span", {
            x: 135,

        }, {
            x: -24,
            stagger: .05,
        }, .2)
    mm.add("(min-width: 768px)", () => {
        tl.to(".preload-svg-wrapper > *", {
            y: -100,
            duration: 1.1,
            // opacity: 0,
            ease: "easeInOutQuart",
        }, "<=+1.8")

    })
    mm.add("(max-width: 767px)", () => {

        tl.to(".preload-svg-wrapper > *", {
            y: -100,
            duration: 1.1,
            // opacity: 0,
            ease: "easeInOutQuart",
        }, "<=+2")

    })
    // .to(".preload-wrapper .span-preload, .preload-wrapper svg", {
    //     yPercent: -100,
    //     duration: 1.2,
    //     opacity: 0,
    // }, "<=+1.8")

    // .to(".preloader-line-wrapper", {
    //     scaleY: 0,
    //     transformOrigin: "top",
    //     duration: 1.2,
    //     opacity: 0,
    // }, "<")

    //go back


    // .to(".preload-inner svg path", {
    //     x: -90,
    //     duration: .9
    // }, "+=.25")

    // .to(".preloader-text-wrapper span", {
    //     x: 110,
    //     duration: .9
    // }, "<")
    // .to(".preloader-line-wrapper", {
    //     scaleY: 0,
    //     transformOrigin: "top",
    //     duration: .9
    // }, "<=+.4")
    // .to(".preloader-line1", {
    //     scaleY: 0,
    //     transformOrigin: "bottom",
    //     duration: .8
    // }, "<=+.4")

    // .to(".preloader-line", {

    //     scaleY: 0,
    //     transformOrigin: "top",

    // })

    // gsap.from(".svg-preload path:not(.bigpath)", {
    //     x: () => gsap.utils.random(-100, 100),
    //     y: () => gsap.utils.random(-100, 100),
    //     opacity: 0,
    //     ease: "easeOutQuart",
    //     duration: 1.2,
    //     stagger: 0.08
    // });

    // // Animate the glass path only with fade
    // gsap.from(".svg-preload .bigpath", {
    //     opacity: 0,
    //     duration: 1.2,
    //     ease: "easeOutQuart",
    //     delay: 0.2
    // });
    setTimeout(() => {
        document.body.setAttribute('data-loaded', 'true');

        // gsap.to(".span-preload", {
        //     yPercent: -100,
        //     ease: "easeInOutQuart",
        //     duration: 1.4,
        //     delay: 0,
        //     onStart: () => {
        //         gsap.set(".preload-inner-white", {
        //             backgroundColor: 'var(--light)',
        //         })
        //     }
        // })
        // gsap.to(".svg-preload", {
        //     yPercent: -60,
        //     ease: "easeInOutQuart",
        //     duration: 1.4,
        //     delay: 0.2
        // })
    },
        // 1700
        0
    );
}

function initCustomLazyLoad() {

    const wrappers = document.querySelectorAll('.page-wrapper');

    let scope = wrappers[0];

    const lazyImages = scope.querySelectorAll('[data-img="lazy"]');


    lazyImages.forEach(img => {

        // Backup src/srcset
        img.dataset.src = img.src;
        img.dataset.srcset = img.srcset;

        // Replace with dummy
        img.removeAttribute('src');
        img.removeAttribute('srcset');

        img.removeAttribute('loading');

    }
    );


    // Now pass only safe images to LazyLoad
    new LazyLoad({
        container: scope,
        threshold: 800,

    }, lazyImages);

    if (scope.querySelector(".lazy-video")) {
        const lazyLoadInstance = new LazyLoad({
            container: scope,
            elements_selector: ".lazy-video",
            callback_loaded: (el) => {
                console.log("Video lazy-loaded:", el);
            }
        });


        window.addEventListener("touchstart", () => {
            scope.querySelector(".lazy-video").play();
        }, { once: true });


        ScrollTrigger.create({
            trigger: scope.querySelector(".lazy-video"),
            start: "top bottom",
            end: "bottom top",
            onEnter: (self) => {
                self.trigger.play();
            },
            onLeave: (self) => {
                self.trigger.pause();
            },
            onEnterBack: (self) => {
                self.trigger.play();
            },
            onLeaveBack: (self) => {
                self.trigger.pause();
            }
        });
    }






}



function initScripts(delay, hash) {
    // document.body.setAttribute('data-loaded', 'true');

    gsap.set("body", {
        autoAlpha: 1,
    })

    // Animate all elements with class 'animate-percentage' from 0% to 100% in 1 second using GSAP
    // Start at 0

    initPreloader();
    initLenis();
    let mm = gsap.matchMedia();
    mm.add("(min-width: 768px)", () => {
        initDetectScrollingDirection();
    });
    initAccordionCSS();
    initTeamImagePin();
    initMarqueeImageLoaded();
    initNavigation();
    initHeaderLogo();
    initCheckSectionThemeScroll();
    initStandorteKontakt();


    initOpenVerticalModal();
    initHorizontalModal();


    initHomePageAnimation();
    initScrollToTop();
    initCustomLazyLoad();

    document.fonts.ready.then(() => {
        initSplitText();
        initAppearEffects(delay);
        initHeroAnimations(delay, hash);
    })
}
// Initialize Accordion CSS
document.addEventListener('DOMContentLoaded', () => {
    gsap.registerPlugin(ScrollTrigger, CustomEase);
    ScrollTrigger.defaults({
        scroller: "#swup",
    });
    CustomEase.create("easeOutQuad", "0.25,0.46,0.45,0.94");
    CustomEase.create("easeOutQuart", ".165, .84, .44, 1");
    CustomEase.create("easeInOutQuad", ".455, .03, .515, .955");
    CustomEase.create("easeInOutQuart", ".77, 0, .175, 1");
    CustomEase.create("easeInOutQuint", ".86, 0, .07, 1");
    CustomEase.create("wshanim", ".85, 0, 0.03, 1");

    const swup = new Swup({
        plugins: [new SwupParallelPlugin(), new SwupPreloadPlugin(), new SwupDebugPlugin()],
        animateHistoryBrowsing: true,
    });



    // initScripts(2.4);
    initScripts(0);

    swup.hooks.on('page:view', (visit) => {
        initScripts(.75, visit.to.hash);
    });

    swup.hooks.on("link:self", (event) => {
        window.lenis.scrollTo(0, {
            duration: 3,
            ease: "easeOutQuad",
        });
    });


});
