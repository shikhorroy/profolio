'use strict';


// element toggle function
const elementToggleFunc = function (elem) {
    elem.classList.toggle("active");
}


// sidebar variables
const sidebar = document.querySelector("[data-sidebar]");
const sidebarBtn = document.querySelector("[data-sidebar-btn]");

// sidebar toggle functionality for mobile
sidebarBtn.addEventListener("click", function () {
    elementToggleFunc(sidebar);
});

// custom select variables
const select = document.querySelector("[data-select]");
const selectItems = document.querySelectorAll("[data-select-item]");
const selectValue = document.querySelector("[data-select-value]");
const filterBtn = document.querySelectorAll("[data-filter-btn]");

select.addEventListener("click", function () { elementToggleFunc(this); });

// add event in all select items
for (let i = 0; i < selectItems.length; i++) {
    selectItems[i].addEventListener("click", function () {
        let selectedValue = this.innerText.toLowerCase();
        selectValue.innerText = this.innerText;
        elementToggleFunc(select);
        filterFunc(selectedValue);
    });
}

// filter variables
const filterItems = document.querySelectorAll("[data-filter-item]");

const filterFunc = function (selectedValue) {
    for (let i = 0; i < filterItems.length; i++) {
        if (selectedValue === "all") {
            filterItems[i].classList.add("active");
        } else if (selectedValue === filterItems[i].dataset.category) {
            filterItems[i].classList.add("active");
        } else {
            filterItems[i].classList.remove("active");
        }
    }
}

// add event in all filter button items for large screen
let lastClickedBtn = filterBtn[0];
for (let i = 0; i < filterBtn.length; i++) {
    filterBtn[i].addEventListener("click", function () {
        let selectedValue = this.innerText.toLowerCase();
        selectValue.innerText = this.innerText;
        filterFunc(selectedValue);
        lastClickedBtn.classList.remove("active");
        this.classList.add("active");
        lastClickedBtn = this;
    });
}

// contact form variables
const form = document.querySelector("[data-form]");
const formInputs = document.querySelectorAll("[data-form-input]");
const formBtn = document.querySelector("[data-form-btn]");

// add event to all form input field
for (let i = 0; i < formInputs.length; i++) {
    formInputs[i].addEventListener("input", function () {

        // check form validation
        if (form.checkValidity()) {
            formBtn.removeAttribute("disabled");
        } else {
            formBtn.setAttribute("disabled", "");
        }

    });
}


// page navigation variables
const navigationLinks = document.querySelectorAll("[data-nav-link]");
const pages = document.querySelectorAll("[data-page]");

// add event to all nav link
for (let i = 0; i < navigationLinks.length; i++) {
    navigationLinks[i].addEventListener("click", function () {

        for (let i = 0; i < pages.length; i++) {
            if (this.innerHTML.toLowerCase() === pages[i].dataset.page) {
                pages[i].classList.add("active");
                navigationLinks[i].classList.add("active");
                window.scrollTo(0, 0);
            } else {
                pages[i].classList.remove("active");
                navigationLinks[i].classList.remove("active");
            }
        }

    });
}

