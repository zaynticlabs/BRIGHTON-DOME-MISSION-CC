/* script.js */

document.addEventListener('DOMContentLoaded', () => {

    /* =========================================================
       1. THEME TOGGLE
    ========================================================= */
    const root = document.documentElement;
    const themeBtn = document.getElementById('theme-toggle');
    const mobileThemeBtn = document.getElementById('mobile-theme-toggle');

    // Retrieve from local storage or default to dark
    let currentTheme = localStorage.getItem('domemission-theme') || 'dark';

    function applyTheme(theme) {
        root.setAttribute('data-theme', theme);
        localStorage.setItem('domemission-theme', theme);
        currentTheme = theme;
    }

    // Apply on load
    applyTheme(currentTheme);

    function toggleTheme() {
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        applyTheme(newTheme);
    }

    [themeBtn, mobileThemeBtn].forEach(btn => {
        if (btn) btn.addEventListener('click', toggleTheme);
    });

    /* =========================================================
       2. NAVIGATION / HEADER SCROLL
    ========================================================= */
    const navbar = document.querySelector('.navbar');
    const fabBtn = document.getElementById('fabBtn');
    const backToTop = document.getElementById('backToTop');

    window.addEventListener('scroll', () => {
        if (window.scrollY > 80) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }

        // FAB and Back To Top visibility
        if (window.scrollY > 300) {
            if (fabBtn) fabBtn.classList.add('visible');
            if (backToTop) backToTop.classList.add('visible');
        } else {
            if (fabBtn) fabBtn.classList.remove('visible');
            if (backToTop) backToTop.classList.remove('visible');
        }
    });

    if (backToTop) {
        backToTop.addEventListener('click', () => {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    }

    /* =========================================================
       HMABURGER MOBILE MENU
    ========================================================= */
    const hamburger = document.querySelector('.hamburger');
    const mobileMenu = document.querySelector('.mobile-menu');
    const mobileLinksContainer = document.querySelector('.mobile-links');
    const desktopLinks = document.querySelector('.nav-links');

    if (desktopLinks && mobileLinksContainer) {
        mobileLinksContainer.innerHTML = desktopLinks.innerHTML;

        const allMobileLinks = mobileLinksContainer.querySelectorAll('a');
        allMobileLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                const href = link.getAttribute('href');
                const isAnchor = href && href.startsWith('#');
                const isDropdownParent = link.parentElement.classList.contains('dropdown-parent');

                // If it's a dropdown parent on mobile, toggle it
                if (isDropdownParent && link.nextElementSibling?.classList.contains('dropdown')) {
                    const dropdown = link.nextElementSibling;
                    const isActive = dropdown.classList.contains('active');
                    
                    // On mobile, first click opens dropdown, if it's just # or same page
                    if (window.innerWidth < 1024) {
                        if (!isActive) {
                            e.preventDefault();
                            dropdown.classList.add('active', 'mobile-dropdown');
                            return; // Don't close menu yet
                        }
                    }
                }

                // For all other cases, or second click on parent - close menu
                hamburger.classList.remove('active');
                mobileMenu.classList.remove('active');
                document.body.style.overflow = '';

                // Handle Tab switching if link has data-tab
                const tabTarget = link.getAttribute('data-tab');
                if (tabTarget && isAnchor) {
                    const sectionId = href.substring(1);
                    const section = document.getElementById(sectionId);
                    if (section) {
                        const btn = section.querySelector(`.tab-btn[data-target="${tabTarget}"]`);
                        if (btn) {
                            // Small delay ensures the menu starts closing before tab switches
                            setTimeout(() => {
                                btn.click();
                            }, 150);
                        }
                    }
                }

                // If it's an anchor, handle smooth scroll with offset
                if (isAnchor && href !== '#') {
                    e.preventDefault();
                    const target = document.querySelector(href);
                    if (target) {
                        const offset = 80;
                        const bodyRect = document.body.getBoundingClientRect().top;
                        const elementRect = target.getBoundingClientRect().top;
                        const elementPosition = elementRect - bodyRect;
                        const offsetPosition = elementPosition - offset;

                        window.scrollTo({
                            top: offsetPosition,
                            behavior: 'smooth'
                        });
                    }
                }
            });
        });
    }

    if (hamburger) {
        hamburger.addEventListener('click', () => {
            hamburger.classList.toggle('active');
            mobileMenu.classList.toggle('active');
            document.body.style.overflow = mobileMenu.classList.contains('active') ? 'hidden' : '';
        });
    }

    // Global Smooth Scroll for Desktop & General Links
    document.querySelectorAll('a[href^="#"]:not([href="#"])').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            // Only handle if not already handled by mobile logic above
            if (this.closest('.mobile-menu')) return;

            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                const offset = 80;
                const bodyRect = document.body.getBoundingClientRect().top;
                const elementRect = target.getBoundingClientRect().top;
                const elementPosition = elementRect - bodyRect;
                const offsetPosition = elementPosition - offset;

                window.scrollTo({
                    top: offsetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });

    /* =========================================================
       3. HERO TEXT ROTATOR
    ========================================================= */
    const taglines = document.querySelectorAll('.tagline');
    let currentTagline = 0;

    if (taglines.length > 0) {
        setInterval(() => {
            taglines[currentTagline].classList.remove('active');
            currentTagline = (currentTagline + 1) % taglines.length;
            taglines[currentTagline].classList.add('active');
        }, 3500);
    }

    /* =========================================================
       4. SCROLL ANIMATIONS (IntersectionObserver)
    ========================================================= */
    const scrollItems = document.querySelectorAll('.scroll-anim, .tl-item');
    const counterItems = document.querySelectorAll('.counter');
    let hasCounted = false;

    const obOptions = { threshold: 0.15, rootMargin: "0px 0px -50px 0px" };

    const observer = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');

                // Trigger counters specifically inside stats section
                if (!hasCounted && entry.target.id === 'stats') {
                    counterItems.forEach(counter => {
                        triggerCounter(counter);
                    });
                    hasCounted = true;
                }

                observer.unobserve(entry.target);
            }
        });
    }, obOptions);

    scrollItems.forEach(item => observer.observe(item));

    /* =========================================================
       5. COUNTER FUNCTION
    ========================================================= */
    function triggerCounter(counter) {
        const target = +counter.getAttribute('data-target');
        const start = +counter.getAttribute('data-start') || 0;
        const duration = 2000;
        const frameRate = 1000 / 60;
        const totalFrames = Math.round(duration / frameRate);
        const inc = (target - start) / totalFrames;

        let current = start;
        const updateCounter = () => {
            current += inc;
            if (current < target) {
                counter.innerText = Math.ceil(current);
                requestAnimationFrame(updateCounter);
            } else {
                counter.innerText = target + (counter.getAttribute('data-target') === '87' ? '+' : '');
            }
        };
        updateCounter();
    }

    /* =========================================================
       6. TABS FUNCTIONALITY
    ========================================================= */
    const initializeTabs = (container) => {
        const btns = container.querySelectorAll('.tab-btn[role="tab"]');
        const panels = container.querySelectorAll('.tab-panel[role="tabpanel"]');
        const indicator = container.querySelector('.tab-indicator');

        if (!btns.length) return;

        const updateIndicator = (btn) => {
            if (!indicator) return;
            // check if vertical
            const isVertical = container.classList.contains('vertical-look') && window.innerWidth >= 768;

            if (isVertical) {
                indicator.style.height = btn.offsetHeight + 'px';
                indicator.style.width = '3px';
                indicator.style.transform = `translateY(${btn.offsetTop}px)`;
            } else {
                indicator.style.width = btn.offsetWidth + 'px';
                indicator.style.height = '3px';
                indicator.style.transform = `translateX(${btn.offsetLeft}px)`;
            }
        };

        btns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                const target = btn.getAttribute('data-target');

                // Active classes
                btns.forEach(b => b.classList.remove('active'));
                panels.forEach(p => p.classList.remove('active'));

                btn.classList.add('active');
                document.getElementById(target).classList.add('active');

                updateIndicator(btn);
            });
        });

        // Init
        window.addEventListener('resize', () => updateIndicator(container.querySelector('.tab-btn.active')));
        // wait for font load
        setTimeout(() => updateIndicator(container.querySelector('.tab-btn.active')), 100);
    };

    document.querySelectorAll('.tabs-container').forEach(initializeTabs);

    /* Helper exposed for section links (e.g. from hero to schedule) */
    window.switchMainTab = (sectionId, tabId) => {
        document.getElementById(sectionId).scrollIntoView({ behavior: 'smooth' });
        setTimeout(() => {
            const btn = document.querySelector(`.tab-btn[data-target="${tabId}"]`);
            if (btn) btn.click();
        }, 300);
    };

    /* =========================================================
       7. NEWS FILTER
    ========================================================= */
    const filterBtns = document.querySelectorAll('.filter-btn');
    const newsGrid = document.getElementById('news-grid');

    const processNewsFilter = (category) => {
        const cards = newsGrid.querySelectorAll('.news-card');
        cards.forEach(card => {
            if (category === 'all' || card.dataset.category === category) {
                card.style.display = 'block';
                setTimeout(() => card.style.opacity = '1', 10);
            } else {
                card.style.opacity = '0';
                setTimeout(() => card.style.display = 'none', 300);
            }
        });
    };

    filterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            filterBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            processNewsFilter(btn.getAttribute('data-filter'));
        });
    });

    /* =========================================================
       8. MEDIA FOLDERS & LIGHTBOX
    ========================================================= */
    const folders = document.querySelectorAll('.folder-card');
    const galleryPanel = document.getElementById('gallery-panel');
    const galleryTitle = document.getElementById('gallery-title');
    const closeGalleryBtn = document.querySelector('.close-gallery');

    // Lightbox vars
    const lightbox = document.getElementById('lightbox');
    const lbImg = document.getElementById('lightbox-img');
    const lbCaption = document.getElementById('lightbox-caption');
    const lbClose = document.querySelector('.lightbox-close');
    const lbPrev = document.querySelector('.lightbox-prev');
    const lbNext = document.querySelector('.lightbox-next');

    let currentGalleryPhotos = [];
    let currentPhotoIndex = 0;

    // Folder Click
    folders.forEach(folder => {
        folder.addEventListener('click', () => {
            const folderId = folder.dataset.folder;
            const folderName = folder.querySelector('.folder-name').innerText;

            if (folder.classList.contains('active')) {
                // close it
                folder.classList.remove('active');
                galleryPanel.classList.remove('active');
            } else {
                folders.forEach(f => f.classList.remove('active'));
                folder.classList.add('active');

                galleryTitle.innerText = folderName;
                populateGallery(folderId);
                galleryPanel.classList.add('active');
                galleryPanel.scrollIntoView({ behavior: 'smooth', block: 'end' });
            }
        });
    });

    if (closeGalleryBtn) {
        closeGalleryBtn.addEventListener('click', () => {
            folders.forEach(f => f.classList.remove('active'));
            galleryPanel.classList.remove('active');
            document.getElementById('media').scrollIntoView({ behavior: 'smooth' });
        });
    }

    const populateGallery = (folderId) => {
        const grid = document.getElementById('photo-grid');
        grid.innerHTML = '';

        let localImages = [];

        // Handle AGM specific injected imagery
        if (folderId === 'agm-2026') {
            localImages = [
                { src: 'images/AGM/Best Allrounder - Arif.jpg', alt: 'Best Allrounder - Arif' },
                { src: 'images/AGM/Best Allrounder - Hemanth.jpg', alt: 'Best Allrounder - Hemanth' },
                { src: 'images/AGM/Best Batsman - Giri.jpg', alt: 'Best Batsman - Giri' },
                { src: 'images/AGM/Best Batsman - Ollie.png', alt: 'Best Batsman - Ollie' },
                { src: 'images/AGM/Best Bowler - Srini.jpg', alt: 'Best Bowler - Srini' },
                { src: 'images/AGM/Best Bowler for Nikhil.jpg', alt: 'Best Bowler for Nikhil' },
                { src: 'images/AGM/Best Catch - Ollie.jpg', alt: 'Best Catch - Ollie' },
                { src: 'images/AGM/Best Catch award - Joshith.png', alt: 'Best Catch award - Joshith' },
                { src: 'images/AGM/Best Fielder - Amit.jpg', alt: 'Best Fielder - Amit' },
                { src: 'images/AGM/Best Fielder Award for Joe.jpg', alt: 'Best Fielder Award for Joe' },
                { src: 'images/AGM/Inspiring Batsman award for Ashu.jpg', alt: 'Inspiring Batsman award for Ashu' },
                { src: 'images/AGM/Inspiring Batsman- Sunraj.jpg', alt: 'Inspiring Batsman- Sunraj' },
                { src: 'images/AGM/Inspiring Bowler award for Aniket.jpg', alt: 'Inspiring Bowler award for Aniket' },
                { src: 'images/AGM/Inspiring Bowler- Anshul.jpg', alt: 'Inspiring Bowler- Anshul' },
                { src: 'images/AGM/Ollie.jpg', alt: 'Ollie' },
                { src: 'images/AGM/Srini.jpg', alt: 'Srini' },
                { src: 'images/AGM/Team Player of the season- Rohit Miglani.png', alt: 'Team Player of the season- Rohit Miglani' }
            ];

            localImages.forEach((imgObj, idx) => {
                const img = document.createElement('img');
                img.src = imgObj.src;
                img.alt = imgObj.alt;
                img.className = 'gallery-img';
                img.addEventListener('click', () => openActualLightbox(imgObj.src, imgObj.alt, idx, localImages));
                grid.appendChild(img);
            });
        } else {
            // For placeholder purpose, generating empty placeholders
            for (let i = 0; i < 4; i++) {
                const div = document.createElement('div');
                div.className = 'placeholder-photo gallery-item';
                div.innerHTML = `<div>📷</div><div>Photo Coming Soon</div><div style="font-size:0.7em; margin-top:5px;">${folderId}</div>`;

                // Dummy click to open lightbox
                div.addEventListener('click', () => openLightboxDummy(folderId, i));
                grid.appendChild(div);
            }
        }
    };

    // Lightbox image loading arrays handling
    function openActualLightbox(src, alt, idx, imageArray) {
        currentGalleryPhotos = imageArray;
        currentPhotoIndex = idx;

        lbImg.src = src;
        lbCaption.innerHTML = alt;
        lightbox.classList.add('active');
        document.body.style.overflow = 'hidden';
    }

    function changeLightboxPhoto(direction) {
        if (!currentGalleryPhotos || currentGalleryPhotos.length === 0) return;
        currentPhotoIndex = (currentPhotoIndex + direction + currentGalleryPhotos.length) % currentGalleryPhotos.length;
        lbImg.src = currentGalleryPhotos[currentPhotoIndex].src;
        lbCaption.innerHTML = currentGalleryPhotos[currentPhotoIndex].alt;
    }

    if (lbPrev) lbPrev.addEventListener('click', (e) => { e.stopPropagation(); changeLightboxPhoto(-1); });
    if (lbNext) lbNext.addEventListener('click', (e) => { e.stopPropagation(); changeLightboxPhoto(1); });


    // Lightbox dummy logic
    function openLightboxDummy(title, idx) {
        lbImg.src = ''; // set broken src to hide 
        lbCaption.innerHTML = `[ Placeholder Photo View: ${title} — ${idx + 1} ] <br><small>Visual Lightbox structural test</small>`;
        lightbox.classList.add('active');
        document.body.style.overflow = 'hidden';
    }

    // Actual Lightbox event setup
    if (lbClose) {
        lbClose.addEventListener('click', closeLightbox);
        lightbox.addEventListener('click', (e) => {
            if (e.target === lightbox) closeLightbox();
        });
    }

    function closeLightbox() {
        lightbox.classList.remove('active');
        document.body.style.overflow = '';
        currentGalleryPhotos = [];
    }

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && lightbox.classList.contains('active')) closeLightbox();
        if (e.key === 'ArrowLeft' && lightbox.classList.contains('active')) changeLightboxPhoto(-1);
        if (e.key === 'ArrowRight' && lightbox.classList.contains('active')) changeLightboxPhoto(1);
    });

    // Handle nav links to media folder directly
    document.querySelectorAll('.media-link').forEach(link => {
        link.addEventListener('click', (e) => {
            const folderData = link.getAttribute('data-folder');
            setTimeout(() => {
                const targetFolder = document.querySelector(`.folder-card[data-folder="${folderData}"]`);
                if (targetFolder && !targetFolder.classList.contains('active')) {
                    targetFolder.click();
                }
            }, 500);
        });
    });

    /* =========================================================
       10. POPULATE MOCK DATA (TEAMS, MATCHES, NEWS)
    ========================================================= */

    // -- FIXTURES
    const generateFixtures = (tableId, matchesArray) => {
        const tbody = document.getElementById(tableId);
        if (!tbody) return;

        matchesArray.forEach((fixture, i) => {
            const tr = document.createElement('tr');
            const hACls = fixture.isHome ? 'badge-green' : 'badge-primary';

            tr.innerHTML = `
                <td><span class="badge ${i === 0 ? 'badge-gold pulse' : 'badge-grey'}">${i === 0 ? 'NEXT • ' + fixture.date : fixture.date}</span></td>
                <td><strong>vs ${fixture.opp}</strong></td>
                <td><span class="badge ${hACls}">${fixture.isHome ? 'HOME' : 'AWAY'}</span></td>
                <td>${fixture.venue}</td>
                <td>${fixture.comp}</td>
                <td>${fixture.time}</td>
            `;
            tbody.appendChild(tr);
        });
    };

    // 1st XI Exact 2026 Fixtures
    const opps1 = [
        { date: '18 APR', opp: 'Slinfold CC (Friendly)', isHome: false, venue: 'Wicket Gardens', comp: 'Friendly', time: '13:00' },
        { date: '04 MAY', opp: 'Brighton Zalmi CC', isHome: true, venue: 'Horsdean', comp: 'T20', time: '18:00' },
        { date: '09 MAY', opp: 'Hastings & St L Priory 2', isHome: false, venue: 'Horntye Park', comp: 'League', time: '12:30' },
        { date: '16 MAY', opp: 'Chiddingly CC', isHome: true, venue: 'Horsdean', comp: 'League', time: '12:30' },
        { date: '18 MAY', opp: 'Poynings CC', isHome: false, venue: 'Poynings CC', comp: 'T20', time: '18:00' },
        { date: '23 MAY', opp: 'Crowhurst Park CC', isHome: false, venue: 'Crowhurst Park CC', comp: 'League', time: '12:30' },
        { date: '30 MAY', opp: 'Seaford CC', isHome: true, venue: 'Horsdean', comp: 'League', time: '12:30' },
        { date: '01 JUN', opp: 'Preston Park CC', isHome: true, venue: 'Horsdean', comp: 'T20', time: '18:00' },
        { date: '06 JUN', opp: 'Brighton & Hove 2', isHome: false, venue: 'Nevill Sports Ground', comp: 'League', time: '12:30' },
        { date: '13 JUN', opp: 'Herstmonceux CC', isHome: false, venue: 'Herstmonceux', comp: 'League', time: '12:30' },
        { date: '15 JUN', opp: 'St Peters Spartans', isHome: true, venue: 'Horsdean', comp: 'T20', time: '18:00' },
        { date: '20 JUN', opp: 'Isfield CC', isHome: true, venue: 'Horsdean', comp: 'League', time: '12:30' },
        { date: '27 JUN', opp: 'Portslade CC', isHome: false, venue: 'Benfield Valley Pavilion', comp: 'League', time: '12:30' },
        { date: '29 JUN', opp: 'Shoreham by Sea CC', isHome: false, venue: 'Shoreham by Sea CC', comp: 'T20', time: '18:00' },
        { date: '04 JUL', opp: 'Heathfield Park CC', isHome: true, venue: 'Horsdean', comp: 'League', time: '12:30' },
        { date: '11 JUL', opp: 'Hastings & St L Priory 2', isHome: true, venue: 'Horsdean', comp: 'League', time: '12:30' },
        { date: '18 JUL', opp: 'Chiddingly CC', isHome: false, venue: 'Chiddingly CC', comp: 'League', time: '12:30' },
        { date: '25 JUL', opp: 'Crowhurst Park CC', isHome: true, venue: 'Horsdean', comp: 'League', time: '12:30' },
        { date: '01 AUG', opp: 'Seaford CC', isHome: false, venue: 'The Salts', comp: 'League', time: '12:30' },
        { date: '08 AUG', opp: 'Brighton & Hove 2', isHome: true, venue: 'Horsdean', comp: 'League', time: '12:30' },
        { date: '15 AUG', opp: 'Herstmonceux CC', isHome: true, venue: 'Horsdean', comp: 'League', time: '12:30' },
        { date: '22 AUG', opp: 'Isfield CC', isHome: false, venue: 'The Gudges', comp: 'League', time: '12:30' },
        { date: '29 AUG', opp: 'Portslade CC', isHome: true, venue: 'Horsdean', comp: 'League', time: '12:30' },
        { date: '05 SEP', opp: 'Heathfield Park CC', isHome: false, venue: 'Heathfield Park', comp: 'League', time: '12:30' }
    ];

    // 2nd XI Exact 2026 Fixtures
    const opps2 = [
        { date: '09 MAY', opp: 'Balcombe CC 2', isHome: false, venue: 'Balcombe CC Main', comp: 'League', time: '13:00' },
        { date: '10 MAY', opp: 'Ardingly CC 1', isHome: false, venue: 'Ardingly', comp: 'T20', time: '14:00' },
        { date: '16 MAY', opp: 'Smallfield Manor 2', isHome: true, venue: 'Braypool', comp: 'League', time: '13:00' },
        { date: '23 MAY', opp: 'Mid Sussex Heathens 1', isHome: false, venue: 'Ansty North Ground', comp: 'League', time: '13:00' },
        { date: '30 MAY', opp: 'Crawley Eagles 5', isHome: true, venue: 'Braypool', comp: 'League', time: '13:00' },
        { date: '06 JUN', opp: 'Gully Cricketers 1', isHome: false, venue: 'Chailey Cricket Ground', comp: 'League', time: '13:00' },
        { date: '13 JUN', opp: 'Lindfield CC 3', isHome: true, venue: 'Braypool', comp: 'League', time: '13:00' },
        { date: '20 JUN', opp: 'Steyning CC 3', isHome: false, venue: 'Upper Beeding Recreation Ground', comp: 'League', time: '13:00' },
        { date: '27 JUN', opp: 'Ansty CC 3', isHome: true, venue: 'Braypool', comp: 'League', time: '13:00' },
        { date: '04 JUL', opp: 'Hurstpierpoint CC 2', isHome: false, venue: 'Hurstpierpoint CC', comp: 'League', time: '13:00' },
        { date: '11 JUL', opp: 'Balcombe CC 2', isHome: true, venue: 'Braypool', comp: 'League', time: '13:00' },
        { date: '18 JUL', opp: 'Smallfield Manor 2', isHome: false, venue: 'Plough Road', comp: 'League', time: '13:00' },
        { date: '25 JUL', opp: 'Mid Sussex Heathens 1', isHome: true, venue: 'Braypool', comp: 'League', time: '13:00' },
        { date: '01 AUG', opp: 'Crawley Eagles 5', isHome: false, venue: 'Bewbush Green Playing Fields', comp: 'League', time: '13:00' },
        { date: '08 AUG', opp: 'Gully Cricketers 1', isHome: true, venue: 'Braypool', comp: 'League', time: '13:00' },
        { date: '15 AUG', opp: 'Lindfield CC 3', isHome: false, venue: 'Hickmans Lane', comp: 'League', time: '13:00' },
        { date: '22 AUG', opp: 'Steyning CC 3', isHome: true, venue: 'Braypool', comp: 'League', time: '13:00' },
        { date: '29 AUG', opp: 'Ansty CC 3', isHome: false, venue: 'Ansty - North Ground', comp: 'League', time: '12:30' },
        { date: '05 SEP', opp: 'Hurstpierpoint CC 2', isHome: true, venue: 'Braypool', comp: 'League', time: '12:30' }
    ];

    generateFixtures('1st-fixtures-body', opps1);
    generateFixtures('2nd-fixtures-body', opps2);

    // -- RESULTS
    const generateResults = (containerId, resultArray) => {
        const container = document.getElementById(containerId);
        if (!container) return;

        resultArray.forEach(res => {
            const div = document.createElement('div');
            div.className = 'result-card';

            let resClass = 'result-draw';
            if (res.result.includes('WON')) resClass = 'result-won';
            if (res.result.includes('LOST')) resClass = 'result-lost';
            if (res.result.includes('Rain')) resClass = 'badge-primary'; // N/R

            div.innerHTML = `
                <div class="result-date">${res.date} • ${res.comp}</div>
                <div class="result-main">${res.score}</div>
                <div class="${resClass}">${res.result}</div>
            `;
            container.appendChild(div);
        });
    };

    generateResults('1st-results-body', opps1.map(f => ({
        date: f.date + ' 2026',
        comp: f.comp + ' (1st XI)',
        score: `Dome Mission vs ${f.opp}`,
        result: 'TBD'
    })));

    generateResults('2nd-results-body', opps2.map(f => ({
        date: f.date + ' 2026',
        comp: f.comp + ' (2nd XI)',
        score: `Dome Mission 2 vs ${f.opp}`,
        result: 'TBD'
    })));

    // -- SQUADS & OFFICIALS
    const createPlayerCard = (player) => {
        let badgeHtml = '';
        if (player.cp) badgeHtml += `<span class="badge badge-gold">C</span> `;
        if (player.t20) badgeHtml += `<span class="badge badge-primary">T20-C</span> `;
        if (player.vc) badgeHtml += `<span class="badge badge-grey">VC</span> `;

        let roleBadge = '';
        if (player.role === 'Batsman') roleBadge = 'badge-grey';
        else if (player.role === 'Bowler') roleBadge = 'badge-green';
        else if (player.role === 'All-Rounder') roleBadge = 'badge-primary';
        else roleBadge = 'badge-gold';

        // Officials variant
        const isOfficial = player.email !== undefined;
        let officialMeta = isOfficial ? `<a href="mailto:${player.email}" class="link truncate d-ib w-100" style="font-size: 0.8em">${player.email}</a>` : '';
        let officialPhone = player.phone ? `<a href="tel:${player.phone}" class="link block mt-1">📞 ${player.phone}</a>` : '';

        return `
        <div class="player-card glass-card border-focus">
            ${player.no ? `<div class="jersey-number">${player.no}</div>` : ''}
            <div class="player-avatar">
                ${player.img ? `<img src="${player.img}" alt="${player.name}" class="player-photo">` : `<div class="helmet-silhouette" ${isOfficial && player.role.includes('Hon') ? 'style="background: var(--accent-primary)"' : ''}></div>`}
            </div>
            <h4 class="player-name">${player.name}</h4>
            <div class="player-badges">
                ${badgeHtml}
                <span class="badge ${isOfficial ? player.badgeCls : roleBadge}">${player.role}</span>
            </div>
            <div class="player-meta">
                ${player.meta ? player.meta : ''}
                ${officialMeta}
                ${officialPhone}
            </div>
        </div>
        `;
    };

    const team1 = [
        { no: 1, name: 'Girija Shankar Barla', role: 'Batsman', meta: '-', img: 'images/Squad/Girija Shankar Barla.png' },
        { no: 2, name: 'Ashutosh Sharma', role: 'Batsman', meta: '-', img: 'images/Squad/Ashutosh Sharma.png' },
        { no: 3, name: 'Shahzad Afzal', role: 'All-Rounder', meta: '-', img: 'images/Squad/Shahzad Afzal.png' },
        { no: 4, name: 'Joe Gatford', role: 'Batsman', meta: '-', img: 'images/Squad/Joe Gatford.png' },
        { no: 5, name: 'Hemanth Maddela', role: 'All-Rounder', meta: '-', img: 'images/Squad/Hemanth Maddela.png' },
        { no: 6, name: 'Rohit Miglani', role: 'All-Rounder', meta: '-', img: 'images/Squad/Rohit Miglani.png' },
        { no: 7, name: 'Joshith G', role: 'Wicket-Keeper', t20: true, meta: 'Right-arm med', img: 'images/Squad/Joshith G.png' },
        { no: 8, name: 'Vikram Sharma', role: 'All-Rounder', cp: true, meta: 'RHB', img: 'images/Squad/Vikram Sharma.png' },
        { no: 9, name: 'Anshul Singh Sikarwar', role: 'Bowler', meta: '-', img: 'images/Squad/Anshul Singh Sikarwar.png' },
        { no: 10, name: 'Ankit Choudhary', role: 'Bowler', meta: '-', img: 'images/Squad/Ankit Choudhary.png' },
        { no: 11, name: 'Atish More', role: 'Batsman', meta: 'RHB', img: 'images/Squad/Atish More.png' },
        { no: 12, name: 'Venkat Kota', role: 'Bowler', meta: '-' },
        { no: 13, name: 'Karan Bhatia', role: 'All-Rounder', meta: 'RHB', img: 'images/Squad/Karan Bhatia.png' },
        { no: 14, name: 'Matthew Sanderson', role: 'All-Rounder', meta: '-', img: 'images/Squad/Matthew Sanderson.png' }
    ];

    document.getElementById('1st-squad-grid').innerHTML = team1.map(createPlayerCard).join('');

    const team2 = [
        { no: 1, name: 'Sunraj Poojary', role: 'Wicket-Keeper', meta: '-', img: 'images/Squad/Sunraj Poojary.png' },
        { no: 2, name: 'Ollie Liddiard', role: 'Batsman', meta: '-', img: 'images/Squad/Ollie Liddiard.png' },
        { no: 3, name: 'Arif Khan', role: 'All-Rounder', meta: '-', img: 'images/Squad/Arif Khan.png' },
        { no: 4, name: 'Sreejayan Thoppil', role: 'Batsman', meta: '-', img: 'images/Squad/Sreejayan Thoppil.png' },
        { no: 5, name: 'Amit Sisodia', role: 'All-Rounder', meta: '-', img: 'images/Squad/Amit Sisodia.png' },
        { no: 6, name: 'Himanshu Haldar', role: 'Player', meta: '-', img: 'images/Squad/Himanshu Haldar.png' },
        { no: 7, name: 'Aniket Kulkarni', role: 'All-Rounder', meta: '-', img: 'images/Squad/Aniket Kulkarni.png' },
        { no: 8, name: 'Pratham Bedre', role: 'Batsman', meta: '-' },
        { no: 9, name: 'Anurag Pandey', role: 'Bowler', meta: '-', img: 'images/Squad/Anurag Pandey.png' },
        { no: 10, name: 'Vidit Gupta', role: 'All-Rounder', cp: true, meta: 'RHB', img: 'images/Squad/Vidit Gupta.png' },
        { no: 11, name: 'Ranjodh Singh', role: 'Batsman', meta: '-' },
        { no: 12, name: 'Md Tusher Sarker', role: 'All-Rounder', meta: '-' },
        { no: 13, name: 'Rohit Keshri', role: 'Batsman', meta: '-' },
        { no: 14, name: 'Sumit Chaudhary', role: 'Bowler', meta: '-' },
        { no: 15, name: 'Srinivasa Gopalakrishna', role: 'Bowler', meta: '-', img: 'images/Squad/Srinivasa Gopalakrishna.png' },
        { no: 16, name: 'Wasim Warne', role: 'Bowler', meta: '-' },
        { no: 17, name: 'Rohit Gupta', role: 'Batsman', meta: '-' },
        { no: 18, name: 'Shyam Nadella', role: 'Bowler', meta: '-' },
        { no: 19, name: 'Roshan Ramakrishnan', role: 'Bowler', meta: '-' },
        { no: 20, name: 'Md Tawsif', role: 'Bowler', meta: '-' },
        { no: 21, name: 'Uttam Nakade', role: 'Bowler', meta: '-', img: 'images/Squad/Uttam Nakade.png' }
    ];

    document.getElementById('2nd-squad-grid').innerHTML = team2.map(createPlayerCard).join('');

    const officials = [
        { name: 'Atish More', role: 'Chairperson', badgeCls: 'badge-gold', email: 'atishsmore@gmail.com', phone: '07871571260', img: 'images/Squad/Atish More.png' },
        { name: 'Rohit Miglani', role: 'Club Safeguarding Officer', badgeCls: 'badge-green', email: '[Placeholder]', img: 'images/Squad/Rohit Miglani.png' },
        { name: 'Joshith G', role: 'Div Rep / Hon Sec', badgeCls: 'badge-primary', email: '[Placeholder]', phone: '07786589595', img: 'images/Squad/Joshith G.png' },
        { name: 'Rohit Miglani', role: 'Hon. Fixture Secretary', badgeCls: 'badge-primary', email: '[Placeholder]', img: 'images/Squad/Rohit Miglani.png' },
        { name: 'Karan Bhatia', role: 'Hon. Treasurer', badgeCls: 'badge-primary', email: '[Placeholder]', img: 'images/Squad/Karan Bhatia.png' },
        { name: 'Vikram Sharma', role: 'Captain — 1st XI', badgeCls: 'badge-gold', cp: true, email: 'vikraminfy@gmail.com', img: 'images/Squad/Vikram Sharma.png' },
        { name: 'Vidit Gupta', role: 'Captain — 2nd XI', badgeCls: 'badge-gold', cp: true, email: '[Placeholder]', img: 'images/Squad/Vidit Gupta.png' },
        { name: 'Hemanth Maddela', role: 'Playcricket/Spond Administrator', badgeCls: 'badge-primary', email: '[Placeholder]', img: 'images/Squad/Hemanth Maddela.png' },
        { name: 'Arif Khan', role: 'Website Administrator', badgeCls: 'badge-primary', email: '[Placeholder]', img: 'images/Squad/Arif Khan.png' }
    ];

    document.getElementById('officials-grid').innerHTML = officials.map(createPlayerCard).join('');

    // -- NEWS
    const newsData = [
        { title: 'Dome Mission 2026 Season Preview — Division 4 Ambitions', cat: 'Club News', badgeObj: { cls: 'badge-primary', txt: 'CLUB NEWS' }, date: 'March 2026', body: 'Dome Mission are ready for the 2026 season as the 1st XI prepares for Division 4 East and the 2nd XI targets promotion from Division 10 Central. Up the Dome!', featured: true },
        { title: 'AGM 2026 — Club Awards & Captains Confirmed', cat: 'Announcement', badgeObj: { cls: 'badge-gold', txt: 'AGM 2026' }, date: 'March 2026', body: 'The Annual General Meeting concluded today. Team performance from last season was discussed alongside a healthy budget and financial review. Vikram Sharma and Vidit Gupta were officially named Captains for the 1st XI and 2nd XI respectively. Joshith and Sreeni were officially named Captains for the T20 1st XI and 2nd XI respectively.<br><br><b>Club Awards:</b><br>• Best Batsman: Ollie Liddiard & Girija Barla<br>• Best Bowler: Srini G & Nikhil Date<br>• Best All Rounder: Arif & Hemanth M<br>• Best Fielder: Amit Sisodiya & Joe Gatford<br>• Best Catch: Ollie Liddiard & Joshith G<br>• Inspiring Batsman: Sunraj Poojary & Ashutosh Sharma<br>• Inspiring Bowler: Aniket & Anshul Sikarwar<br>• Team Player of the season: Rohit Miglani', featured: true },
        { title: 'New Members Welcome — Trials for 2026 Season', cat: 'Announcement', badgeObj: { cls: 'badge-gold', txt: 'ANNOUNCEMENT' }, date: 'January 2026', body: 'Dome Mission is welcoming new members for the 2026 season. Contact Joshith on 07786589595 or Atish on 07871571260. All standards welcome. You\'ll find a home with us.' },
        { title: 'End of Season 2025 Report', cat: 'Match Report', badgeObj: { cls: 'badge-green', txt: 'MATCH REPORT' }, date: 'September 2025', body: 'A great season for both teams. 1st XI finished strongly in Division 4, while the 2nd XI showed excellent progress. Full report coming soon.' },
        { title: 'Dome Mission Awards Ceremony 2025 — Winners Announced', cat: 'Club News', badgeObj: { cls: 'badge-gold', txt: 'AWARDS' }, date: 'October 2025', body: 'Our annual awards ceremony celebrated the stars of the 2025 season. Player of the Year, Bowler of the Year, Batting award and more — see the Media section for photos.' },
        { title: 'Winter Training — Dates Announced', cat: 'Club News', badgeObj: { cls: 'badge-primary', txt: 'CLUB NEWS' }, date: 'November 2025', body: 'Indoor winter training sessions are now available. Contact the club for venue and timing details. Stay sharp over winter!' },
    ];

    document.getElementById('news-grid').innerHTML = newsData.map(n => `
        <div class="news-card glass-card ${n.featured ? 'featured border-focus' : ''}" data-category="${n.cat}">
            <span class="badge ${n.badgeObj.cls}">${n.badgeObj.txt}</span>
            <div class="news-date">${n.date}</div>
            <h3 class="news-title">${n.title}</h3>
            <p>${n.body}</p>
            <button class="btn btn-outline btn-sm mt-1">Read More</button>
        </div>
    `).join('');

    /* =========================================================
       7. FORM SUBMISSION HANDLING (Formspree)
    ========================================================= */
    const forms = [
        { id: 'contact-form', successId: 'contact-success' },
        { id: 'join-form', successId: 'join-success' }
    ];

    forms.forEach(f => {
        const formEl = document.getElementById(f.id);
        const successEl = document.getElementById(f.successId);
        
        if (formEl) {
            formEl.addEventListener('submit', async (e) => {
                e.preventDefault();
                const btn = formEl.querySelector('button[type="submit"]');
                const originalText = btn.textContent;
                
                // Set loading state
                btn.disabled = true;
                btn.textContent = 'Sending...';

                const formData = new FormData(formEl);
                
                try {
                    const response = await fetch(formEl.action, {
                        method: 'POST',
                        body: formData,
                        headers: {
                            'Accept': 'application/json'
                        }
                    });

                    if (response.ok) {
                        formEl.reset();
                        formEl.style.display = 'none'; // Hide form on success
                        successEl.classList.remove('d-none');
                    } else {
                        const data = await response.json();
                        alert(data.errors ? data.errors.map(error => error.message).join(", ") : "Oops! There was a problem submitting your form");
                        btn.disabled = false;
                        btn.textContent = originalText;
                    }
                } catch (error) {
                    alert("Oops! There was a problem submitting your form. Please check your connection.");
                    btn.disabled = false;
                    btn.textContent = originalText;
                }
            });
        }
    });

});
