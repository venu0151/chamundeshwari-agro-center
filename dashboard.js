// =====================================
// SHOW TOAST NOTIFICATIONS
// =====================================

function showToast(message, type = "success") {

    const toast = document.getElementById("toastNotification");

    toast.textContent = message;

    toast.className = "toast-notification";

    if (type === "error") {
        toast.classList.add("error");
    }

    toast.classList.add("show");

    setTimeout(function() {
        toast.classList.remove("show");
    }, 3000);

}



const OWNER_USER_ID = "1ec07a6f-27a3-4408-9ace-fa28ec4e749e";

// =====================================
// OWNER VERIFICATION
// =====================================

async function checkOwner() {

    const { data, error } = await supabaseClient.auth.getUser();

    if (error || !data.user) {
        window.location.href = "admin.html";
        return false;
    }

    if (data.user.id !== OWNER_USER_ID) {
        await supabaseClient.auth.signOut();
        window.location.href = "admin.html";
        return false;
    }

    console.log("Owner verified. Dashboard access granted.");

    return true;
}


// =====================================
// LOGOUT
// =====================================

document.getElementById("logoutButton")
.addEventListener("click", async function() {

    await supabaseClient.auth.signOut();

    window.location.href = "admin.html";

});


// =====================================
// LOAD PRODUCTS
// =====================================

async function loadProducts() {

    const tableBody = document.getElementById("productTableBody");

    tableBody.innerHTML =
        "<tr><td colspan='6'>Loading products...</td></tr>";

    const { data, error } = await supabaseClient
        .from("products")
        .select("*")
        .order("id", { ascending: true });

    if (error) {

        tableBody.innerHTML =
            "<tr><td colspan='6'>Error: " +
            error.message +
            "</td></tr>";

        return;
    }

    tableBody.innerHTML = "";

    // Update total product count
    const totalElement = document.getElementById("totalProducts");

    if (totalElement) {
        totalElement.textContent = data.length;
    }
    if (data.length === 0) {

        tableBody.innerHTML =
            "<tr><td colspan='6'>No products found.</td></tr>";

        return;
    }

    data.forEach(function(product) {

        const row = document.createElement("tr");

        [
    product.name,
    product.category,
    product.product_type || "Wholesale",
    "₹" + product.price,
    product.unit
].forEach(function(value) {
            const cell = document.createElement("td");

            cell.textContent = value ?? "";

            row.appendChild(cell);

        });

        const actionCell = document.createElement("td");

        const editButton = document.createElement("button");

editButton.textContent = "Edit";

editButton.addEventListener("click", function() {
    editProduct(product);
});

actionCell.appendChild(editButton);


// DELETE BUTTON

const deleteButton = document.createElement("button");

deleteButton.textContent = "Delete";

deleteButton.style.background = "#fde8e8";
deleteButton.style.color = "#c62828";
deleteButton.style.marginLeft = "8px";

deleteButton.addEventListener("click", function() {
    console.log("Delete button clicked!");
    deleteProduct(product);
});


        tableBody.appendChild(row);

    });

}


// =====================================
// EDIT PRODUCT PRICE
// =====================================
// =====================================
// ADD PRODUCT USING CUSTOM MODAL
// =====================================

const productModal = document.getElementById("productModal");
const productForm = document.getElementById("productForm");

document.getElementById("addProductButton")
.addEventListener("click", function() {

    productForm.reset();

    document.getElementById("productId").value = "";

    document.getElementById("modalTitle").textContent =
        "Add New Product";

    document.getElementById("saveProductButton").textContent =
        "Save Product";

    productModal.style.display = "flex";

});

document.getElementById("closeModalButton")
.addEventListener("click", function() {
    productModal.style.display = "none";
});

document.getElementById("cancelModalButton")
.addEventListener("click", function() {
    productModal.style.display = "none";
});

