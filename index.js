import './styles.css';;
const PAGE_DATA_NAME = 'sc-page';

// TODO: add a loading animation
const scCore = {

    plugins: {}, // plugins
    currentPage: 0, // tracks the currently active page
    pages: [], // array of all sc-page elements
    sectionHeights: [], // array of the start of each page's Y position
    scrollProgress: 0, // scroll progress percent through the current page
    config: {}, // config object

    // populate section height array, add handle scroll event listener
    init: function (config) {
        console.log('config is: ')
        this.config = config;

        // get all pages
        this.pages = [...document.querySelectorAll('.sc-page')];

        // if arrowkeynav is enabled, then bind event listeners to arrowkeys
        if (config['enableArrowKeyNav'] == 'true') {
            this.enableArrowKeyNav();
        }

        // if steady pages, then set classname
        if (config['steadyPages'] == 'true') {
            document.body.classList.add('steady');
            document.querySelector('main').classList.add('steady');
        }
            
        // init pages
        this.sectionHeights = this.initPages(this.pages, this.currentPage, config);

        // add scroll event listener to tell us what page we are on
        window.addEventListener('scroll', () => this.handleScroll());

        // add resize event listener to update the section heights
        window.addEventListener("resize", () => {
            // set a timeout to wait for resize to end before recalculating heights
            let timeout;
            clearTimeout(timeout);
            timeout = setTimeout(() => this.handleResize(), 1500); 
        });

        // navigate to the page the user was on before refresh
        let scrollpos = localStorage.getItem('scrollpos');
        if (scrollpos) this.jumpToPage(this.getPageByScrollAmt(scrollpos), this.sectionHeights);

        // on refresh, save the current scroll position
        window.onbeforeunload = function(e) {
            localStorage.setItem('scrollpos', window.scrollY);
        };
    },

    // TODO: get the scroll percentage for the current page as well
    // update current page 
    handleScroll: function () {

        // get the amount the user must scroll to get through the current page
        this.scrollProgress = this.getCurrPageScrollProgress();

        // set the scroll bar height
        let scrolledPage = this.getPageByScrollAmt(window.scrollY);

        // run plugin handle scroll functions
        for (const pluginName in this.plugins) { 
            this.plugins[pluginName].handleScroll(scrolledPage, this.scrollProgress);
        };

        if (this.currentPage != scrolledPage) {
            // change the page
            this.pages[this.currentPage].deactivate();
            this.pages[scrolledPage].activate();
            this.currentPage = scrolledPage;
        }
    },

    handleResize: function () {
        this.sectionHeights = [];
        this.sectionHeights = this.initPages(this.pages, this.currentPage, this.config);

        // run plugin handle scroll functions
        for (const pluginName in this.plugins) { 
            this.plugins[pluginName].sectionHeights = this.sectionHeights;
        }
    },

    initPages: function (pages, currentPage, config) {

        // init vars
        let sum = 0;
        let sectionHeights = [];

        // set up each page 
        pages.forEach((page, i) => {

            // set the page number
            page.setAttribute(PAGE_DATA_NAME, i);

            // set activate and deactivate functions
            page.activate = () => this.activate(page);
            page.deactivate = () => this.deactivate(page);

            // hide all pages
            page.deactivate();

            // set the scroll heights for when the user wants to transition pages
            sum += page.clientHeight;
            sectionHeights = [...sectionHeights, sum];
        });

        // activate the current [page]
        pages[currentPage].activate();

        // if steady pages, manually set body height
        if (config['steadyPages'] == 'true') {
            document.querySelector('body').style.height = sum + 'px';
        }

        return sectionHeights;
    },

    getPageByScrollAmt: function (scrollHeight) {
        let scrolledPage = 0;

        // iterate through section heights array
        this.sectionHeights.every((sectionHeight, i) => {

            scrolledPage = i;
            
            // find the current page the user is on
            if (scrollHeight < sectionHeight) {
                return false;
            } else {
                return true;
            }
        });
        return scrolledPage;
    }, 

    getCurrPageScrollProgress: function () {
        let lastSectionHeight = this.sectionHeights[this.currentPage - 1] == null ? 0 : this.sectionHeights[this.currentPage - 1];
        let sectionHeight = this.sectionHeights[this.currentPage] - lastSectionHeight;

        // set the scroll percentage based on how tall the current page is
        let scrolled = ((window.scrollY - lastSectionHeight) / (sectionHeight)) * 100;
        if (scrolled > 100) scrolled = 100;  
        return scrolled;
    },

    enableArrowKeyNav: function () {

        document.addEventListener('keydown', (e) => {
            e.preventDefault();
            switch (e.code) {
                case "ArrowUp":
                    if (this.currentPage != 0) 
                        this.jumpToPage(this.currentPage - 1, this.sectionHeights);
                    break;
                case "ArrowDown":
                    if (this.currentPage != this.pages.length - 1)
                        this.jumpToPage(this.currentPage + 1, this.sectionHeights);
                    break;
                case "ArrowLeft":
                    if (this.currentPage != 0) 
                        this.jumpToPage(this.currentPage - 1, this.sectionHeights);
                    break;
                    break;
                case "ArrowRight":
                    if (this.currentPage != this.pages.length - 1)
                        this.jumpToPage(this.currentPage + 1, this.sectionHeights);
                    break;
            }
        });
    },

    activate: function (elem) {
        elem.classList.remove('inactive');
        elem.classList.add('active');
    },
    
    deactivate: function (elem) {
        elem.classList.remove('active');
        elem.classList.add('inactive');
    },

    // getters
    getCurrentPage: function () {
        return this.currentPage;
    },

    getSectionHeights: function () {
        return this.sectionHeights;
    },

    getPages: function () {
        return this.pages;
    },

    registerPlugin: function (pluginPackage) {
        let { name, plugin } = pluginPackage; 
        this.plugins[name] = plugin;
        this.plugins[name].init({
            sectionHeights: this.sectionHeights,
            currentPage: this.currentPage,
            activate: this.activate,
            deactivate: this.deactivate,
            addCss: this.addCss,
            jumpToPage: (page) => this.jumpToPage(page, this.sectionHeights)
        });
    },

    addCss: function (fileName) {
        // add css stylesheet to document
        var head = document.head;
        var link = document.createElement("link");
        link.type = "text/css";
        link.rel = "stylesheet";
        link.href = fileName;
        head.appendChild(link);
    },

    jumpToPage: function (page, sectionHeights) {
        console.log(sectionHeights)
        console.log('jumping to page: ' + page);
        window.scrollTo({
            // section heights is the bottom of the section
            top: sectionHeights[page] - sectionHeights[0],
            left: 0,
            behavior: 'smooth',
        });
    },
}


window.addEventListener('DOMContentLoaded', function() {
    fetch('./config.json')
        .then((response) => response.json())
        .then((json) => scCore.init(json));
});