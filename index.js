(function () {
    "use strict";

    /**
     * Initializes the dropdown menu interaction.
     * Attaches event listeners to handle dropdown selection and content switching.
     */
    function init() {
        console.log("in init");

        const dropdowns = qsa("#dropdown-items li");
        const selectBox = qs(".select");
        const selectedText = qs(".selected");
        const caret = qs(".caret");
        const menu = qs(".menu");

        // Toggle dropdown menu visibility on select box click
        selectBox.addEventListener("click", function () {
            caret.classList.toggle("caret-rotate");
            menu.classList.toggle("menu-open");
        });

        // Add click listener to each dropdown item
        for (let i = 0; i < dropdowns.length; i++) {
            let dropdown = dropdowns[i];
            dropdown.addEventListener("click", toggleDropdown);
        }
    }

    /**
     * Handles dropdown item selection.
     * Updates the displayed selected text, highlights the active item,
     * switches the content based on selection, and closes the dropdown.
     * 
     * @this {HTMLElement} The clicked dropdown item
     */
    function toggleDropdown() {
        console.log("in toggledropdown");
        console.log(this);

        const selectedText = qs(".selected");
        const caret = qs(".caret");
        const menu = qs(".menu");
        const dropdowns = qsa("#dropdown-items li");

        // Update selected text
        selectedText.textContent = this.textContent;

        // Remove active class from all, then set active on selected
        for (let i = 0; i < dropdowns.length; i++) {
            let dropdown = dropdowns[i];
            dropdown.classList.remove("active");
        }
        this.classList.add("active");

        // Update content section
        chooseContent(this.dataset.target);

        // Close dropdown menu
        caret.classList.remove("caret-rotate");
        menu.classList.remove("menu-open");
    }

    /**
     * Displays the content section corresponding to the selected dropdown item.
     * Hides all other sections.
     * 
     * @param {string} targetClass - The class name of the section to be shown
     */
    function chooseContent(targetClass) {
        console.log("in chooseContent");

        const sections = ["education-wrapper", "projects-wrapper"];

        for (let i = 0; i < sections.length; i++) {
            let section = sections[i];
            const wrap = qs(`.${section}`);

            if (section === targetClass) {
                wrap.classList.remove("section-hidden");
                wrap.classList.add("section-visible");
            } else {
                wrap.classList.remove("section-visible");
                wrap.classList.add("section-hidden");
            }
        }
    }

    // Start the script
    init();
})();