productForm.addEventListener("submit", async function(event) {

    event.preventDefault();

    const productId = document.getElementById("productId").value;

    const name = document.getElementById("productName").value.trim();
    const category = document.getElementById("productCategory").value.trim();
    const productType = document.getElementById("productType").value;
    const price = Number(document.getElementById("productPrice").value);
    const unit = document.getElementById("productUnit").value.trim();

    if (!name || !category || !unit || !Number.isFinite(price) || price < 0) {
        showToast("Please enter valid product details.", "error");
    }

    let result;

    if (productId) {

        // UPDATE EXISTING PRODUCT

        result = await supabaseClient
            .from("products")
            .update({
                name: name,
                category: category,
                product_type:   productType,
                price: price,
                unit: unit
            })
            .eq("id", productId);

    } else {

        // ADD NEW PRODUCT

        result = await supabaseClient
            .from("products")
            .insert([{
    name: name,
    category: category,
    product_type: productType,
    price: price,
    unit: unit
}]);

    }

    if (result.error) {
       showToast("Operation failed: " + result.error.message, "error");
    }

    productModal.style.display = "none";

    productForm.reset();

    await loadProducts();

    showToast(
    productId ? "Product updated successfully!" : "Product added successfully!"
);

});
async function editProduct(product) {

    productForm.reset();

    document.getElementById("productId").value = product.id;

    document.getElementById("modalTitle").textContent =
        "Edit Product";

    document.getElementById("saveProductButton").textContent =
        "Update Product";

    document.getElementById("productName").value = product.name;
    document.getElementById("productCategory").value = product.category;
    document.getElementById("productType").value =
    product.product_type || "Wholesale";
    document.getElementById("productPrice").value = product.price;
    document.getElementById("productUnit").value = product.unit;

    productModal.style.display = "flex";

}
// =====================================
// LOAD CUSTOMER ENQUIRIES
// =====================================

async function loadEnquiries() {

    const tableBody = document.getElementById("enquiryTableBody");

    tableBody.innerHTML =
        "<tr><td colspan='5'>Loading enquiries...</td></tr>";

    const { data, error } = await supabaseClient
        .from("enquiries")
        .select("*")
        .order("created_at", { ascending: false });

    if (error) {

        tableBody.innerHTML =
            "<tr><td colspan='5'>Error: " +
            error.message +
            "</td></tr>";

        return;
    }

    tableBody.innerHTML = "";
    const enquiryCount = document.getElementById("totalEnquiries");

if (enquiryCount) {
    enquiryCount.textContent = data.length;
}

    if (data.length === 0) {

        tableBody.innerHTML =
            "<tr><td colspan='5'>No enquiries received yet.</td></tr>";

        return;
    }

    data.forEach(function(enquiry) {

    const row = document.createElement("tr");

    const values = [
        enquiry.customer_name,
        enquiry.phone,
        enquiry.product_interested,
        enquiry.message,
        new Date(enquiry.created_at).toLocaleString("en-IN")
    ];

    values.forEach(function(value) {

        const cell = document.createElement("td");

        cell.textContent = value ?? "";

        row.appendChild(cell);

    });

    // STATUS DROPDOWN

    const statusCell = document.createElement("td");

    const statusSelect = document.createElement("select");

    ["Pending", "Contacted", "Completed"].forEach(function(status) {

        const option = document.createElement("option");

        option.value = status;
        option.textContent = status;

        statusSelect.appendChild(option);

    });

    statusSelect.value = enquiry.status || "Pending";
    function updateStatusColor() {
    statusSelect.className = "";

    if (statusSelect.value === "Pending") {
        statusSelect.classList.add("status-pending");
    } 
    else if (statusSelect.value === "Contacted") {
        statusSelect.classList.add("status-contacted");
    } 
    else if (statusSelect.value === "Completed") {
        statusSelect.classList.add("status-completed");
    }
}

updateStatusColor();

statusSelect.addEventListener("change", updateStatusColor);
    statusSelect.addEventListener("change", async function() {

    const newStatus = statusSelect.value;

    const { error } = await supabaseClient
        .from("enquiries")
        .update({ status: newStatus })
        .eq("id", enquiry.id);

    if (error) {
        showToast("Status update failed: " + error.message, "error");
        statusSelect.value = enquiry.status || "Pending";
        return;
    }

    enquiry.status = newStatus;
    showToast("Enquiry status updated!");

});

    statusCell.appendChild(statusSelect);

    row.appendChild(statusCell);
    const actionCell = document.createElement("td");

// CALL BUTTON
const callButton = document.createElement("a");
callButton.href = "tel:" + enquiry.phone;
callButton.textContent = "Call";
callButton.className = "call-button";

actionCell.appendChild(callButton);

// DELETE BUTTON
const deleteButton = document.createElement("button");
deleteButton.textContent = "Delete";
deleteButton.className = "delete-enquiry-button";

deleteButton.addEventListener("click", async function() {

    const confirmDelete = confirm(
        "Are you sure you want to delete this enquiry?"
    );

    if (!confirmDelete) return;

    const { error } = await supabaseClient
        .from("enquiries")
        .delete()
        .eq("id", enquiry.id);

    if (error) {
        showToast("Failed to delete: " + error.message, "error");
        return;
    }

    showToast("Enquiry deleted successfully!");
    await loadEnquiries();

});

actionCell.appendChild(deleteButton);

row.appendChild(actionCell);
actionCell.appendChild(deleteButton);

row.appendChild(actionCell);

tableBody.appendChild(row);
});
}


