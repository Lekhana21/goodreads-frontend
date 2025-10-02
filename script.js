const BASE_URL = "https://shortline-production-railway.up.railway.app"; // Railway backend URL
const resultsGrid = document.getElementById("resultsGrid");
const searchInput = document.getElementById("searchInput");
const genreFilter = document.getElementById("genreFilter");

let books = [];

// Fetch books from backend
function fetchAllBooks() {
    fetch(`${BASE_URL}/api/books`)
        .then(response => response.json())
        .then(data => {
            books = data;
            displayBooks(books);
        })
        .catch(err => console.error("Error fetching books:", err));
}

// Display books in grid
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
            <img src="${book.image}" alt="Book Poster">
            <h3>${book.title}</h3>
            <p>Author: ${book.author}</p>
            <p>Rating: ${book.rating}</p>
            <p>Genre: ${book.genre}</p>
            <button class="delete-btn">Delete</button>
        `;

        card.addEventListener("click", (e) => {
          if(!e.target.classList.contains("delete-btn")){
            document.getElementById("modalTitle").textContent = book.title;
            document.getElementById("modalAuthor").textContent = "Author: " + book.author;
            document.getElementById("modalGenre").textContent = "Genre: " + book.genre;
            document.getElementById("modalRating").textContent = "Rating: " + book.rating;
            document.getElementById("modalDescription").textContent = book.description || "No description available.";
            document.getElementById("modalImage").src = book.image;
            document.getElementById("bookModal").style.display = "block";
          }
        });

        // Delete button
        card.querySelector(".delete-btn").addEventListener("click", () => {
          fetch(`${BASE_URL}/api/books/${book.id}`, { method: "DELETE" })
                .then(res => {
                    if (res.ok) {
                        console.log("Book deleted:", book.title);
                        books = books.filter(b => b.id !== book.id);
                        displayBooks(books);
                    } else {
                        console.error("Failed to delete book:", book.title);
                    }
                })
                .catch(err => console.error("Error deleting book:", err));
        });

        resultsGrid.appendChild(card);
    });
}

// Modal close
document.querySelector(".close").addEventListener("click", () => {
    document.getElementById("bookModal").style.display = "none";
});

window.addEventListener("click", (e) => {
    if (e.target.id === "bookModal") {
        document.getElementById("bookModal").style.display = "none";
    }
});

// Filter books
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

// Initial display
displayBooks(books);
fetchAllBooks();

// Add new book
const addBookForm = document.getElementById("addBookForm");
addBookForm.addEventListener("submit", (e) => {
    e.preventDefault();

    const title = document.getElementById("newTitle").value;
    const author = document.getElementById("newAuthor").value;
    const genre = document.getElementById("newGenre").value;
    const rating = document.getElementById("newRating").value;
    const description = document.getElementById("newDescription").value;
    const fileInput = document.getElementById("newImage");
    const file = fileInput.files[0];

    const addBook = (imageSrc) => {
        const newBook = { title, author, genre, rating, description, image: imageSrc || "assets/placeholder.png" };
        books.push(newBook);
        displayBooks(books);
        addBookForm.reset();

        // Send to backend
        fetch(`${BASE_URL}/api/books`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(newBook)
        })
        .then(res => res.json())
        .then(data => console.log("Book added to backend:", data))
        .catch(err => console.error("Error sending book to backend:", err));
    };

    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) { addBook(e.target.result); };
        reader.readAsDataURL(file);
    } else {
        addBook("assets/placeholder.png");
    }
});