//~ generate html page:
fetch('assets/data/profolio.json')
    .then(response => {
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        return response.json();
    })
    .then(data => {
        // console.log(data); // Use the JSON data
        document.title = data.name;
        document.getElementById("engineerName").title = data.name;
        document.getElementById("engineerName").innerText = data.name;
        document.getElementById("designation").innerText = data.designation;

        document.getElementById("picture").alt = data.name;
        document.getElementById("picture").src = data.picturePath;

        document.getElementById("email").innerText = data.email;
        document.getElementById("email").href = `mailto:${data.email}`;

        //~ Calculate total experience and update introduction
        const totalExperience = calculateTotalExperience(data.experience);
        let experienceText = '';
        if (totalExperience.years > 0 && totalExperience.months > 0) {
            experienceText = `${totalExperience.years} years ${totalExperience.months} months`;
        } else if (totalExperience.years > 0) {
            experienceText = `${totalExperience.years} years`;
        } else if (totalExperience.months > 0) {
            experienceText = `${totalExperience.months} months`;
        }
        const updatedIntroduction = data.introduction.replace('{{EXPERIENCE}}', experienceText);
        document.getElementById("introduction").innerText = updatedIntroduction;

        document.getElementById("dob").innerText = new Intl.DateTimeFormat('en-US', {
            month: 'long',
            day: '2-digit',
            year: 'numeric'
        }).format(new Date(data.dob));
        document.getElementById("dob").dateTime = data.dob;
        document.getElementById("address").innerText = data.address;

        //~ service list:
        const serviceListContainer = document.getElementById("service-list");
        serviceListContainer.innerHTML = generateServiceItems(data.professionalFocus);

        //~ testimonial list:
        const testimonialListContainer = document.getElementById("testimonials-list");
        testimonialListContainer.innerHTML = generateTestimonialItems(data.testimonials);
        setModalFunctionality();

        //~ service list:
        const socialListContainer = document.getElementById("social-list");
        socialListContainer.innerHTML = generateSocialItems(data.socialLink);

        //~ education list:
        const educationListContainer = document.getElementById("education-timeline-list");
        educationListContainer.innerHTML = generateEducationTimelineItems(data.education);

        //~ experience list:
        const experienceListContainer = document.getElementById("experience-timeline-list");
        experienceListContainer.innerHTML = generateExperienceTimelineItems(data.experience);

        //~ skills list:
        const skillsListContainer = document.getElementById("skills-list");
        skillsListContainer.innerHTML = generateSkillItems(data.skills);

        //~ blog posts list:
        const blogPostsListContainer = document.getElementById("blog-posts-list");
        blogPostsListContainer.innerHTML = generateBlogPostItems(data.blogPosts);
    })
    .catch(error => {
        console.error('There was a problem with the fetch operation:', error);
    });

function generateTestimonialItems(data) {
    return data.map((item) => {
        return `
            <li class="testimonials-item">
                <div class="content-card" data-testimonials-item>
                    <figure class="testimonials-avatar-box">
                        <img src="${item._imagePath}" alt="${item._name}" width="60"
                             data-testimonials-avatar style="border-radius: 5px">
                    </figure>
                    <h4 class="h4 testimonials-item-title" data-testimonials-title>${item._name}</h4>
                    <input value="${item._date}" type="hidden" data-published-date/>
                    <div class="testimonials-text" data-testimonials-text>
                        <p>
                            ${item._description}
                        </p>
                    </div>
                </div>
            </li>
        `;
    }
    ).join(""); // Combine all list items into a single string
}

function generateServiceItems(data) {
    return data.map((item) => {
        // Generate dynamic properties
        const dynamicProperties = Object.keys(item)
            .filter(key => key !== '_title' && key !== '_icon' && key !== '_description')
            .map(key => `<strong>${key.charAt(0).toUpperCase() + key.slice(1)}:</strong> ${item[key]}`)
            .join('<br>');

        return `
          <li class="service-item">
              <div class="service-content-box">
                  <h4 class="h4 service-item-title center-align">
                      <span class="icon-box">
                          <ion-icon name="${item._icon}"></ion-icon>
                      </span>
                      <span class="margin-left-5px">${item._title}</span>
                  </h4>
                  <p class="service-item-text">
                      ${item._description ? item._description + '<br>' : ''}
                      ${dynamicProperties}
                  </p>
              </div>
          </li>
        `;
    }
    ).join(""); // Combine all list items into a single string
}

function setModalFunctionality() {
    // testimonials variables
    const testimonialsItem = document.querySelectorAll("[data-testimonials-item]");
    const modalContainer = document.querySelector("[data-modal-container]");
    const modalCloseBtn = document.querySelector("[data-modal-close-btn]");
    const overlay = document.querySelector("[data-overlay]");

    // modal variable
    const modalImg = document.querySelector("[data-modal-img]");
    const modalTitle = document.querySelector("[data-modal-title]");
    const modalText = document.querySelector("[data-modal-text]");
    const modalPublishedDate = document.querySelector("[data-modal-published-date]");

    // modal toggle function
    const testimonialsModalFunc = function () {
        modalContainer.classList.toggle("active");
        overlay.classList.toggle("active");
    }

    // add click event to all modal items
    for (const element of testimonialsItem) {
        element.addEventListener("click", function () {
            modalImg.src = this.querySelector("[data-testimonials-avatar]").src;
            modalImg.alt = this.querySelector("[data-testimonials-avatar]").alt;
            modalTitle.innerHTML = this.querySelector("[data-testimonials-title]").innerHTML;
            modalText.innerHTML = this.querySelector("[data-testimonials-text]").innerHTML;
            modalPublishedDate.innerHTML = new Intl.DateTimeFormat('en-US', {
                month: 'short',
                day: '2-digit',
                year: 'numeric'
            }).format(new Date(this.querySelector("[data-published-date]").value));
            testimonialsModalFunc();
        });
    }

    // add click event to modal close button
    modalCloseBtn.addEventListener("click", testimonialsModalFunc);
    overlay.addEventListener("click", testimonialsModalFunc);
}