// =====================================
// START DASHBOARD
// =====================================

async function startDashboard() {

    const isOwner = await checkOwner();

    if (!isOwner) return;

    await loadProducts();
    await loadEnquiries();

}

startDashboard();
// DELETE PRODUCT

// DELETE PRODUCT USING CUSTOM MODAL

let productToDelete = null;

const deleteModal = document.getElementById("deleteModal");

async function deleteProduct(product) {

    productToDelete = product;

    document.getElementById("deleteProductMessage").textContent =
        "Are you sure you want to delete " + product.name + "?";

    deleteModal.style.display = "flex";

}


// CANCEL DELETE

document.getElementById("cancelDeleteButton")
.addEventListener("click", function() {

    deleteModal.style.display = "none";

    productToDelete = null;

});


// CONFIRM DELETE

document.getElementById("confirmDeleteButton")
.addEventListener("click", async function() {

    if (!productToDelete) return;

    const { error } = await supabaseClient
        .from("products")
        .delete()
        .eq("id", productToDelete.id);

    if (error) {

        showToast("Delete failed: " + error.message, "error");

        return;
    }

    deleteModal.style.display = "none";

productToDelete = null;

await loadProducts();

showToast("Product deleted successfully!");
});
// =====================================
// SIDEBAR ACTIVE MENU HIGHLIGHT
// =====================================

const menuLinks = document.querySelectorAll(".menu-link");

menuLinks.forEach(function(link) {

    link.addEventListener("click", function() {

        menuLinks.forEach(function(item) {
            item.classList.remove("active");
        });

        this.classList.add("active");

    });

});
// ADMIN PROFILE DROPDOWN

const profileButton = document.getElementById("adminProfileButton");
const profileDropdown = document.getElementById("adminDropdown");
const adminEmail = document.getElementById("adminEmail");

if (profileButton && profileDropdown) {

    profileButton.addEventListener("click", function() {
        profileDropdown.classList.toggle("show");
    });

    document.addEventListener("click", function(event) {
        if (!event.target.closest(".admin-profile")) {
            profileDropdown.classList.remove("show");
        }
    });
}

// DISPLAY ADMIN EMAIL

async function loadAdminEmail() {
    const { data, error } = await supabaseClient.auth.getUser();

    if (!error && data.user) {
        adminEmail.textContent = data.user.email;
    }
}

loadAdminEmail();
// CHANGE PASSWORD

const changePasswordButton = document.getElementById("changePasswordButton");

changePasswordButton.addEventListener("click", async function() {

    const { data, error } = await supabaseClient.auth.getUser();

    if (error || !data.user) {
        showToast("Unable to get admin email", "error");
        return;
    }

    const { error: resetError } = await supabaseClient.auth
        .resetPasswordForEmail(data.user.email, {
            redirectTo: window.location.origin + "/admin.html"
        });

    if (resetError) {
        showToast("Password reset email failed", "error");
        return;
    }

    showToast("Password reset email sent!");
});

// PROFILE LOGOUT

const profileLogoutButton = document.getElementById("profileLogoutButton");

profileLogoutButton.addEventListener("click", async function() {

    const { error } = await supabaseClient.auth.signOut();

    if (error) {
        showToast("Logout failed", "error");
        return;
    }

    window.location.href = "admin.html";
});
// =====================================
// ADMIN PROFILE MANAGEMENT
// =====================================

const editProfileButton = document.getElementById("editProfileButton");
const editProfileModal = document.getElementById("editProfileModal");
const profileNameInput = document.getElementById("profileNameInput");
const profileImageInput = document.getElementById("profileImageInput");
const profileImagePreview = document.getElementById("profileImagePreview");

let selectedProfileImage = null;
let currentAvatarUrl = null;

// LOAD ADMIN PROFILE

