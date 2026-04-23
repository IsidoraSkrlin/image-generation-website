console.log("Script loaded successfully!");

async function generate() {
    // Get the prompt from the input field
    const promptInput = document.getElementById("prompt");
    const image = document.getElementById("result");
    const spinner = document.getElementById("spinner");
    const button = document.querySelector("button");

        if (!image || !spinner || !button || !promptInput) {
        console.error("One or more elements not found");
        alert("An unexpected error occurred");
        return;
    }

    const prompt = promptInput.value.trim();

    if (!prompt) {
        alert("Please enter a valid prompt");
        image.style.display = "none";
        image.src = "";
        return;
    }

    // Show spinner, hide image
    button.disabled = true; // Disable button to prevent multiple clicks
    spinner.style.display = "block";
    image.style.display = "none"; 
    image.style.opacity = "0.3"; // Set low opacity for loading state
    image.src = ""; // Clear previous image

    try {
        // Send the prompt to the backend
        const res = await fetch("http://localhost:3000/generate", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ prompt })
        });

        // Parse response from the backend
        let data;
        try {
            data = await res.json();
        } catch {
            throw new Error("Invalid server response");
        }

        // If backend returns an error status, throw an error
        if (!res.ok) {
            throw new Error(data.error || "Server error");
        }

        if (!data.image) {
            throw new Error("No image URL returned");
        }

        // Load the image and display it
        image.onload = () => {
            image.style.opacity = "1";
        };

        image.style.display = "block";
        image.src = data.image;

        // Fallback for cached images
        if (image.complete) {
            image.style.opacity = "1";
        }

    } catch (error) {
        console.error(error);
        alert("Something went wrong");
    } finally {
        spinner.style.display = "none";
        button.disabled = false; // Re-enable button
    }
}