function generateSocialItems(data) {
    return data.map((item) => {
        return `
          <li class="social-item">
            <a href="${item.href}" class="social-link">
                <ion-icon name="${item._icon}"></ion-icon>
            </a>
        </li>
        `;
    }
    ).join(""); // Combine all list items into a single string
}

function generateEducationTimelineItems(data) {
    return data.map((item) => {
        return `
          <li class="timeline-item">
             <h4 class="h4 timeline-item-title">${item._institution}</h4>
             <span>${item._year}</span>
             <p class="timeline-text">${item._subject}</p>
         </li>
        `;
    }
    ).join(""); // Combine all list items into a single string
}

function generateExperienceTimelineItems(data) {
    return data.map((item) => {
        // Generate dynamic properties
        const dynamicProperties = Object.keys(item)
            .filter(key => key !== '_institution' && key !== '_designation' && key !== 'start' && key !== 'end')
            .map(key => `<strong>${key.charAt(0).toUpperCase() + key.slice(1)}:</strong> ${item[key]}`)
            .join('<br>');

        // Concatenate designation with date range
        const designationWithDates = `${item._designation} | ${item.start} - ${item.end}`;

        return `
            <li class="timeline-item">
                <h4 class="h4 timeline-item-title">${item._institution}</h4>
                <span>${designationWithDates}</span>
                <p class="timeline-text">
                    ${dynamicProperties}
                </p>
            </li>
        `;
    }
    ).join(""); // Combine all list items into a single string
}

// Calculate total years and months of experience
function calculateTotalExperience(experiences) {
    const monthMap = {
        'Jan': 0, 'Feb': 1, 'Mar': 2, 'Apr': 3, 'May': 4, 'Jun': 5,
        'Jul': 6, 'Aug': 7, 'Sep': 8, 'Oct': 9, 'Nov': 10, 'Dec': 11
    };

    let totalMonths = 0;
    const currentDate = new Date();

    experiences.forEach(exp => {
        let startDate, endDate;

        // Parse start date
        const startParts = exp.start.split(' ');
        startDate = new Date(Number.parseInt(startParts[1]), monthMap[startParts[0]], 1);

        // Parse end date
        if (exp.end.toLowerCase() === 'present') {
            endDate = currentDate;
        } else {
            const endParts = exp.end.split(' ');
            endDate = new Date(Number.parseInt(endParts[1]), monthMap[endParts[0]], 1);
        }

        // Calculate months difference
        const monthsDiff = (endDate.getFullYear() - startDate.getFullYear()) * 12
            + (endDate.getMonth() - startDate.getMonth()) + 1;
        totalMonths += monthsDiff;
    });

    const years = Math.floor(totalMonths / 12);
    const months = totalMonths % 12;

    return { years, months };
}

function generateSkillItems(data) {
    return data.map((item) => {
        return `
            <li class="skills-item">
                <div class="title-wrapper">
                    <h5 class="h5">${item._name}</h5>
                    <data value="${item._pct}">${item._pct}%</data>
                </div>
                <div class="skill-progress-bg">
                    <div class="skill-progress-fill" style="width: ${item._pct}%;"></div>
                </div>
            </li>
        `;
    }
    ).join(""); // Combine all list items into a single string
}

function generateBlogPostItems(data) {
    return data.map((item) => {
        let publishedDate = new Intl.DateTimeFormat('en-US', {
            month: 'short',
            day: '2-digit',
            year: 'numeric'
        }).format(new Date(item._publishedDate));
        return `
            <li class="blog-post-item">
                <a href="${item._href}">
                    <figure class="blog-banner-box">
                        <img src="${item._imagePath}" alt="${item._imageAlt}" loading="lazy">
                    </figure>
                    <div class="blog-content">
                        <div class="blog-meta">
                            <p class="blog-category">${item._category}</p>
                            <span class="dot"></span>
                            <time datetime="${item._publishedDate}">${publishedDate}</time>
                        </div>
                        <h3 class="h3 blog-item-title">${item._title}</h3>
                        <p class="blog-text">
                            ${item._description}
                        </p>
                    </div>
                </a>
            </li>
        `;
    }
    ).join(""); // Combine all list items into a single string
}