async function loadAdminProfile() {

    const { data: { user } } = await supabaseClient.auth.getUser();

    if (!user) return;

    const { data, error } = await supabaseClient
        .from("admin_profiles")
        .select("*")
        .eq("id", user.id)
        .maybeSingle();

    if (error) {
        showToast("Unable to load profile", "error");
        return;
    }

    const displayName = data?.display_name || "Admin";
    currentAvatarUrl = data?.avatar_url || null;

    document.getElementById("adminDisplayName").textContent = displayName;
    document.getElementById("adminProfileInitial").textContent =
        displayName.charAt(0).toUpperCase();

    if (currentAvatarUrl) {
        const image = document.getElementById("adminProfileImage");
        image.src = currentAvatarUrl;
        image.style.display = "block";
        document.getElementById("adminProfileInitial").style.display = "none";
    }
}

// OPEN EDIT PROFILE

editProfileButton.addEventListener("click", async function() {
    console.log("Edit Profile button clicked");

    const { data: { user } } = await supabaseClient.auth.getUser();

    const { data } = await supabaseClient
        .from("admin_profiles")
        .select("*")
        .eq("id", user.id)
        .maybeSingle();

    profileNameInput.value = data?.display_name || "Admin";

    editProfileModal.style.display = "flex";
    console.log("Modal display:", editProfileModal.style.display);
});

// PREVIEW SELECTED IMAGE

profileImageInput.addEventListener("change", function() {

    const file = this.files[0];

    if (!file) return;

    if (!file.type.startsWith("image/")) {
        showToast("Please select an image", "error");
        this.value = "";
        return;
    }

    if (file.size > 2 * 1024 * 1024) {
        showToast("Image must be smaller than 2 MB", "error");
        this.value = "";
        return;
    }

    selectedProfileImage = file;

    profileImagePreview.src = URL.createObjectURL(file);
    profileImagePreview.style.display = "block";
});

// SAVE PROFILE

// SAVE ADMIN PROFILE

const saveProfileButton = document.getElementById("saveProfileButton");

saveProfileButton.addEventListener("click", async function() {

    const name = profileNameInput.value.trim();

    if (!name) {
        showToast("Please enter your name", "error");
        return;
    }

    // Show loading feedback
    const originalButtonText = saveProfileButton.textContent;
    saveProfileButton.textContent = "Saving...";
    saveProfileButton.disabled = true;

    try {

        const { data: { user }, error: userError } =
            await supabaseClient.auth.getUser();

        if (userError) throw userError;

        if (!user) {
            throw new Error("Please log in again.");
        }

        let avatarUrl = currentAvatarUrl;

        // Upload new profile image if selected
        if (selectedProfileImage) {

            const filePath = user.id + "/" + Date.now() + "-" +
                selectedProfileImage.name.replace(/[^a-zA-Z0-9._-]/g, "_");

            const { error: uploadError } = await supabaseClient.storage
                .from("admin-profiles")
                .upload(filePath, selectedProfileImage);

            if (uploadError) throw uploadError;

            const { data: imageData } = supabaseClient.storage
                .from("admin-profiles")
                .getPublicUrl(filePath);

            avatarUrl = imageData.publicUrl;
        }

        // Save profile details
        const { error: saveError } = await supabaseClient
            .from("admin_profiles")
            .upsert({
                id: user.id,
                display_name: name,
                avatar_url: avatarUrl,
                updated_at: new Date().toISOString()
            });

        if (saveError) throw saveError;

        selectedProfileImage = null;
        profileImageInput.value = "";

        editProfileModal.style.display = "none";

        await loadAdminProfile();

        showToast("Admin profile updated successfully!");

    } catch (error) {

        console.error("Profile update error:", error);

        showToast("Profile update failed: " + error.message, "error");

    } finally {

        // Restore button
        saveProfileButton.textContent = originalButtonText;
        saveProfileButton.disabled = false;
    }
});


// CANCEL EDITING

document.getElementById("cancelProfileButton")
.addEventListener("click", function() {

    editProfileModal.style.display = "none";
    selectedProfileImage = null;
    profileImageInput.value = "";
});


// LOAD PROFILE WHEN DASHBOARD STARTS

loadAdminProfile();
// =====================================
// COLLAPSE SIDEBAR WHEN PRODUCTS APPEAR
// =====================================

const dashboardLayout = document.querySelector(".dashboard-layout");
const productsSection = document.getElementById("products");

if (dashboardLayout && productsSection) {

    const sidebarObserver = new IntersectionObserver(
        function(entries) {

            entries.forEach(function(entry) {

                if (entry.isIntersecting) {
                    dashboardLayout.classList.add("sidebar-hidden");
                } else {
                    dashboardLayout.classList.remove("sidebar-hidden");
                }

            });

        },
        {
            threshold: 0.1
        }
    );

    sidebarObserver.observe(productsSection);
}