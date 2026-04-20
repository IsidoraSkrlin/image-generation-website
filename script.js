console.log("Script loaded successfully!");

async function generate() {
    const prompt = document.getElementById("prompt").value;

    if (!prompt) {
        alert("Please enter something");
        return;
    }

    const image = document.getElementById("result");
    image.src = "";

    try {
        const res = await fetch("http://localhost:3000/generate", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ prompt })
        });

        const data = await res.json();

        console.log("FROM BACKEND:", data.image);

        image.src = data.image;

    } catch (error) {
        console.error(error);
        alert("Something went wrong");
    }
}