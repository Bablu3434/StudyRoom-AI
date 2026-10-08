console.log("StudyRoom AI Started Successfully");

// Navbar shadow when scrolling

window.addEventListener("scroll", function () {

    const navbar = document.querySelector(".navbar");

    if (window.scrollY > 30) {

        navbar.style.boxShadow =
            "0 8px 25px rgba(0,0,0,0.06)";

    } else {

        navbar.style.boxShadow = "none";

    }

});


// Start buttons demo

const startButtons =
    document.querySelectorAll(".subject button");

startButtons.forEach((button) => {

    button.addEventListener("click", function () {

        const subjectName =
            this.parentElement
                .querySelector(".subject-info strong")
                .innerText;

        alert(
            `Starting study session for ${subjectName}`
        );

    });

});
