(function () {
    "use strict";
    function initTabs() {
        const tabs = qsa('.tab');
        const tabContents = qsa('.tab-content');

        tabs.forEach(button => {
            button.addEventListener("click", () => {
                const targetId = button.getAttribute('data-target');

                tabs.forEach(btn => btn.classList.remove('active'));
                button.classList.add('active');

                tabContents.forEach(content => {
                    content.classList.remove('visible');
                    content.classList.add('hidden');
                });
                
                const targetTab = document.getElementById(targetId);
                targetTab.classList.remove('hidden');
                targetTab.classList.add('visible');

                targetTab.scrollIntoView({ behavior: 'smooth' });
            });
        });
    }
    function initCarousel() {
        const images = qsa('.img-carousel img');
        let index = 0;

        setInterval(() => {
            images[index].classList.remove('show');
            index = (index + 1) % images.length;
            images[index].classList.add('show');
        }, 5000);
    }
    
    function init(){
        initTabs();
        initCarousel();
    }

    init();
})();