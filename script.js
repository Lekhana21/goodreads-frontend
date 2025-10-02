const BASE_URL = "https://shortline-production-railway.up.railway.app"; // Railway backend URL
const resultsGrid = document.getElementById("resultsGrid");
const searchInput = document.getElementById("searchInput");
const genreFilter = document.getElementById("genreFilter");

let books = [];

// --- Fetch all books from backend ---
async function fetchAllBooks() {
    try {
        const response = await fetch(`${BASE_URL}/api/books`);
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        books = await response.json();
        displayBooks(books);
    } catch (err) {
        console.error("Error fetching books:", err);
        resultsGrid.innerHTML = "<p style='text-align:center; color:red;'>Failed to load books.</p>";
    }
}

// --- Display books in grid ---
function displayBooks(bookList) {
    resultsGrid.innerHTML = "";

    if (bookList.length === 0) {
        const noResult = document.createElement("p");
        noResult.textContent = "No results found.";
        noResult.style.gridColumn = "1/-1";
        noResult.style.textAlign = "center";
        noResult.style.fontSize = "18px";
        noResult.style.color = "#555";
        resultsGrid.appendChild(noResult);
        return;
    }

    bookList.forEach(book => {
        const card = document.createElement("div");
        card.classList.add("book-card");

        card.innerHTML = `
            <img src="${book.image || 'assets/placeholder.png'}" alt="Book Poster">
            <h3>${book.title}</h3>
            <p>Author: ${book.author}</p>
            <p>Rating: ${book.rating}</p>
            <p>Genre: ${book.genre}</p>
            <button class="delete-btn">Delete</button>
        `;

        // Open modal
        card.addEventListener("click", (e) => {
            if (!e.target.classList.contains("delete-btn")) {
                document.getElementById("modalTitle").textContent = book.title;
                document.getElementById("modalAuthor").textContent = "Author: " + book.author;
                document.getElementById("modalGenre").textContent = "Genre: " + book.genre;
                document.getElementById("modalRating").textContent = "Rating: " + book.rating;
                document.getElementById("modalDescription").textContent = book.description || "No description available.";
                document.getElementById("modalImage").src = book.image || "assets/placeholder.png";
                document.getElementById("bookModal").style.display = "block";
            }
        });

        // Delete book
        card.querySelector(".delete-btn").addEventListener("click", async () => {
            if (!book.id) return alert("Cannot delete book without backend ID.");
            try {
                const res = await fetch(`${BASE_URL}/api/books/${book.id}`, { method: "DELETE" });
                if (res.ok) {
                    books = books.filter(b => b.id !== book.id);
                    displayBooks(books);
                    console.log("Book deleted:", book.title);
                } else {
                    console.error("Failed to delete book:", book.title);
                }
            } catch (err) {
                console.error("Error deleting book:", err);
            }
        });

        resultsGrid.appendChild(card);
    });
}

// --- Modal close ---
document.querySelector(".close").addEventListener("click", () => {
    document.getElementById("bookModal").style.display = "none";
});
window.addEventListener("click", (e) => {
    if (e.target.id === "bookModal") {
        document.getElementById("bookModal").style.display = "none";
    }
});

// --- Filter books ---
function filterBooks() {
    const query = searchInput.value.toLowerCase();
    const genre = genreFilter.value;

    const filteredBooks = books.filter(book =>
        (book.title.toLowerCase().includes(query) || book.author.toLowerCase().includes(query)) &&
        (genre === "" || book.genre === genre)
    );
    displayBooks(filteredBooks);
}

searchInput.addEventListener("input", filterBooks);
genreFilter.addEventListener("change", filterBooks);

// --- Add new book ---
const addBookForm = document.getElementById("addBookForm");
addBookForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const title = document.getElementById("newTitle").value;
    const author = document.getElementById("newAuthor").value;
    const genre = document.getElementById("newGenre").value;
    const rating = document.getElementById("newRating").value;
    const description = document.getElementById("newDescription").value;
    const fileInput = document.getElementById("newImage");
    const file = fileInput.files[0];

    const addBookToBackend = async (imageSrc) => {
        const newBook = { title, author, genre, rating, description, image: imageSrc || "assets/placeholder.png" };

        try {
            const res = await fetch(`${BASE_URL}/api/books`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(newBook)
            });
            if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
            const data = await res.json();
            books.push(data); // Use backend-generated ID
            displayBooks(books);
            addBookForm.reset();
            console.log("Book added to backend:", data);
        } catch (err) {
            console.error("Error sending book to backend:", err);
        }
    };

    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) { addBookToBackend(e.target.result); };
        reader.readAsDataURL(file);
    } else {
        addBookToBackend("assets/placeholder.png");
    }
});

// --- Initialize ---
fetchAllBooks();
