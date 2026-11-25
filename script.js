

// FLOATING COLLAPSIBLE NAVBAR

const navbar = document.querySelector(".navbar");
const navLogo = document.querySelector(".nav-logo");

window.addEventListener("scroll", function() {

    if (window.scrollY > 100) {
        navbar.classList.add("scrolled");
    } else {
        navbar.classList.remove("scrolled");
        navbar.classList.remove("expanded");
    }

});

navbar.addEventListener("click", function(event) {

    if (!navbar.classList.contains("scrolled")) {
        return;
    }

    if (event.target.closest(".nav-links a, .nav-btn")) {
        return;
    }

    navbar.classList.toggle("expanded");

});
// CUSTOMER ENQUIRY FORM

const enquiryForm = document.getElementById("enquiryForm");

if (enquiryForm) {
    enquiryForm.addEventListener("submit", async function(event) {
        event.preventDefault();

        const customerName = document.getElementById("customerName").value.trim();
        const customerPhone = document.getElementById("customerPhone").value.trim();
        const productInterested = document.getElementById("productInterested").value.trim();
        const enquiryMessage = document.getElementById("enquiryMessage").value.trim();

        const { error } = await supabaseClient
            .from("enquiries")
            .insert([
                {
                    customer_name: customerName,
                    phone: customerPhone,
                    product_interested: productInterested,
                    message: enquiryMessage
                }
            ]);

        if (error) {
            alert("Unable to submit enquiry. Please try again.");
            console.error(error);
        } else {
            alert("Your enquiry has been submitted successfully!");
            enquiryForm.reset();
        }
    });
}
// =====================================
// LOAD PUBLIC PRODUCTS FROM SUPABASE
// =====================================

async function loadPublicProducts() {

    const wholesaleContainer =
        document.getElementById("wholesaleProducts");

    const retailContainer =
        document.getElementById("retailProducts");

    const { data, error } = await supabaseClient
        .from("products")
        .select("*")
        .order("id", { ascending: true });

    if (error) {
        console.error("Product loading failed:", error);
        wholesaleContainer.innerHTML = "<p>Unable to load products.</p>";
        retailContainer.innerHTML = "<p>Unable to load products.</p>";
        return;
    }

    wholesaleContainer.innerHTML = "";
    retailContainer.innerHTML = "";

    data.forEach(function(product) {

        const card = document.createElement("div");
        card.className = "agro-parent";

        card.innerHTML = `
            <div class="agro-card">

                <div class="agro-logo">
                    <span class="agro-circle agro-circle1"></span>
                    <span class="agro-circle agro-circle2"></span>
                    <span class="agro-circle agro-circle3"></span>
                    <span class="agro-circle agro-circle4"></span>
                    <span class="agro-circle agro-circle5">🌱</span>
                </div>

                <div class="agro-glass"></div>

                <div class="agro-content">
                    <span class="agro-title"></span>
                    <span class="agro-category"></span>
                    <span class="agro-price"></span>
                    <span class="agro-unit"></span>
                </div>

                <div class="agro-bottom">
                    <span class="agro-label">CHAMUNDESHWARI AGRO</span>
                    <button class="agro-enquire-button" type="button">
                        Enquire Now →
                    </button>
                </div>

            </div>
        `;

        card.querySelector(".agro-title").textContent =
            product.name || "";

        card.querySelector(".agro-category").textContent =
            product.category || "";

        card.querySelector(".agro-price").textContent =
            "₹" + product.price;

        card.querySelector(".agro-unit").textContent =
            "Unit: " + (product.unit || "");

        card.querySelector(".agro-enquire-button")
            .addEventListener("click", function() {

                document.getElementById("productInterested").value =
                    product.name || "";

                document.getElementById("enquiry")
                    .scrollIntoView({ behavior: "smooth" });
            });

        if (product.product_type === "Retail") {
            retailContainer.appendChild(card);
        } else {
            wholesaleContainer.appendChild(card);
        }

    });

    if (wholesaleContainer.children.length === 0) {
        wholesaleContainer.innerHTML =
            "<p>No wholesale products available.</p>";
    }

    if (retailContainer.children.length === 0) {
        retailContainer.innerHTML =
            "<p>No retail products available.</p>";
    }
}

loadPublicProducts();